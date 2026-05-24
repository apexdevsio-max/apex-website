"use client";

import { useEffect, useRef, useState } from "react";

type ElementSize = { width: number; height: number; cssWidth: number; cssHeight: number };

export function ChromaVideoBackground({
  isVisible,
  onReady,
}: {
  isVisible: boolean;
  onReady?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef<ElementSize>({ width: 0, height: 0, cssWidth: 0, cssHeight: 0 });
  const visibleRef = useRef(isVisible);
  visibleRef.current = isVisible;

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const el = canvasRef.current;
    if (!video || !el) return;
    const heroCanvas: HTMLCanvasElement = el;
    const heroVideo: HTMLVideoElement = video;

    const updateSize = () => {
      const rect = heroCanvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = {
        width: Math.floor(rect.width * dpr),
        height: Math.floor(rect.height * dpr),
        cssWidth: rect.width,
        cssHeight: rect.height,
      };
      heroCanvas.width = sizeRef.current.width;
      heroCanvas.height = sizeRef.current.height;
      heroCanvas.style.width = `${sizeRef.current.cssWidth}px`;
      heroCanvas.style.height = `${sizeRef.current.cssHeight}px`;
    };

    const ro = new ResizeObserver(updateSize);
    ro.observe(heroCanvas);
    updateSize();

    const md = window.matchMedia("(min-width: 768px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let gl: WebGL2RenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let texture: WebGLTexture | null = null;
    let rafId = 0;
    let stopped = false;
    let initialized = false;
    const cropY = 0.028;
    const cropX = 0.004;
    const loopTrimStart = 0.06;
    let cropLocation: WebGLUniformLocation | null = null;
    let positionBuffer: WebGLBuffer | null = null;
    let positionLoc = 0;
    let videoReady = false;
    let videoMeta = { w: 0, h: 0, dur: 0 };
    let isSeeking = false;
    let chromaThrottleTimer: ReturnType<typeof setTimeout> | null = null;

    const VS = `#version 300 es
      in vec2 a_position;
      out vec2 v_uv;
      void main() {
        v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const FS = `#version 300 es
      precision highp float;
      uniform sampler2D u_tex;
      uniform vec4 u_crop;
      in vec2 v_uv;
      out vec4 fragColor;

      vec3 rgb2hsv(vec3 c) {
        vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0*d + e)), d / (q.x + e), q.x);
      }

      void main() {
        vec2 uv = vec2(
          mix(u_crop.x, 1.0 - u_crop.z, v_uv.x),
          mix(u_crop.y, 1.0 - u_crop.w, v_uv.y)
        );
        vec4 col = texture(u_tex, uv);
        vec3 hsv = rgb2hsv(col.rgb);

        float hue = hsv.x;
        float sat = hsv.y;
        float val = hsv.z;

        float hueDist = abs(hue - 0.33);
        hueDist = min(hueDist, 1.0 - hueDist);

        float greenMask = 1.0 - smoothstep(0.05, 0.14, hueDist);
        greenMask *= smoothstep(0.25, 0.45, sat);
        greenMask *= smoothstep(0.08, 0.20, val);

        float isCyanBlue = smoothstep(0.44, 0.47, hue) * (1.0 - smoothstep(0.72, 0.75, hue));
        greenMask *= (1.0 - isCyanBlue);

        vec3 rgb = col.rgb;
        float alpha = 1.0 - greenMask;
        if (greenMask > 0.0 && alpha > 0.01) {
          float degreen = greenMask * 0.8;
          rgb.g = mix(rgb.g, min(rgb.g, (rgb.r + rgb.b) * 0.55), degreen);
        }

        fragColor = vec4(rgb, alpha);
      }
    `;

    function compileShader(glCtx: WebGL2RenderingContext, type: number, src: string) {
      const shader = glCtx.createShader(type)!;
      glCtx.shaderSource(shader, src);
      glCtx.compileShader(shader);
      return shader;
    }

    function initGL() {
      gl = heroCanvas.getContext("webgl2", {
        premultipliedAlpha: false,
        alpha: true,
      }) as WebGL2RenderingContext | null;

      if (!gl) return false;

      const vs = compileShader(gl, gl.VERTEX_SHADER, VS);
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS);
      program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
      gl.useProgram(program);

      positionBuffer = gl.createBuffer();
      positionLoc = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.uniform1i(gl.getUniformLocation(program, "u_tex"), 0);
      cropLocation = gl.getUniformLocation(program, "u_crop");
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      return true;
    }

    function updateQuad(cssW: number, cssH: number, vw: number, vh: number) {
      if (!gl || !positionBuffer) return;
      const vAspect = vw / vh;
      const cAspect = cssW / cssH;
      let l = -1, r = 1, b = -1, t = 1;
      if (vAspect > cAspect) {
        const scale = cAspect / vAspect;
        l = -scale;
        r = scale;
      } else {
        const scale = vAspect / cAspect;
        b = -scale;
        t = scale;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([l, b, r, b, l, t, r, b, r, t, l, t]),
        gl.DYNAMIC_DRAW,
      );
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    }

    function renderFrame() {
      if (stopped || !gl || !program || !texture) return;
      if (!visibleRef.current) {
        chromaThrottleTimer = setTimeout(() => {
          if (!stopped) rafId = requestAnimationFrame(renderFrame);
        }, 200);
        return;
      }

      if (!videoReady || videoMeta.w === 0 || isSeeking) {
        rafId = requestAnimationFrame(renderFrame);
        return;
      }

      if (videoMeta.dur > 0 && heroVideo.currentTime >= videoMeta.dur - 0.08) {
        heroVideo.currentTime = loopTrimStart;
      }

      const s = sizeRef.current;
      if (s.cssWidth > 0 && s.cssHeight > 0) {
        updateQuad(s.cssWidth, s.cssHeight, videoMeta.w, videoMeta.h);
      }
      gl.viewport(0, 0, s.width, s.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (cropLocation) gl.uniform4f(cropLocation, cropX, cropY, cropX, cropY);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, heroVideo);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!initialized) {
        initialized = true;
        setReady(true);
        onReady?.();
      }

      rafId = requestAnimationFrame(renderFrame);
    }

    const onLoadedMetadata = () => {
      videoMeta = { w: heroVideo.videoWidth, h: heroVideo.videoHeight, dur: heroVideo.duration };
    };

    const onCanPlay = () => { videoReady = true; };

    const onSeeking = () => { isSeeking = true; };

    const onSeeked = () => { isSeeking = false; };

    heroVideo.addEventListener("loadedmetadata", onLoadedMetadata);
    heroVideo.addEventListener("canplay", onCanPlay);
    heroVideo.addEventListener("seeking", onSeeking);
    heroVideo.addEventListener("seeked", onSeeked);

    if (heroVideo.readyState >= 2) {
      videoReady = true;
      videoMeta = { w: heroVideo.videoWidth, h: heroVideo.videoHeight, dur: heroVideo.duration };
    }

    const start = async () => {
      if (!md.matches || rm.matches) return;
      stopped = false;
      if (!gl && !initGL()) return;
      try {
        heroVideo.currentTime = loopTrimStart;
        await heroVideo.play();
        renderFrame();
      } catch { /* ignore */ }
    };

    const handleMediaChange = () => { void start(); };
    md.addEventListener("change", handleMediaChange);
    rm.addEventListener("change", handleMediaChange);

    const chromaIdleId = requestIdleCallback(() => { void start(); }, { timeout: 2000 });

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      heroVideo.pause();
      if (chromaThrottleTimer) clearTimeout(chromaThrottleTimer);
      cancelIdleCallback(chromaIdleId);
      heroVideo.removeEventListener("loadedmetadata", onLoadedMetadata);
      heroVideo.removeEventListener("canplay", onCanPlay);
      heroVideo.removeEventListener("seeking", onSeeking);
      heroVideo.removeEventListener("seeked", onSeeked);
      md.removeEventListener("change", handleMediaChange);
      rm.removeEventListener("change", handleMediaChange);
      ro.disconnect();
    };
  }, [onReady]);

  return (
    <>
      <video
        ref={videoRef}
        muted
        playsInline
        preload="none"
        className="pointer-events-none absolute top-0 h-px w-px opacity-0"
        aria-hidden="true"
      >
        <source src="/videos/robot_welcome.mp4" type="video/mp4" />
      </video>
      <div
        className="hidden md:block absolute z-40 pointer-events-none"
        style={{
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          contain: "layout paint size",
        }}
      >
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          style={{
            width: "100%",
            height: "100%",
            filter: "brightness(1.03) contrast(1.05) saturate(1.08)",
          }}
          aria-hidden="true"
        />
      </div>
    </>
  );
}
