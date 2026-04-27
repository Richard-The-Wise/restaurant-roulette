export function RouletteIconArtwork({ size }: { size: number }) {
  const center = size / 2;
  const boardSize = size * 0.74;
  const boardOffset = (size - boardSize) / 2;
  const pointerWidth = size * 0.12;
  const pointerHeight = size * 0.14;
  const centerDisk = size * 0.18;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, rgba(255,255,255,0.18), transparent 28%), linear-gradient(180deg, #0f172a 0%, #020617 100%)"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: size * 0.06,
          borderRadius: size * 0.22,
          border: `${Math.max(4, size * 0.012)}px solid rgba(255,255,255,0.1)`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)"
        }}
      />

      <svg
        width={boardSize}
        height={boardSize}
        viewBox={`0 0 ${boardSize} ${boardSize}`}
        style={{
          position: "absolute",
          left: boardOffset,
          top: boardOffset
        }}
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy={size * 0.02} stdDeviation={size * 0.028} floodColor="#020617" floodOpacity="0.28" />
          </filter>
        </defs>

        <circle
          cx={boardSize / 2}
          cy={boardSize / 2}
          r={boardSize / 2 - size * 0.018}
          fill="#ffffff"
          opacity="0.98"
          filter="url(#shadow)"
        />

        <g transform={`translate(${boardSize / 2} ${boardSize / 2})`}>
          <path d={`M 0 0 L 0 ${-(boardSize / 2 - size * 0.04)} A ${boardSize / 2 - size * 0.04} ${boardSize / 2 - size * 0.04} 0 0 1 ${boardSize * 0.36} ${-(boardSize * 0.12)} Z`} fill="#14b8a6" />
          <path d={`M 0 0 L ${boardSize * 0.36} ${-(boardSize * 0.12)} A ${boardSize / 2 - size * 0.04} ${boardSize / 2 - size * 0.04} 0 0 1 ${boardSize * 0.3} ${boardSize * 0.26} Z`} fill="#f6bf3e" />
          <path d={`M 0 0 L ${boardSize * 0.3} ${boardSize * 0.26} A ${boardSize / 2 - size * 0.04} ${boardSize / 2 - size * 0.04} 0 0 1 ${-(boardSize * 0.34)} ${boardSize * 0.22} Z`} fill="#e76f51" />
          <path d={`M 0 0 L ${-(boardSize * 0.34)} ${boardSize * 0.22} A ${boardSize / 2 - size * 0.04} ${boardSize / 2 - size * 0.04} 0 0 1 ${-(boardSize * 0.28)} ${-(boardSize * 0.28)} Z`} fill="#30a7d7" />
          <path d={`M 0 0 L ${-(boardSize * 0.28)} ${-(boardSize * 0.28)} A ${boardSize / 2 - size * 0.04} ${boardSize / 2 - size * 0.04} 0 0 1 0 ${-(boardSize / 2 - size * 0.04)} Z`} fill="#0f172a" />
        </g>

        <circle cx={boardSize / 2} cy={boardSize / 2} r={centerDisk} fill="#0f172a" />
        <circle cx={boardSize / 2} cy={boardSize / 2} r={centerDisk * 0.72} fill="#111827" stroke="#1f2937" strokeWidth={size * 0.01} />
      </svg>

      <div
        style={{
          position: "absolute",
          left: center - pointerWidth / 2,
          top: size * 0.08,
          width: 0,
          height: 0,
          borderLeft: `${pointerWidth / 2}px solid transparent`,
          borderRight: `${pointerWidth / 2}px solid transparent`,
          borderTop: `${pointerHeight}px solid #ef4444`,
          filter: `drop-shadow(0 ${Math.max(4, size * 0.014)}px ${Math.max(10, size * 0.03)}px rgba(15,23,42,0.3))`
        }}
      />
    </div>
  );
}
