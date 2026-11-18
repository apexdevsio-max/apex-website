"use client";

import { useEffect, useRef } from "react";

import { useIsDesktop } from "@/lib/hooks/useIsDesktop";

type Node = { x: number; y: number };

/**
 * The hero's node-and-line mesh, desktop only.
 *
 * It used to run a 30fps animation loop, but each node moved under 0.1px per
 * second, so the picture was effectively static while costing main-thread time
 * every frame. It is now drawn once per size: the same look, no loop. Node
 * positions are kept across resizes so the mesh does not jump.
 */
export function ParticleBackground() {
  const isDesktop = useIsDesktop();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isDesktop) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Positions as fractions of the canvas, so a resize scales the mesh.
    let nodes: Node[] = [];

    const draw = (cssWidth: number, cssHeight: number) => {
      if (cssWidth <= 0 || cssHeight <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      if (nodes.length === 0) {
        const count = Math.max(20, Math.min(40, Math.floor(cssWidth / 40)));
        nodes = Array.from({ length: count }, () => ({ x: Math.random(), y: Math.random() }));
      }
      const points = nodes.map((n) => ({ x: n.x * cssWidth, y: n.y * cssHeight }));

      for (let i = 0; i < points.length; i += 1) {
        const p = points[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(88,220,255,0.75)";
        ctx.fill();

        for (let j = i + 1; j < points.length; j += 1) {
          const q = points[j];
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
    };

    if (typeof ResizeObserver !== "function") {
      draw(canvas.clientWidth, canvas.clientHeight);
      return;
    }
    const ro = new ResizeObserver(([entry]) => draw(entry.contentRect.width, entry.contentRect.height));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-30 h-full w-full pointer-events-none opacity-70"
      aria-hidden="true"
    />
  );
}
