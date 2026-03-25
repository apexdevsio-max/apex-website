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
  offsetY = 22,
  durationMs = 650,
}: RevealProps) {
  return (
    <div
      className={`apex-fade-up ${className}`.trim()}
      style={{
        ["--apex-offset" as never]: `${offsetY}px`,
        animationDelay: `${delay}ms`,
        animationDuration: `${durationMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
