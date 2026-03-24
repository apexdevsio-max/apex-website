/// <reference lib="webworker" />

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

self.onmessage = (e: MessageEvent) => {
  const { type, canvas, width, height, dpr } = e.data;
  
  if (type === 'init') {
    const offscreen = canvas as OffscreenCanvas;
    const ctx = offscreen.getContext('2d')!;
    
    let particles: Particle[] = [];
    let rafId: number;
    
    const resize = (w: number, h: number) => {
      offscreen.width = w * dpr;
      offscreen.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      const count = Math.max(24, Math.min(60, Math.floor(w / 30)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }));
    };
    
    const draw = () => {
      const w = offscreen.width / dpr;
      const h = offscreen.height / dpr;
      
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, w, h);
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        
        if (p.x <= 0 || p.x >= w) p.vx *= -1;
        if (p.y <= 0 || p.y >= h) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(88,220,255,0.75)';
        ctx.fill();
        
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(88,220,255,${(0.38 * (1 - dist / 130)).toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      
      rafId = (self as any).requestAnimationFrame(draw);
    };
    
    resize(width, height);
    draw();
    
    self.postMessage({ type: 'workerReady' });
    
    (self as any).addEventListener('visibilitychange', () => {
      if (document.hidden) {
        (self as any).cancelAnimationFrame(rafId);
      } else {
        draw();
      }
    });
  }
};

