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
  threshold = 0.08,
  offsetY = 22,
  durationMs = 600,
}: RevealProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
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
