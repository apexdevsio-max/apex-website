"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { useRtl } from "@/hooks/useRtl";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";

function useCanvasSize(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const sizeRef = useRef({ width: 0, height: 0, cssWidth: 0, cssHeight: 0 });
  const dprRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = {
        width: Math.floor(rect.width * dpr),
        height: Math.floor(rect.height * dpr),
        cssWidth: rect.width,
        cssHeight: rect.height
      };
      dprRef.current = dpr;
      canvas.width = sizeRef.current.width;
      canvas.height = sizeRef.current.height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvas);

    updateSize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [canvasRef]);

  return { sizeRef, dprRef };
}

function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const { sizeRef, dprRef } = useCanvasSize(canvasRef as React.RefObject<HTMLCanvasElement>);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let stopped = false;

    type Particle = { x: number; y: number; vx: number; vy: number };
    let nodes: Particle[] = [];

    const resize = () => {
      const dpr = dprRef.current;
      const s = sizeRef.current;
      const w = s.cssWidth;
      const h = s.cssHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(24, Math.min(60, Math.floor(w / 30)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }));
    };

    const draw = () => {
      if (stopped) return;

      const s = sizeRef.current;
      ctx.clearRect(0, 0, s.width, s.height);

      for (let i = 0; i < nodes.length; i += 1) {
        const p = nodes[i];
        p.x += p.vx;
        p.y += p.vy;

        const w = s.cssWidth;
        const h = s.cssHeight;
        if (p.x <= 0 || p.x >= w) p.vx *= -1;
        if (p.y <= 0 || p.y >= h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(88,220,255,0.75)";
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j += 1) {
          const q = nodes[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(88,220,255,${(0.38 * (1 - dist / 130)).toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (rm.matches) return;
      stopped = false;
      resize();
      draw();
    };

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf);
      const s = sizeRef.current;
      ctx.clearRect(0, 0, s.width, s.height);
    };

    const handleMotionChange = () => {
      if (rm.matches) {
        stop();
      } else {
        start();
      }
    };

    rm.addEventListener("change", handleMotionChange);
    start();

    return () => {
      stop();
      rm.removeEventListener("change", handleMotionChange);
    };
  }, [canvasRef]);
}

function useWebGLChroma(
  primaryVideoRef: React.RefObject<HTMLVideoElement | null>,
  secondaryVideoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  onReady: () => void,
) {
  const { sizeRef, dprRef } = useCanvasSize(canvasRef as React.RefObject<HTMLCanvasElement>);

  useEffect(() => {
    const primaryVideo = primaryVideoRef.current;
    const secondaryVideo = secondaryVideoRef.current;
    const canvas = canvasRef.current;
    if (!primaryVideo || !secondaryVideo || !canvas) return;
    const heroCanvas = canvas;

    const md = window.matchMedia("(min-width: 768px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let gl: WebGL2RenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let texture: WebGLTexture | null = null;
    let rafId = 0;
    let videoFrameId: number | null = null;
    let stopped = false;
    let initialized = false;
    const loopTrimStart = 0.06;
    const loopPrimeAt = 0.18;
    const switchAt = 0.045;
    const cropY = 0.028;
    const cropX = 0.004;
    let activeVideo = primaryVideo;
    let standbyVideo = secondaryVideo;
    let standbyPrimed = false;
    let primingStandby = false;
    let hasStarted = false;
    let cropLocation: WebGLUniformLocation | null = null;

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
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error("Shader error:", glCtx.getShaderInfoLog(shader));
      }
      return shader;
    }

    function initGL() {
      gl = heroCanvas.getContext("webgl2", {
        premultipliedAlpha: false,
        alpha: true,
      }) as WebGL2RenderingContext | null;

      if (!gl) {
        console.warn("WebGL2 not supported");
        return false;
      }

      const vs = compileShader(gl, gl.VERTEX_SHADER, VS);
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS);
      program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        return false;
      }

      gl.useProgram(program);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
        gl.STATIC_DRAW,
      );

      const loc = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

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

