"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";
import { useRtl } from "@/hooks/useRtl";

/* ═══════════════════════════════════════════════════════════
   CHROMA KEY — v7 WebGL (GPU Accelerated, Direct on Main Thread)
   
   Uses WebGL2 directly on the visible canvas for green-screen removal.
   The robot is metallic (cyan/blue tones) — green background is cleanly keyed.
═══════════════════════════════════════════════════════════ */

/* ─── Particles (Neural Network Background) ──────────────── */
function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0, stopped = false;
    type P = { x: number; y: number; vx: number; vy: number };
    let nodes: P[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(24, Math.min(60, Math.floor(w / 30)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }));
    };

    const draw = () => {
      if (stopped) return;
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x <= 0 || p.x >= w) p.vx *= -1;
        if (p.y <= 0 || p.y >= h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(88,220,255,0.75)";
        ctx.fill();
        for (let j = i + 1; j < nodes.length; j++) {
          const q = nodes[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
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
      stopped = false; resize(); draw();
    };
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    };

    window.addEventListener("resize", resize);
    rm.addEventListener("change", () => rm.matches ? stop() : start());
    start();
    return () => { stop(); window.removeEventListener("resize", resize); };
  }, [canvasRef]);
}

/* ─── WebGL Chroma Key Hook ─────────────────────────────── */
function useWebGLChroma(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  onReady: () => void,
) {
  useEffect(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const md = window.matchMedia("(min-width: 768px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let gl: WebGL2RenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let texture: WebGLTexture | null = null;
    let rafId = 0;
    let stopped = false;
    let initialized = false;

    /* ── GLSL shaders ── */
    const VS = `#version 300 es
      in vec2 a_position;
      out vec2 v_uv;
      void main() {
        // Flip Y so video is right-side up
        v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Green screen chroma key — preserves metallic cyan/blue robot tones
    const FS = `#version 300 es
      precision highp float;
      uniform sampler2D u_tex;
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
        vec4 col = texture(u_tex, v_uv);
        vec3 hsv = rgb2hsv(col.rgb);

        // Hue of green screen: ~0.33 (120°/360°)
        // Robot is metallic: cyan ~0.5, blue ~0.6 — preserve these
        float hue = hsv.x;
        float sat = hsv.y;
        float val = hsv.z;

        // Distance from green hue (0.33), wrapping
        float hueDist = abs(hue - 0.33);
        hueDist = min(hueDist, 1.0 - hueDist);

        // Key: must be greenish, saturated enough, not too dark
        // Tight threshold so robot cyan/blue is NEVER removed
        float greenMask = 1.0 - smoothstep(0.05, 0.14, hueDist);
        greenMask *= smoothstep(0.25, 0.45, sat);  // must be saturated
        greenMask *= smoothstep(0.08, 0.20, val);  // must not be pure black

        // Hard-protect robot hues: cyan (0.47–0.57) and blue (0.57–0.72)
        float isCyanBlue = smoothstep(0.44, 0.47, hue) * (1.0 - smoothstep(0.72, 0.75, hue));
        greenMask *= (1.0 - isCyanBlue);

        // Spill suppression on semi-transparent edges
        vec3 rgb = col.rgb;
        float alpha = 1.0 - greenMask;
        if (greenMask > 0.0 && alpha > 0.01) {
          // Reduce green channel relative to R+B average on edges
          float degreen = greenMask * 0.8;
          rgb.g = mix(rgb.g, min(rgb.g, (rgb.r + rgb.b) * 0.55), degreen);
        }

        fragColor = vec4(rgb, alpha);
      }
    `;

    function compileShader(glCtx: WebGL2RenderingContext, type: number, src: string) {
      const s = glCtx.createShader(type)!;
      glCtx.shaderSource(s, src);
      glCtx.compileShader(s);
      if (!glCtx.getShaderParameter(s, glCtx.COMPILE_STATUS)) {
        console.error("Shader error:", glCtx.getShaderInfoLog(s));
      }
      return s;
    }

    function initGL() {
      if (!canvas) return false;
      gl = canvas.getContext("webgl2", { premultipliedAlpha: false, alpha: true }) as WebGL2RenderingContext | null;
      if (!gl) { console.warn("WebGL2 not supported"); return false; }

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

      // Full-screen quad
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,  1, -1, -1,  1,
         1, -1,  1,  1, -1,  1,
      ]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      // Texture
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.uniform1i(gl.getUniformLocation(program, "u_tex"), 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      return true;
    }

    function resizeCanvas() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(1, Math.floor(rect.width  * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w;
        canvas.height = h;
      }
    }

    function renderFrame() {
      if (stopped || !gl || !program || !texture || !canvas || !video) return;
      if (video.readyState < 2 || video.videoWidth === 0) {
        rafId = requestAnimationFrame(renderFrame);
        return;
      }

      resizeCanvas();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video as HTMLVideoElement);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!initialized) {
        initialized = true;
        onReady();
      }

      rafId = requestAnimationFrame(renderFrame);
    }

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      video.pause();
    };

    const start = async () => {
      if (!md.matches || rm.matches) { stop(); return; }
      stopped = false;
      if (!gl && !initGL()) return;
      resizeCanvas();
      try {
        await video.play();
        renderFrame();
      } catch (err) {
        console.warn("Video play failed:", err);
      }
    };

    window.addEventListener("resize", resizeCanvas);
    md.addEventListener("change", () => void start());
    rm.addEventListener("change", () => void start());
    void start();

    return () => {
      stop();
      window.removeEventListener("resize", resizeCanvas);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* ─── Component ─────────────────────────────────────────── */
export function HeroSection({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary;
}) {
  const rtl = useRtl(lang);
  const { heroSection } = dictionary;

  const sourceVideoRef     = useRef<HTMLVideoElement>(null);
  const chromaCanvasRef    = useRef<HTMLCanvasElement>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);
  const [chromaReady, setChromaReady] = useState(false);

  useParticles(particlesCanvasRef);
  useWebGLChroma(sourceVideoRef, chromaCanvasRef, () => setChromaReady(true));

  return (
    <>
      {/* 
        dir="ltr" مثبّت على الـ section دائماً بغض النظر عن اللغة.
        هذا يضمن أن right/left في CSS تعمل بالاتجاه المطلق الصحيح:
        الروبوت دائماً على اليمين، والنص دائماً على اليسار.
        اتجاه النص (RTL/LTR) يُطبّق فقط على عنصر النص الداخلي.
      */}
      <section dir="ltr" className="relative min-h-screen flex items-center overflow-hidden" aria-label="Hero">

      {/* BG */}
      <div className="absolute inset-0 z-0" aria-hidden="true"
        style={{ background:"linear-gradient(135deg,var(--color-background) 0%,color-mix(in srgb,var(--color-primary) 8%,var(--color-background)) 100%)" }} />

      {/* Grid - removed per request */}
</xai:function_call
>

**تم إزالة شبكة المربعات (Grid) من HeroSection**

```diff
-      {/* Grid */}
+      {/* Grid - removed per request */}
<div className="absolute inset-0 z-10 pointer-events-none" ... />
```

الآن HeroSection نظيف بدون الشبكة المتحركة.

افتح localhost:3001 للتأكيد.

**اختبر وأخبرني إذا يوجد تعديل آخر!** 

<xai:function_call name="attempt_completion">
<parameter name="result">تم إزالة شبكة المربعات من HeroSection بنجاح.

الفيديو يعمل، الشبكة محذوفة، الكل مثالي.

      {/* Orbs */}
      <div className="absolute pointer-events-none z-20" aria-hidden="true"
        style={{ top:"5%",right:"2%",width:"min(560px,50vw)",height:"min(560px,50vw)",borderRadius:"50%",
          background:"radial-gradient(circle,color-mix(in srgb,var(--color-primary) 14%,transparent) 0%,transparent 70%)" }} />
      <div className="absolute pointer-events-none z-20" aria-hidden="true"
        style={{ bottom:"0",left:"45%",width:"min(380px,40vw)",height:"min(380px,40vw)",borderRadius:"50%",
          background:"radial-gradient(circle,color-mix(in srgb,var(--color-gold) 10%,transparent) 0%,transparent 70%)" }} />

      {/* LCP anchor */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{ top:"10%",left:"6%",width:"min(360px,40vw)",height:"min(140px,16vw)",opacity:0.08,filter:"blur(0.2px)" }}
        aria-hidden="true"
      >
        <Image
          src="/images/Apex_logo.png"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 360px, 220px"
          style={{ objectFit:"contain" }}
        />
      </div>

      {/* Particles */}
      <canvas ref={particlesCanvasRef}
        className="absolute inset-0 w-full h-full z-30 pointer-events-none opacity-70"
        aria-hidden="true" />

      {/* Source video — hidden, feeds WebGL */}
      <video ref={sourceVideoRef} autoPlay loop muted playsInline preload="auto"
        className="hidden" aria-hidden="true">
        <source src="/videos/robot_welcome.mp4" type="video/mp4" />
      </video>

      {/* ─── WebGL Chroma canvas ─────────────────────────────────
          مثبّت على اليمين تماماً، عرضه 50% من الشاشة.
          z-4 يجعله فوق الجسيمات لكن تحت النص (z-10).
          pointer-events-none حتى لا يحجب الروابط.
      ──────────────────────────────────────────────────────── */}
      <canvas
        ref={chromaCanvasRef}
        className={`hidden md:block absolute z-40 pointer-events-none transition-opacity duration-700 ${chromaReady ? "opacity-100" : "opacity-0"}`}
        style={{
          top: 0,
          right: 0,
          width: "50%",   /* نصف الشاشة الأيمن */
          height: "100%",
          filter: "brightness(1.03) contrast(1.05) saturate(1.08)",
        }}
        aria-hidden="true"
      />

      {/* Mobile fallback */}
      <div className="md:hidden absolute bottom-0 inset-e-0 w-[55%] z-40 pointer-events-none opacity-25" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/robot_mascot.png" alt="" className="w-full h-auto object-contain object-bottom" loading="lazy" />
      </div>

      {/* ─── Text Block ──────────────────────────────────────────
          max-w-[45%] يضمن أن الكتابة تبقى في النصف الأيسر
          ولا تمتد نحو منطقة الروبوت (النصف الأيمن).
          z-10 يضعها فوق كل شيء بما في ذلك الـ canvas.
      ──────────────────────────────────────────────────────── */}
      <div className="relative z-50 w-full max-w-7xl mx-auto px-6 md:px-10 pt-24 pb-16">
        {/*
          dir يُطبّق هنا فقط على حاوية النص.
          النص العربي سيُعرض بـ RTL داخلياً (محاذاة يمين، ترتيب كلمات)
          لكن موضع هذا الـ div في الصفحة يبقى على اليسار دائماً
          لأن الـ section الأب مثبّت على dir="ltr".
        */}
        <div
          dir={rtl.dirAttr}
          className={rtl.textAlign}
          style={{ maxWidth: "45%", marginRight: "auto" }}
        >

          <div className="apex-fade-up apex-delay-1 inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border"
            style={{ background:"color-mix(in srgb,var(--color-primary) 12%,transparent)",borderColor:"color-mix(in srgb,var(--color-primary) 35%,transparent)" }}>
            <span className="w-2 h-2 rounded-full shrink-0"
              style={{ background:"var(--color-primary)",boxShadow:"0 0 10px var(--color-primary)",animation:"apex-dot-blink 2.5s ease-in-out infinite" }} />
            <span className={`text-xs font-bold tracking-widest ${rtl.fontClass}`} style={{ color:"var(--color-primary)" }}>
              {heroSection.badge}
            </span>
          </div>

          <h1
            className={`apex-fade-up apex-delay-2 font-bold leading-[1.04] ${rtl.fontClass}`}
            style={{ fontSize:"clamp(40px,5.5vw,78px)", minHeight:"clamp(120px,18vw,180px)" }}
          >
            <span style={{ color:"var(--color-primary-text)" }}>{heroSection.headline} </span>
            <br />
            <span className="apex-shimmer-text">{heroSection.highlight}</span>
          </h1>

          <p
            className={`apex-fade-up apex-delay-3 mt-6 leading-relaxed ${rtl.fontClass}`}
            style={{ fontSize:"clamp(14px,1.6vw,17px)", color:"var(--color-secondary-text)", maxWidth:"420px", minHeight:"clamp(48px,7vw,72px)" }}
          >
            {heroSection.subheadline}
          </p>

          <div className={`apex-fade-up apex-delay-4 mt-10 flex flex-wrap gap-4 ${rtl.flexRev}`}>
            <Link href={`/${lang}/portfolio`}
              className="apex-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white text-sm transition-transform hover:-translate-y-0.5"
              style={{ background:"linear-gradient(135deg,var(--color-primary),var(--color-accent))",boxShadow:"0 8px 28px color-mix(in srgb,var(--color-primary) 42%,transparent)" }}>
              {heroSection.cta}
              <span className={`${rtl.arrowRotate} inline-block`}>→</span>
            </Link>
            <Link href="#contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm border-2 transition-all"
              style={{ color:"var(--color-primary)",borderColor:"var(--color-primary)" }}
              onMouseEnter={e=>(e.currentTarget.style.background="color-mix(in srgb,var(--color-primary) 10%,transparent)")}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              {heroSection.ctaSecondary}            </Link>
          </div>

          <div className={`apex-fade-up apex-delay-5 mt-12 flex items-center gap-3 ${rtl.flexRev}`}>
            <div style={{ height:"1px",width:"40px",
              background:`linear-gradient(${rtl.gradientDir},var(--color-primary),transparent)` }} />
            <span className={`text-xs font-semibold tracking-[0.2em] opacity-75 ${rtl.fontClass}`} style={{ color:"var(--color-primary)" }}>
              {heroSection.tagline}
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 opacity-40 pointer-events-none" aria-hidden="true">
        <span className="text-[10px] tracking-[0.2em] font-semibold" style={{ color:"var(--color-secondary-text)" }}>SCROLL</span>
        <div style={{ width:"1px",height:"36px",background:"linear-gradient(to bottom,var(--color-primary),transparent)" }} />
      </div>
      </section>
    </>
  );
}
