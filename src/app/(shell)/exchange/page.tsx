"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { GKWTH, TICKER, type CoinAuction, type Candle } from "@/lib/coin-data";
import { formatNaira, formatCompact, timeLeft, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import ExchangeShell from "@/components/exchange/ExchangeShell";
import Button from "@/components/ui/Button";
import { Search, Flame, ArrowUpRight, Bell } from "lucide-react";

const TABS = ["All Markets", "Ending Soon", "High Volume", "New Listings"] as const;
type Tab = (typeof TABS)[number];

const ENDING_SOON_MS = 30 * 60 * 1000;

export default function MarketsPage() {
  const { state } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("All Markets");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    let list = [...state.coinAuctions];
    if (tab === "Ending Soon") {
      list = list
        .filter((a) => a.status === "live")
        .sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime());
    } else if (tab === "High Volume") {
      list = list.sort((a, b) => b.bids - a.bids);
    } else if (tab === "New Listings") {
      list = list.sort((a, b) => b.id.localeCompare(a.id));
    }
    const term = q.trim().toLowerCase();
    if (term) list = list.filter((a) => a.sellerName.toLowerCase().includes(term) || a.id.includes(term) || a.pair.toLowerCase().includes(term));
    return list;
  }, [state.coinAuctions, tab, q]);

  const endingSoon = state.coinAuctions.find((a) => a.status === "live" && new Date(a.endsAt).getTime() - Date.now() < ENDING_SOON_MS);

  return (
    <PageTransition>
      <ExchangeShell>
        {/* Ticker */}
        <div className="flex items-center gap-5 overflow-x-auto pb-3 mb-4 border-b border-primary-100 scrollbar-thin">
          {TICKER.map((t) => {
            const up = t.change >= 0;
            return (
              <Link key={t.id} href={`/exchange/${t.id}`} className="flex items-center gap-2 shrink-0 group">
                <span className="text-caption text-ink-subtle">#{t.id} {t.name}</span>
                <span className="text-small font-semibold text-ink group-hover:text-primary-600 transition-colors">{t.value}</span>
                <span className={cn("text-caption font-medium", up ? "text-secondary" : "text-error")}>
                  {up ? "+" : ""}{t.change}%
                </span>
              </Link>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <Stat label="24h Trading Vol" value={formatCompact(GKWTH.volume24h)} sub="+12.4% vs yesterday" tone="up" />
          <Stat label="Total Bids Today" value={GKWTH.totalBidsToday.toLocaleString()} sub={`+${GKWTH.bidsLastHour} in last hour`} tone="up" />
          <Stat label="GKWTH / NGN Price" value={formatNaira(GKWTH.price)} sub={`+₦380 (+${GKWTH.change24h}%)`} tone="up" />
          <Stat label="Live Auctions" value={String(GKWTH.liveAuctions)} sub={`${GKWTH.endingWithinHour} ending within 1h`} tone="neutral" />
        </div>

        {/* Tabs + search */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-small font-medium whitespace-nowrap transition-colors",
                  tab === t ? "bg-primary-50 text-primary-700" : "text-ink-subtle hover:text-ink hover:bg-bg"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative ml-auto w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search pairs or sellers..."
              className="w-full pl-9 pr-3 py-2 rounded-md border border-primary-200 bg-bg text-small focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-primary-100 bg-surface shadow-card overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.4fr_0.8fr_1fr_0.9fr_0.7fr_0.5fr_0.8fr_0.8fr_0.9fr] gap-3 px-4 py-2.5 text-caption font-medium text-ink-subtle uppercase tracking-wide border-b border-primary-100 bg-surface-2">
            <span>Pair / Seller</span><span>Amount</span><span>Last bid</span><span>Unit price</span><span>Change</span><span>Bids</span><span>Time left</span><span>Trend</span><span className="text-right">Action</span>
          </div>
          <div className="divide-y divide-primary-100">
            {rows.map((a) => <MarketRow key={a.id} a={a} onTrade={() => router.push(`/exchange/${a.id}`)} />)}
            {rows.length === 0 && <div className="px-4 py-12 text-center text-small text-ink-subtle">No markets match your search.</div>}
          </div>
        </div>

        {/* Ending soon banner */}
        {endingSoon && (
          <div className="mt-4 rounded-xl border border-error/30 bg-error-50 px-4 py-3 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-small font-semibold text-error"><Flame className="w-4 h-4" /> Ending soon</span>
            <p className="text-small text-ink">
              GKWTH/NGN #{endingSoon.id} ({endingSoon.amount} GKWTH) closes in {timeLeft(endingSoon.endsAt)} · Top bid {formatNaira(endingSoon.topBid)} · {endingSoon.bids} bids from {endingSoon.bidders} bidders
            </p>
            <Link href={`/exchange/${endingSoon.id}`} className="ml-auto"><Button size="sm" variant="destructive">Bid now</Button></Link>
          </div>
        )}
      </ExchangeShell>
    </PageTransition>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "up" | "down" | "neutral" }) {
  return (
    <div className="rounded-xl border border-primary-100 bg-surface shadow-card p-4">
      <p className="text-caption text-ink-subtle uppercase tracking-wide">{label}</p>
      <p className="text-h3 font-bold text-ink mt-1">{value}</p>
      <p className={cn("text-caption mt-0.5", tone === "up" ? "text-secondary" : tone === "down" ? "text-error" : "text-ink-subtle")}>{sub}</p>
    </div>
  );
}

function MarketRow({ a, onTrade }: { a: CoinAuction; onTrade: () => void }) {
  const up = a.change >= 0;
  return (
    <div className="grid grid-cols-2 md:grid-cols-[1.4fr_0.8fr_1fr_0.9fr_0.7fr_0.5fr_0.8fr_0.8fr_0.9fr] gap-3 px-4 py-3 items-center hover:bg-primary-50/50 transition-colors text-small">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={cn("w-2 h-2 rounded-full shrink-0", a.status === "live" ? "bg-secondary" : a.status === "starting_soon" ? "bg-warning" : "bg-ink-subtle")} />
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{a.pair} <span className="text-ink-subtle">#{a.id}</span></p>
          <p className="text-caption text-ink-subtle truncate">by {a.sellerName}</p>
        </div>
      </div>
      <span className="text-ink tabular-nums">{a.amount} GKWTH</span>
      <span className="font-semibold text-primary-700 tabular-nums">{formatNaira(a.topBid)}</span>
      <span className="text-ink-subtle tabular-nums hidden md:inline">{formatNaira(a.unitPrice)}</span>
      <span className={cn("font-medium tabular-nums", up ? "text-secondary" : "text-error")}>{up ? "+" : ""}{a.change}%</span>
      <span className="text-ink tabular-nums hidden md:inline">{a.bids || "—"}</span>
      <span className={cn("tabular-nums hidden md:inline", a.status === "live" && new Date(a.endsAt).getTime() - Date.now() < ENDING_SOON_MS ? "text-error font-medium" : "text-ink-subtle")}>
        {a.status === "starting_soon" ? `Starts ${timeLeft(a.startsAt ?? a.endsAt)}` : a.status === "live" ? timeLeft(a.endsAt) : "Closed"}
      </span>
      <span className="hidden md:flex"><Sparkline candles={a.candles} up={up} /></span>
      <div className="flex justify-end col-span-2 md:col-span-1">
        <RowAction a={a} onTrade={onTrade} />
      </div>
    </div>
  );
}

function RowAction({ a, onTrade }: { a: CoinAuction; onTrade: () => void }) {
  if (a.status === "ended" || a.status === "sold") {
    return <span className="px-3 py-1.5 rounded-md text-caption font-medium text-ink-subtle bg-bg border border-primary-100">Closed</span>;
  }
  if (a.status === "starting_soon") {
    return <Button size="sm" variant="outline" onClick={onTrade}><Bell className="w-3.5 h-3.5" /> Notify me</Button>;
  }
  const closingSoon = new Date(a.endsAt).getTime() - Date.now() < ENDING_SOON_MS;
  return closingSoon
    ? <Button size="sm" variant="destructive" onClick={onTrade}>Bid now</Button>
    : <Button size="sm" onClick={onTrade}>Trade <ArrowUpRight className="w-3.5 h-3.5" /></Button>;
}

function Sparkline({ candles, up }: { candles: Candle[]; up: boolean }) {
  const data = candles.slice(-12);
  const max = Math.max(...data.map((c) => c.h));
  const min = Math.min(...data.map((c) => c.l));
  return (
    <div className="flex items-end gap-0.5 h-7">
      {data.map((c, i) => {
        const h = ((c.c - min) / (max - min || 1)) * 100;
        const candleUp = c.c >= c.o;
        return <span key={i} className={cn("w-1 rounded-sm", candleUp ? "bg-secondary" : "bg-error")} style={{ height: `${Math.max(12, h)}%`, opacity: up ? 1 : 0.6 }} />;
      })}
    </div>
  );
}
