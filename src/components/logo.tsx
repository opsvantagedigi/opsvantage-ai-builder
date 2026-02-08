export function OpsVantageLogo() {
  return (
    <svg
      width="200"
      height="50"
      viewBox="0 0 800 200"
      xmlns="http://www.w3.org/2000/svg"
      className="w-48 h-12"
    >
      <defs>
        <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#00008B', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#006400', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
        </linearGradient>
        <style>
          {`
            .brand-text {
              font-family: 'Orbitron', 'Arial Black', sans-serif;
              font-size: 80px;
              font-weight: 700;
              fill: url(#brandGradient);
              text-transform: uppercase;
              letter-spacing: 2px;
            }
          `}
        </style>
      </defs>
      <text
        x="50%"
        y="55%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="brand-text"
      >
        OpsVantage Digital
      </text>
    </svg>
  );
}
