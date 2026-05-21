export default function LocaleLoading() {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center px-6"
      style={{ background: "var(--color-background)" }}
    >
      <div className="text-center">
        <div
          className="w-8 h-8 rounded-full mx-auto mb-4"
          style={{
            border: "3px solid var(--color-border)",
            borderTopColor: "var(--color-primary)",
            animation: "apex-spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "var(--color-secondary-text)", fontSize: "14px" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}
