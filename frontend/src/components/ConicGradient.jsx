export default function ConicGradient({
  className = "",
  size = 900,
  blur = 90,
  opacity = 0.35,
}) {
  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={{
        width: size,
        height: size,
        opacity,
        filter: `blur(${blur}px)`,
        borderRadius: "9999px",
        background:
          "conic-gradient(from 180deg at 50% 50%, #60a5fa, #a78bfa, #22d3ee, #f472b6, #60a5fa)",
      }}
    />
  );
}
