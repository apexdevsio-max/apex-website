"use client";

import { useEffect, useRef } from "react";

type ElementSize = { width: number; height: number; cssWidth: number; cssHeight: number };

export function ParticleBackground({ isVisible }: { isVisible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef<ElementSize>({ width: 0, height: 0, cssWidth: 0, cssHeight: 0 });
  const visibleRef = useRef(isVisible);
  visibleRef.current = isVisible;

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
        cssHeight: rect.height,
      };
      canvas.width = sizeRef.current.width;
      canvas.height = sizeRef.current.height;
      canvas.style.width = `${sizeRef.current.cssWidth}px`;
      canvas.style.height = `${sizeRef.current.cssHeight}px`;
    };

    const ro = new ResizeObserver(updateSize);
    ro.observe(canvas);
    updateSize();

    const ctx = canvas.getContext("2d");
    if (!ctx) { ro.disconnect(); return; }

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let stopped = false;

    type Particle = { x: number; y: number; vx: number; vy: number };
    let nodes: Particle[] = [];

    let lastTime = 0;
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    const draw = (time: number) => {
      const dpr = window.devicePixelRatio || 1;
      const s = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = s.cssWidth;
      const h = s.cssHeight;
      if (!nodes.length) {
        const count = Math.max(24, Math.min(60, Math.floor(w / 30)));
        nodes = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.002,
          vy: (Math.random() - 0.5) * 0.002,
        }));
      }
      if (stopped) return;
      if (!visibleRef.current) {
        throttleTimer = setTimeout(() => {
          if (!stopped) raf = requestAnimationFrame(draw);
        }, 200);
        return;
      }
      const dt = lastTime ? Math.min((time - lastTime) / 16.67, 4) : 1;
      lastTime = time;
      ctx.clearRect(0, 0, s.width, s.height);

      for (let i = 0; i < nodes.length; i += 1) {
        const p = nodes[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;

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
      draw(0);
    };

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf);
      const s = sizeRef.current;
      ctx.clearRect(0, 0, s.width, s.height);
    };

    const handleMotionChange = () => {
      if (rm.matches) stop();
      else start();
    };

    rm.addEventListener("change", handleMotionChange);

    const idleId = requestIdleCallback(() => start(), { timeout: 1500 });

    return () => {
      stop();
      if (throttleTimer) clearTimeout(throttleTimer);
      cancelIdleCallback(idleId);
      rm.removeEventListener("change", handleMotionChange);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-30 h-full w-full pointer-events-none opacity-70"
      style={{
        backgroundImage: "none",
        backgroundColor: "transparent",
        contain: "layout paint size",
      }}
      aria-hidden="true"
    />
  );
}
