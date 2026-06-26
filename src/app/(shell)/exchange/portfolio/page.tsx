"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import type { CoinAuction, CoinTrade } from "@/lib/coin-data";
import { formatNaira, formatCompact, timeLeft, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import ExchangeShell from "@/components/exchange/ExchangeShell";
import Button from "@/components/ui/Button";
import { Plus, Check, Pencil, X } from "lucide-react";

const TABS = ["Open Orders", "Trade History", "Bid Activity", "Analytics"] as const;
type Tab = (typeof TABS)[number];

// Buyers used when a seller accepts the leading bid in the demo.
const SAMPLE_BUYERS = ["Chidi Nwosu", "Amara Okoye", "Yusuf Bello", "Ada Eze"];

export default function PortfolioPage() {
  const { state, dispatch, addToast } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Open Orders");

  // The seller's own listings; fall back to the demo seed so the dashboard always has content.
  const open = useMemo(() => {
    const mine = state.coinAuctions.filter((a) => a.sellerId === state.currentUser.id && a.status === "live");
    if (mine.length) return mine;
    return state.coinAuctions.filter((a) => ["001", "002"].includes(a.id) && a.status === "live");
  }, [state.coinAuctions, state.currentUser.id]);

  const history = state.coinTrades;
  const totalEarned = history.reduce((s, t) => s + t.finalBid, 0);
  const bidsReceived = open.reduce((s, a) => s + a.bids, 0);
  const liveGkwth = open.reduce((s, a) => s + a.amount, 0);

  function acceptBest(a: CoinAuction) {
    const trade: CoinTrade = {
      id: `A-${Math.floor(10000 + Math.random() * 89999)}`,
      auctionId: a.id,
      amount: a.amount,
      buyerId: "buyer-demo",
      buyerName: SAMPLE_BUYERS[Math.floor(Math.random() * SAMPLE_BUYERS.length)],
      sellerId: state.currentUser.id,
      sellerName: state.currentUser.name === "Guest" ? "You" : state.currentUser.name,
      finalBid: a.topBid,
      bids: a.bids,
      date: new Date().toISOString(),
      status: "sold",
      txnId: `TXN-${Math.floor(10000 + Math.random() * 89999)}`,
    };
    dispatch({ type: "COMPLETE_COIN_TRADE", trade, coinDelta: 0 });
    router.push(`/exchange/result/${trade.id}`);
  }

  function endAuction(a: CoinAuction) {
    dispatch({ type: "END_COIN_AUCTION", auctionId: a.id });
    addToast({ type: "info", title: "Auction ended", message: `${a.pair} #${a.id} closed` });
  }

  return (
    <PageTransition>
      <ExchangeShell bare>
        <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
          <div>
            <p className="text-caption text-primary-600 font-semibold uppercase tracking-wide">My portfolio</p>
            <h1 className="text-h1 text-ink mt-1">Auctions &amp; Earnings</h1>
          </div>
          <Link href="/exchange/sell"><Button><Plus className="w-4 h-4" /> New listing</Button></Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Stat label="Active listings" value={String(open.length)} sub={`${liveGkwth} GKWTH live`} />
          <Stat label="Bids received" value={String(bidsReceived || 49)} sub="+12 today" tone="up" />
          <Stat label="Total earned" value={formatCompact(totalEarned || 4_200_000)} sub="+₦920k this week" tone="up" />
          <Stat label="Win rate" value="100%" sub={`All ${32} auctions`} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4 overflow-x-auto border-b border-primary-100">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-3.5 py-2.5 text-small font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                tab === t ? "border-primary text-primary-700" : "border-transparent text-ink-subtle hover:text-ink")}>
              {t}
            </button>
          ))}
        </div>

        {tab === "Open Orders" && (
          <div className="rounded-xl border border-primary-100 bg-surface shadow-card overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr_0.8fr_1fr_0.8fr_0.6fr_0.8fr_0.6fr_1.4fr] gap-3 px-4 py-2.5 text-caption font-medium text-ink-subtle uppercase tracking-wide bg-surface-2 border-b border-primary-100">
              <span>Auction</span><span>Amount</span><span>Top bid</span><span>Unit price</span><span>Bids</span><span>Time left</span><span>Status</span><span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-primary-100">
              {open.map((a) => (
                <div key={a.id} className="grid grid-cols-2 md:grid-cols-[1fr_0.8fr_1fr_0.8fr_0.6fr_0.8fr_0.6fr_1.4fr] gap-3 px-4 py-3 items-center text-small">
                  <div>
                    <p className="font-semibold text-ink">{a.pair}</p>
                    <p className="text-caption text-ink-subtle">#{a.id}</p>
                  </div>
                  <span className="text-ink tabular-nums">{a.amount} GKWTH</span>
                  <span className="font-semibold text-primary-700 tabular-nums">{formatNaira(a.topBid)}</span>
                  <span className="text-ink-subtle tabular-nums hidden md:inline">{formatNaira(a.unitPrice)}</span>
                  <span className="text-ink tabular-nums hidden md:inline">{a.bids}</span>
                  <span className="text-ink-subtle tabular-nums hidden md:inline">{timeLeft(a.endsAt)}</span>
                  <span className="hidden md:inline"><Badge tone="live">Live</Badge></span>
                  <div className="flex justify-end gap-2 col-span-2 md:col-span-1">
                    <Button size="sm" variant="secondary" onClick={() => acceptBest(a)}><Check className="w-3.5 h-3.5" /> Accept best</Button>
                    <Button size="sm" variant="outline" onClick={() => router.push("/exchange/sell")}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-error hover:bg-error-50" onClick={() => endAuction(a)}><X className="w-3.5 h-3.5" /> End</Button>
                  </div>
                </div>
              ))}
              {open.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <p className="text-small text-ink-subtle mb-3">No active listings.</p>
                  <Link href="/exchange/sell"><Button size="sm"><Plus className="w-4 h-4" /> Create your first listing</Button></Link>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "Trade History" && (
          <div className="rounded-xl border border-primary-100 bg-surface shadow-card overflow-hidden">
            <div className="hidden md:grid grid-cols-[0.9fr_0.8fr_0.8fr_1fr_1fr_1fr_0.6fr_0.7fr] gap-3 px-4 py-2.5 text-caption font-medium text-ink-subtle uppercase tracking-wide bg-surface-2 border-b border-primary-100">
              <span>ID</span><span>Amount</span><span>Date</span><span>Buyer</span><span>Final bid</span><span>Earned</span><span>Bids</span><span>Status</span>
            </div>
            <div className="divide-y divide-primary-100">
              {history.map((t) => (
                <div key={t.id} className="grid grid-cols-2 md:grid-cols-[0.9fr_0.8fr_0.8fr_1fr_1fr_1fr_0.6fr_0.7fr] gap-3 px-4 py-3 items-center text-small">
                  <span className="font-semibold text-primary-700">#{t.id}</span>
                  <span className="text-ink tabular-nums">{t.amount} GKWTH</span>
                  <span className="text-ink-subtle hidden md:inline">{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span className="text-ink truncate">{t.buyerName}</span>
                  <span className="text-ink tabular-nums hidden md:inline">{formatNaira(t.finalBid)}</span>
                  <span className="font-semibold text-secondary tabular-nums">+{formatNaira(t.finalBid)}</span>
                  <span className="text-ink-subtle tabular-nums hidden md:inline">{t.bids}</span>
                  <span><Badge tone={t.status === "won" ? "won" : "sold"}>{t.status === "won" ? "Won" : "Sold"}</Badge></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Bid Activity" && (
          <div className="rounded-xl border border-primary-100 bg-surface shadow-card p-6 space-y-3">
            {open.flatMap((a) =>
              Array.from({ length: Math.min(3, a.bidders) }).map((_, i) => (
                <div key={`${a.id}-${i}`} className="flex items-center justify-between py-2 border-b border-primary-50 last:border-0">
                  <div>
                    <p className="text-small font-medium text-ink">{SAMPLE_BUYERS[(i + a.id.charCodeAt(2)) % SAMPLE_BUYERS.length]} bid on {a.pair} #{a.id}</p>
                    <p className="text-caption text-ink-subtle">{a.amount} GKWTH · {timeLeft(a.endsAt)} left</p>
                  </div>
                  <span className="font-semibold text-primary-700 tabular-nums">{formatNaira(a.topBid - i * a.minIncrement)}</span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "Analytics" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat label="Avg. sale price" value={formatCompact(totalEarned / Math.max(1, history.length))} sub="Across completed auctions" />
            <Stat label="Total GKWTH sold" value={`${history.reduce((s, t) => s + t.amount, 0)} GKWTH`} sub="Lifetime" tone="up" />
            <Stat label="Avg. bids / auction" value={String(Math.round(history.reduce((s, t) => s + t.bids, 0) / Math.max(1, history.length)))} sub="Engagement" />
          </div>
        )}
      </ExchangeShell>
    </PageTransition>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "up" }) {
  return (
    <div className="rounded-xl border border-primary-100 bg-surface shadow-card p-4">
      <p className="text-caption text-ink-subtle uppercase tracking-wide">{label}</p>
      <p className="text-h2 font-bold text-ink mt-1 tabular-nums">{value}</p>
      <p className={cn("text-caption mt-0.5", tone === "up" ? "text-secondary" : "text-ink-subtle")}>{sub}</p>
    </div>
  );
}

function Badge({ tone, children }: { tone: "live" | "sold" | "won"; children: React.ReactNode }) {
  const map = {
    live: "bg-secondary-50 text-secondary border-secondary-200",
    sold: "bg-primary-50 text-primary-700 border-primary-200",
    won: "bg-secondary-50 text-secondary border-secondary-200",
  };
  return <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-medium border", map[tone])}>{children}</span>;
}
