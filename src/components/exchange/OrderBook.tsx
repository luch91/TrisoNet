"use client";
import { formatNaira, formatCompact, cn } from "@/lib/utils";
import type { OrderBook as Book } from "@/lib/coin-data";

export default function OrderBook({
  book,
  midPrice,
  change = 0,
}: {
  book: Book;
  midPrice: number;
  change?: number;
}) {
  // Asks shown highest → lowest so the cheapest sits just above the market row.
  const asks = [...book.asks].sort((a, b) => b.price - a.price);
  const bids = [...book.bids].sort((a, b) => b.price - a.price);
  const maxAmt = Math.max(...book.asks.map((l) => l.amount), ...book.bids.map((l) => l.amount), 1);
  const up = change >= 0;

  return (
    <div className="text-small">
      <div className="flex items-center justify-between mb-2">
        <p className="text-caption font-semibold text-ink uppercase tracking-wide">Order book</p>
        <span className="inline-flex items-center gap-1 text-caption font-medium text-secondary px-2 py-0.5 rounded-full bg-secondary-50 border border-secondary-200">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> Live
        </span>
      </div>

      <div className="grid grid-cols-3 text-caption text-ink-subtle px-1 pb-1">
        <span>Price (NGN)</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks */}
      <div className="space-y-px">
        {asks.map((l, i) => (
          <Row key={`a-${i}`} price={l.price} amount={l.amount} maxAmt={maxAmt} tone="down" />
        ))}
      </div>

      {/* Market price */}
      <div className="my-1.5 px-1 py-1.5 rounded-md bg-primary-50 flex items-center justify-between">
        <span className={cn("font-bold", up ? "text-secondary" : "text-error")}>{formatNaira(midPrice)}</span>
        <span className="text-caption text-ink-subtle">Market price</span>
        <span className={cn("text-caption font-medium", up ? "text-secondary" : "text-error")}>
          {up ? "+" : ""}{change}% today
        </span>
      </div>

      {/* Bids */}
      <div className="space-y-px">
        {bids.map((l, i) => (
          <Row key={`b-${i}`} price={l.price} amount={l.amount} maxAmt={maxAmt} tone="up" />
        ))}
      </div>
    </div>
  );
}

function Row({ price, amount, maxAmt, tone }: { price: number; amount: number; maxAmt: number; tone: "up" | "down" }) {
  const pct = Math.min(100, (amount / maxAmt) * 100);
  const isUp = tone === "up";
  return (
    <div className="relative grid grid-cols-3 px-1 py-1 rounded-sm overflow-hidden">
      <div
        className={cn("absolute inset-y-0 right-0", isUp ? "bg-secondary/10" : "bg-error/10")}
        style={{ width: `${pct}%` }}
      />
      <span className={cn("relative font-medium tabular-nums", isUp ? "text-secondary" : "text-error")}>{formatNaira(price)}</span>
      <span className="relative text-right tabular-nums text-ink">{amount.toFixed(1)}</span>
      <span className="relative text-right tabular-nums text-ink-subtle">{formatCompact(price * amount)}</span>
    </div>
  );
}