function resizeCanvas() {
      if (gl) {
        const s = sizeRef.current;
        gl.viewport(0, 0, s.width, s.height);
      }
    }

    function applyCropUniform() {
      if (!gl || !cropLocation) return;
      gl.uniform4f(cropLocation, cropX, cropY, cropX, cropY);
    }

    function seekVideo(video: HTMLVideoElement, time: number) {
      return new Promise<void>((resolve) => {
        if (Math.abs(video.currentTime - time) < 0.001) {
          resolve();
          return;
        }

        const complete = () => resolve();
        video.addEventListener("seeked", complete, { once: true });
        video.currentTime = time;
      });
    }

    function resetVideo(video: HTMLVideoElement) {
      video.pause();
      primingStandby = false;
      standbyPrimed = false;
      video.currentTime = loopTrimStart;
    }

    // ─── FIX: انتظر canplay بدلاً من التحقق الفوري من readyState ───
    async function primeStandbyVideo() {
      if (primingStandby || standbyPrimed || stopped) return;
      primingStandby = true;

      try {
        standbyVideo.pause();
        await seekVideo(standbyVideo, loopTrimStart);
        await standbyVideo.play();

        await new Promise<void>((resolve) => {
          if (standbyVideo.readyState >= 3) {
            standbyPrimed = true;
            resolve();
            return;
          }
          standbyVideo.addEventListener(
            "canplay",
            () => {
              standbyPrimed = true;
              resolve();
            },
            { once: true },
          );
        });
      } catch (error) {
        primingStandby = false;
        console.warn("Standby video prime failed:", error);
      }
    }

    function swapVideos() {
      const previousActive = activeVideo;
      activeVideo = standbyVideo;
      standbyVideo = previousActive;

      // انقل الـ ended listener للفيديو الجديد النشط
      standbyVideo.removeEventListener("ended", handleVideoEnded);
      activeVideo.addEventListener("ended", handleVideoEnded);

      standbyPrimed = false;
      primingStandby = false;
      standbyVideo.pause();
      standbyVideo.currentTime = loopTrimStart;

      // ─── FIX: تأكد من استمرار الـ render loop بعد الـ swap ───
      if (!stopped) {
        scheduleNextFrame();
      }
    }

    // ─── FIX: fallback مضمون عند انتهاء الفيديو ───
    async function handleVideoEnded() {
      if (stopped) return;

      if (standbyPrimed && standbyVideo.readyState >= 2) {
        swapVideos();
      } else {
        // الـ standby لم يكن جاهزاً — أعد تشغيل نفس الفيديو كـ fallback
        try {
          await seekVideo(activeVideo, loopTrimStart);
          await activeVideo.play();
          scheduleNextFrame();
        } catch (e) {
          console.warn("Loop restart failed:", e);
        }
      }
    }

    function renderFrame() {
      if (stopped || !gl || !program || !texture) return;

      if (activeVideo.readyState < 2 || activeVideo.videoWidth === 0) {
        scheduleNextFrame();
        return;
      }

      const remaining =
        activeVideo.duration > 0
          ? activeVideo.duration - activeVideo.currentTime
          : Infinity;

      if (remaining <= loopPrimeAt) {
        void primeStandbyVideo();
      }

      if (
        standbyPrimed &&
        standbyVideo.readyState >= 2 &&
        standbyVideo.currentTime >= loopTrimStart + switchAt
      ) {
        swapVideos();
        // swapVideos يستدعي scheduleNextFrame داخله — لا نكمل هنا
        return;
      }

    resizeCanvas();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    applyCropUniform();

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, activeVideo);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!initialized) {
        initialized = true;
        onReady();
      }

      scheduleNextFrame();
    }

    function scheduleNextFrame() {
      if (stopped) return;

      const videoWithFrameCallback = activeVideo as HTMLVideoElement & {
        requestVideoFrameCallback?: (callback: () => void) => number;
        cancelVideoFrameCallback?: (handle: number) => void;
      };

      if (typeof videoWithFrameCallback.requestVideoFrameCallback === "function") {
        videoFrameId = videoWithFrameCallback.requestVideoFrameCallback(() => {
          videoFrameId = null;
          renderFrame();
        });
        return;
      }

      rafId = requestAnimationFrame(renderFrame);
    }

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(rafId);

      const videoWithFrameCallback = activeVideo as HTMLVideoElement & {
        cancelVideoFrameCallback?: (handle: number) => void;
      };
      if (
        videoFrameId !== null &&
        typeof videoWithFrameCallback.cancelVideoFrameCallback === "function"
      ) {
        videoWithFrameCallback.cancelVideoFrameCallback(videoFrameId);
        videoFrameId = null;
      }

      // ─── FIX: أزل الـ listeners عند الإيقاف ───
      primaryVideo.removeEventListener("ended", handleVideoEnded);
      secondaryVideo.removeEventListener("ended", handleVideoEnded);

      primaryVideo.pause();
      secondaryVideo.pause();
    };

    const start = async () => {
    if (!md.matches || rm.matches) {
      stop();
      return;
    }

    stopped = false;
    if (!gl && !initGL()) return;
    await seekVideo(primaryVideo, loopTrimStart);
    await seekVideo(secondaryVideo, loopTrimStart);
    activeVideo = primaryVideo;
    standbyVideo = secondaryVideo;
    standbyPrimed = false;
    primingStandby = false;

      // ─── FIX: سجّل الـ ended listener على الفيديو النشط ───
      primaryVideo.removeEventListener("ended", handleVideoEnded);
      secondaryVideo.removeEventListener("ended", handleVideoEnded);
      activeVideo.addEventListener("ended", handleVideoEnded);

      try {
        if (!hasStarted) {
          await activeVideo.play();
          hasStarted = true;
        } else if (activeVideo.paused) {
          await activeVideo.play();
        }
        renderFrame();
      } catch (error) {
        console.warn("Video play failed:", error);
      }
    };

    const handleMediaChange = () => {
      void start();
    };

    md.addEventListener("change", handleMediaChange);
    rm.addEventListener("change", handleMediaChange);
    void start();

    return () => {
      stop();
      resetVideo(primaryVideo);
      resetVideo(secondaryVideo);
      md.removeEventListener("change", handleMediaChange);
      rm.removeEventListener("change", handleMediaChange);
    };
  }, [canvasRef, onReady, primaryVideoRef, secondaryVideoRef]);
}

