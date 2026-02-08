export function OpsVantageLogo() {
  return (
    <svg
      width="200"
      height="50"
      viewBox="0 0 800 200"
      xmlns="http://www.w3.org/2000/svg"
      className="w-48 h-12"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#00008B', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#006400', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <text
        x="400"
        y="110"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "80px",
          fontWeight: 700,
          fill: "url(#brandGradient)",
          textTransform: "uppercase",
          letterSpacing: "2px",
        }}
      >
        OpsVantage
      </text>
    </svg>
  );
}
