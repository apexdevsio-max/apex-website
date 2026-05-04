/// <reference lib="webworker" />

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface InitMessageData {
  type: "init";
  canvas: OffscreenCanvas;
  width: number;
  height: number;
  dpr: number;
}

type WorkerMessageData = InitMessageData;

const workerScope = self as DedicatedWorkerGlobalScope;

workerScope.onmessage = (event: MessageEvent<WorkerMessageData>) => {
  const { type, canvas, width, height, dpr } = event.data;
  if (type !== "init") return;

  const context = canvas.getContext("2d");
  if (!context) return;

  let particles: Particle[] = [];
  const running = true;

  const resize = (nextWidth: number, nextHeight: number) => {
    canvas.width = nextWidth * dpr;
    canvas.height = nextHeight * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(24, Math.min(60, Math.floor(nextWidth / 30)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * nextWidth,
      y: Math.random() * nextHeight,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
    }));
  };

  const draw = () => {
    if (!running) return;

    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    context.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i += 1) {
      const particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x <= 0 || particle.x >= w) particle.vx *= -1;
      if (particle.y <= 0 || particle.y >= h) particle.vy *= -1;

      context.beginPath();
      context.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
      context.fillStyle = "rgba(88,220,255,0.75)";
      context.fill();

      for (let j = i + 1; j < particles.length; j += 1) {
        const neighbor = particles[j];
        const distance = Math.hypot(particle.x - neighbor.x, particle.y - neighbor.y);
        if (distance >= 130) continue;

        context.strokeStyle = `rgba(88,220,255,${(0.38 * (1 - distance / 130)).toFixed(3)})`;
        context.lineWidth = 0.8;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(neighbor.x, neighbor.y);
        context.stroke();
      }
    }

    setTimeout(draw, 16);
  };

  resize(width, height);
  draw();
  workerScope.postMessage({ type: "workerReady" });
};