export function HeroSection({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary;
}) {
  const rtl = useRtl(lang);
  const { heroSection } = dictionary;
  const scrollLabel = lang === "ar" ? "مرر" : "SCROLL";

  const sourceVideoRef = useRef<HTMLVideoElement>(null);
  const standbyVideoRef = useRef<HTMLVideoElement>(null);
  const chromaCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);
  const [chromaReady, setChromaReady] = useState(false);

  useParticles(particlesCanvasRef);
  useWebGLChroma(sourceVideoRef, standbyVideoRef, chromaCanvasRef, () => setChromaReady(true));

  return (
    <section
      dir="ltr"
      className="relative flex min-h-screen items-center overflow-hidden"
      style={{ backgroundImage: "none" }}
      aria-label="Hero"
    >
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(135deg,var(--color-background) 0%,color-mix(in srgb,var(--color-primary) 8%,var(--color-background)) 100%)",
          backgroundImage: "none",
        }}
      />

      <div
        className="absolute pointer-events-none z-20"
        aria-hidden="true"
        style={{
          top: "5%",
          right: "2%",
          width: "min(560px,50vw)",
          height: "min(560px,50vw)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle,color-mix(in srgb,var(--color-primary) 14%,transparent) 0%,transparent 70%)",
        }}
      />

      <div
        className="absolute pointer-events-none z-20"
        aria-hidden="true"
        style={{
          bottom: "0",
          left: "45%",
          width: "min(380px,40vw)",
          height: "min(380px,40vw)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle,color-mix(in srgb,var(--color-gold) 10%,transparent) 0%,transparent 70%)",
        }}
      />

      <div
        className="absolute z-20 pointer-events-none"
        style={{
          top: "10%",
          left: "6%",
          width: "min(360px,40vw)",
          height: "min(140px,16vw)",
          opacity: 0.08,
          filter: "blur(0.2px)",
        }}
        aria-hidden="true"
      >
        <Image
          src="/images/Apex_logo.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 360px, 220px"
          style={{ objectFit: "contain" }}
        />
      </div>

      <canvas
        ref={particlesCanvasRef}
        className="absolute inset-0 z-30 h-full w-full pointer-events-none opacity-70"
        style={{ backgroundImage: "none", backgroundColor: "transparent" }}
        aria-hidden="true"
      />

      <video
        ref={sourceVideoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="pointer-events-none absolute -left-2499.75 top-0 h-px w-px opacity-0"
        aria-hidden="true"
      >
        <source src="/videos/robot_welcome.mp4" type="video/mp4" />
      </video>

      <video
        ref={standbyVideoRef}
        muted
        playsInline
        preload="auto"
        className="pointer-events-none absolute -left-2499.75 top-0 h-px w-px opacity-0"
        aria-hidden="true"
      >
        <source src="/videos/robot_welcome.mp4" type="video/mp4" />
      </video>

      <canvas
        ref={chromaCanvasRef}
        className={`absolute z-40 hidden pointer-events-none transition-opacity duration-700 md:block ${
          chromaReady ? "opacity-100" : "opacity-0"
        }`}
        style={{
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          filter: "brightness(1.03) contrast(1.05) saturate(1.08)",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute bottom-0 inset-e-0 z-40 w-[55%] pointer-events-none opacity-25 md:hidden"
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/robot_mascot.webp"
          alt=""
          className="h-auto w-full object-contain object-bottom"
          loading="lazy"
        />
      </div>

      <div className="relative z-50 mx-auto w-full max-w-7xl px-6 pb-16 pt-24 md:px-10">
        <div
          dir={rtl.dirAttr}
          className={rtl.textAlign}
          style={{ maxWidth: "45%", marginRight: "auto" }}
        >
          <div
            className="apex-fade-up apex-delay-1 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{
              background:
                "color-mix(in srgb,var(--color-primary) 12%,transparent)",
              borderColor:
                "color-mix(in srgb,var(--color-primary) 35%,transparent)",
            }}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                background: "var(--color-primary)",
                boxShadow: "0 0 10px var(--color-primary)",
                animation: "apex-dot-blink 2.5s ease-in-out infinite",
              }}
            />
            <span
              className={`text-xs font-bold tracking-widest ${rtl.fontClass}`}
              style={{ color: "var(--color-primary)" }}
            >
              {heroSection.badge}
            </span>
          </div>

          <h1
            className={`apex-fade-up apex-delay-2 font-bold leading-[1.04] ${rtl.fontClass}`}
            style={{
              fontSize: "clamp(40px,5.5vw,78px)",
              minHeight: "clamp(120px,18vw,180px)",
            }}
          >
            <span style={{ color: "var(--color-primary-text)" }}>
              {heroSection.headline}{" "}
            </span>
            <br />
            <span className="apex-shimmer-text">{heroSection.highlight}</span>
          </h1>

          <p
            className={`apex-fade-up apex-delay-3 mt-6 leading-relaxed ${rtl.fontClass}`}
            style={{
              fontSize: "clamp(14px,1.6vw,17px)",
              color: "var(--color-secondary-text)",
              maxWidth: "420px",
              minHeight: "clamp(48px,7vw,72px)",
            }}
          >
            {heroSection.subheadline}
          </p>

          <div className={`apex-fade-up apex-delay-4 mt-10 flex flex-wrap gap-4 ${rtl.flexRev}`}>
            <Link
              href={`/${lang}/portfolio`}
              className="apex-btn inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              style={{
                background:
                  "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
                boxShadow:
                  "0 8px 28px color-mix(in srgb,var(--color-primary) 42%,transparent)",
              }}
            >
              {heroSection.cta}
              <span className={`${rtl.arrowRotate} inline-block`}>→</span>
            </Link>

            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center gap-2 rounded-full border-2 px-8 py-3.5 text-sm font-bold transition-all"
              style={{
                color: "var(--color-primary)",
                borderColor: "var(--color-primary)",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  "color-mix(in srgb,var(--color-primary) 10%,transparent)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "transparent";
              }}
            >
              {heroSection.ctaSecondary}
            </Link>
          </div>

          <div className={`apex-fade-up apex-delay-5 mt-12 flex items-center gap-3 ${rtl.flexRev}`}>
            <div
              style={{
                height: "1px",
                width: "40px",
                background: `linear-gradient(${rtl.gradientDir},var(--color-primary),transparent)`,
              }}
            />
            <span
              className={`text-xs font-semibold tracking-[0.2em] opacity-75 ${rtl.fontClass}`}
              style={{ color: "var(--color-primary)" }}
            >
              {heroSection.tagline}
            </span>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-7 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 opacity-40"
        aria-hidden="true"
      >
        <span
          className={`text-[10px] font-semibold tracking-[0.2em] ${rtl.fontClass}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          {scrollLabel}
        </span>
        <div
          style={{
            width: "1px",
            height: "36px",
            background: "linear-gradient(to bottom,var(--color-primary),transparent)",
          }}
        />
      </div>
    </section>
  );
}