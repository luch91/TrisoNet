"use client";
import { useState, useMemo } from "react";
import { cn, formatCompact } from "@/lib/utils";
import type { Candle } from "@/lib/coin-data";

const TIMEFRAMES = [
  { id: "15M", take: 16 },
  { id: "1H", take: 22 },
  { id: "4H", take: 30 },
  { id: "1D", take: 36 },
  { id: "1W", take: 36 },
  { id: "ALL", take: 36 },
];

const W = 760;
const H = 300;
const VOL_H = 56;
const PAD_R = 56; // room for price axis labels

export default function PriceChart({
  candles,
  change = 0,
  caption,
}: {
  candles: Candle[];
  change?: number;
  caption?: string;
}) {
  const [tf, setTf] = useState("4H");
  const active = TIMEFRAMES.find((t) => t.id === tf) ?? TIMEFRAMES[2];
  const view = useMemo(() => candles.slice(-active.take), [candles, active.take]);

  const { hi, lo } = useMemo(() => {
    let hi = -Infinity, lo = Infinity;
    for (const c of view) { hi = Math.max(hi, c.h); lo = Math.min(lo, c.l); }
    const pad = (hi - lo) * 0.08 || hi * 0.01;
    return { hi: hi + pad, lo: lo - pad };
  }, [view]);

  const maxVol = useMemo(() => Math.max(...view.map((c) => c.v), 1), [view]);
  const chartW = W - PAD_R;
  const priceH = H - VOL_H - 8;
  const step = chartW / view.length;
  const bodyW = Math.max(2, step * 0.6);

  const y = (p: number) => priceH - ((p - lo) / (hi - lo)) * priceH;
  const last = view[view.length - 1];
  const up = change >= 0;

  // price axis gridlines
  const lines = [0, 0.25, 0.5, 0.75, 1].map((f) => lo + (hi - lo) * f);

  return (
    <div>
      {/* controls */}
      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {TIMEFRAMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTf(t.id)}
            className={cn(
              "px-2.5 py-1 rounded text-caption font-medium transition-colors",
              tf === t.id ? "bg-primary text-ink" : "text-ink-subtle hover:text-ink hover:bg-primary-50"
            )}
          >
            {t.id}
          </button>
        ))}
        {caption && <span className="text-caption text-ink-subtle ml-2 hidden sm:inline">{caption}</span>}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W} / ${H}` }} role="img" aria-label="Price chart">
        {/* gridlines + axis labels */}
        {lines.map((p, i) => (
          <g key={i}>
            <line x1={0} x2={chartW} y1={y(p)} y2={y(p)} stroke="rgb(var(--p100))" strokeWidth={1} strokeDasharray="2 4" />
            <text x={chartW + 6} y={y(p) + 3} fontSize={10} fill="rgb(var(--ink-subtle))">{formatCompact(p)}</text>
          </g>
        ))}

        {/* candles */}
        {view.map((c, i) => {
          const cx = i * step + step / 2;
          const isUp = c.c >= c.o;
          const color = isUp ? "rgb(var(--up))" : "rgb(var(--down))";
          const yo = y(c.o), yc = y(c.c);
          const bodyTop = Math.min(yo, yc);
          const bodyH = Math.max(1.5, Math.abs(yc - yo));
          return (
            <g key={i}>
              <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth={1.2} />
              <rect x={cx - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} fill={color} rx={0.5} />
              {/* volume */}
              <rect
                x={cx - bodyW / 2}
                y={H - (c.v / maxVol) * VOL_H}
                width={bodyW}
                height={(c.v / maxVol) * VOL_H}
                fill={color}
                opacity={0.28}
              />
            </g>
          );
        })}

        {/* current price marker */}
        <line x1={0} x2={chartW} y1={y(last.c)} y2={y(last.c)} stroke={up ? "rgb(var(--up))" : "rgb(var(--down))"} strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
        <g transform={`translate(${chartW}, ${y(last.c)})`}>
          <rect x={0} y={-9} width={PAD_R} height={18} rx={3} fill={up ? "rgb(var(--up))" : "rgb(var(--down))"} />
          <text x={PAD_R / 2} y={3} fontSize={10} fontWeight={700} fill="#fff" textAnchor="middle">{formatCompact(last.c)}</text>
        </g>

        <text x={4} y={H - 2} fontSize={10} fill="rgb(var(--ink-subtle))">VOL</text>
      </svg>
    </div>
  );
}
