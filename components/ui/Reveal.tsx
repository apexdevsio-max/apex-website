"use client";

import { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
  offsetY?: number;
  durationMs?: number;
};

export function Reveal({
  children,
  delay = 0,
  className = "",
  threshold = 0.1,
  offsetY = 22,
  durationMs = 650,
}: RevealProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${offsetY}px)`,
        transition: `opacity ${durationMs}ms ${delay}ms ease, transform ${durationMs}ms ${delay}ms ease`,
      }}
    >
      {children}
    </div>
  );
}
