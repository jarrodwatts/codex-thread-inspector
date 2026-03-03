import { useMemo } from "react";

interface HalftoneBarProps {
  height?: number;
  className?: string;
}

const GRID = 6;
const COLS = 240;

function seededRand(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263 + 1013904223) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

function density(col: number, row: number, cols: number, rows: number): number {
  const nx = col / cols;
  const ny = row / rows;

  const d1 = Math.abs(Math.sin((nx * 3.5 + ny * 2.0) * Math.PI));
  const d2 = Math.abs(Math.cos((nx * 5.0 - ny * 1.5) * Math.PI));
  const d3 = Math.abs(Math.sin((nx * 1.2 - ny * 4.0) * Math.PI));

  const combined = d1 * 0.4 + d2 * 0.35 + d3 * 0.25;
  const edge = 1 - Math.abs(ny - 0.5) * 2;
  return combined * edge;
}

export function HalftoneBar({ height = 48, className }: HalftoneBarProps) {
  const rows = Math.floor(height / GRID);
  const viewW = COLS * GRID;
  const viewH = rows * GRID;

  const dots = useMemo(() => {
    const result: { cx: number; cy: number; r: number; o: number }[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < COLS; col++) {
        const d = density(col, row, COLS, rows);
        const threshold = seededRand(col, row) * 0.65;
        if (d > threshold) {
          const r = 0.4 + d * 1.1;
          const o = 0.3 + d * 0.6;
          result.push({
            cx: col * GRID + GRID / 2,
            cy: row * GRID + GRID / 2,
            r,
            o,
          });
        }
      }
    }
    return result;
  }, [rows]);

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ width: "100%", height, display: "block" }}
      aria-hidden="true"
    >
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill="#fafafa"
          opacity={dot.o}
        />
      ))}
    </svg>
  );
}
