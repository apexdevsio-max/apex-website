"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { onIdle, onMediaChange } from "@/lib/browser";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeMotion(callback: () => void) {
  return onMediaChange(window.matchMedia(REDUCED_MOTION), callback);
}

const VS = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

// u_scale maps canvas UVs onto the video so it is fitted ("contain") with its
// own aspect ratio. The old version shrank the quad instead and then sampled the
// whole texture across it, which stretched the robot about 2x horizontally.
const FS = `#version 300 es
precision highp float;
uniform sampler2D u_tex;
uniform vec2 u_scale;
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

float keyAt(vec2 uv) {
  vec3 hsv = rgb2hsv(texture(u_tex, uv).rgb);
  float hueDist = abs(hsv.x - 0.33);
  hueDist = min(hueDist, 1.0 - hueDist);
  float m = 1.0 - smoothstep(0.05, 0.14, hueDist);
  m *= smoothstep(0.25, 0.45, hsv.y);
  m *= smoothstep(0.08, 0.20, hsv.z);
  return m;
}

void main() {
  vec2 fitted = (v_uv - 0.5) * u_scale + 0.5;
  if (fitted.x < 0.0 || fitted.x > 1.0 || fitted.y < 0.0 || fitted.y > 1.0) {
    fragColor = vec4(0.0);
    return;
  }
  vec2 uv = vec2(mix(u_crop.x, 1.0 - u_crop.z, fitted.x), mix(u_crop.y, 1.0 - u_crop.w, fitted.y));
  vec4 col = texture(u_tex, uv);

  // Erode the matte by sampling neighbours: the green fringe around the robot
  // came from edge pixels that were only partly keyed out.
  vec2 px = 1.5 / vec2(textureSize(u_tex, 0));
  float key = max(keyAt(uv), 0.6 * max(max(keyAt(uv + vec2(px.x, 0.0)), keyAt(uv - vec2(px.x, 0.0))),
                                       max(keyAt(uv + vec2(0.0, px.y)), keyAt(uv - vec2(0.0, px.y)))));
  vec3 rgb = col.rgb;
  // Spill suppression: pull residual green toward the red/blue average.
  rgb.g = min(rgb.g, max(rgb.r, rgb.b) * 1.02);
  fragColor = vec4(rgb, 1.0 - key);
}`;

/**
 * Chroma-keyed robot video for the desktop hero. Fills its positioned parent.
 * Calls `onReady` once the first frame is drawn so the hero can fade its static
 * poster out, and never runs (or downloads the video) under reduced motion.
 */
export function ChromaVideoBackground({ isVisible, onReady }: { isVisible: boolean; onReady?: () => void }) {
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visibleRef = useRef(isVisible);
  const onReadyRef = useRef(onReady);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    visibleRef.current = isVisible;
    const video = videoRef.current;
    if (!video) return;
    if (isVisible && !document.hidden) void video.play().catch(() => undefined);
    else video.pause();
  }, [isVisible]);

  useEffect(() => {
    if (reducedMotion) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const gl = canvas.getContext("webgl2", { premultipliedAlpha: false, alpha: true });
    if (!gl) return;

    let program: WebGLProgram | null = null;
    let texture: WebGLTexture | null = null;
    let buffer: WebGLBuffer | null = null;
    let scaleLoc: WebGLUniformLocation | null = null;
    let running = false;
    let disposed = false;
    let frameHandle = 0;
    let drewFirstFrame = false;
    let scaleDirty = true;
    let size = { width: 0, height: 0 };

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const init = (): boolean => {
      const vs = compile(gl.VERTEX_SHADER, VS);
      const fs = compile(gl.FRAGMENT_SHADER, FS);
      program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        program = null;
        return false;
      }
      gl.useProgram(program);

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.uniform1i(gl.getUniformLocation(program, "u_tex"), 0);
      gl.uniform4f(gl.getUniformLocation(program, "u_crop"), 0.004, 0.028, 0.004, 0.028);
      scaleLoc = gl.getUniformLocation(program, "u_scale");
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      return true;
    };

    // Recomputed only when the canvas or the video dimensions change, not per
    // frame. Both usually change before the program exists (metadata loads with
    // preload="auto", resize fires on mount), so the update is deferred to the
    // next draw instead of being dropped.
    const updateScale = () => {
      if (!program || !scaleLoc || !video.videoWidth || !size.width) return;
      scaleDirty = false;
      const videoAspect = video.videoWidth / video.videoHeight;
      const canvasAspect = size.width / size.height;
      gl.uniform2f(scaleLoc, canvasAspect > videoAspect ? canvasAspect / videoAspect : 1, canvasAspect > videoAspect ? 1 : videoAspect / canvasAspect);
    };

    const resize = (cssWidth: number, cssHeight: number) => {
      if (cssWidth <= 0 || cssHeight <= 0) return;
      // Capped: a 3x backing store on a phone-class GPU costs more than it shows.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      size = { width: Math.floor(cssWidth * dpr), height: Math.floor(cssHeight * dpr) };
      canvas.width = size.width;
      canvas.height = size.height;
      scaleDirty = true;
    };

    const draw = () => {
      if (!program || !size.width || video.readyState < 2) return;
      if (scaleDirty) updateScale();
      if (scaleDirty) return;
      gl.viewport(0, 0, size.width, size.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!drewFirstFrame) {
        drewFirstFrame = true;
        setReady(true);
        onReadyRef.current?.();
      }
    };

    // Uploads once per decoded video frame where supported, instead of once per
    // display refresh, which re-uploaded the same 720p frame two to four times.
    const schedule = () => {
      if (!running || disposed) return;
      if ("requestVideoFrameCallback" in video) {
        frameHandle = video.requestVideoFrameCallback(() => {
          draw();
          schedule();
        });
      } else {
        frameHandle = requestAnimationFrame(() => {
          draw();
          schedule();
        });
      }
    };

    const stop = () => {
      running = false;
      if ("cancelVideoFrameCallback" in video) video.cancelVideoFrameCallback(frameHandle);
      cancelAnimationFrame(frameHandle);
      video.pause();
    };

    const start = () => {
      if (disposed || running || document.hidden || !visibleRef.current) return;
      if (!program && !init()) return;
      running = true;
      video.play().then(schedule, () => {
        running = false;
      });
    };

    const ro = typeof ResizeObserver === "function"
      ? new ResizeObserver(([entry]) => resize(entry.contentRect.width, entry.contentRect.height))
      : null;
    if (ro) ro.observe(canvas);
    else resize(canvas.clientWidth, canvas.clientHeight);

    const onMeta = () => {
      scaleDirty = true;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onContextLost = (event: Event) => {
      event.preventDefault();
      stop();
      program = null;
      scaleDirty = true;
      setReady(false);
    };
    const onContextRestored = () => start();

    video.addEventListener("loadedmetadata", onMeta);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    const cancelIdle = onIdle(start, 2000);

    return () => {
      disposed = true;
      stop();
      cancelIdle();
      ro?.disconnect();
      video.removeEventListener("loadedmetadata", onMeta);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      if (texture) gl.deleteTexture(texture);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [reducedMotion]);

  // Under reduced motion no <video> is created, so nothing is downloaded and the
  // hero keeps its static poster.
  if (reducedMotion) return null;

  return (
    <>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="auto"
        className="pointer-events-none absolute h-px w-px opacity-0"
        aria-hidden="true"
      >
        <source src="/videos/robot_welcome.webm" type="video/webm" />
        <source src="/videos/robot_welcome.mp4" type="video/mp4" />
      </video>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        aria-hidden="true"
      />
    </>
  );
}
