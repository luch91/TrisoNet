"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import type { CoinTrade } from "@/lib/coin-data";
import { formatNaira, formatCompact, timeLeft, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import ExchangeShell from "@/components/exchange/ExchangeShell";
import PriceChart from "@/components/exchange/PriceChart";
import OrderBook from "@/components/exchange/OrderBook";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Coins, Lock, Zap, TrendingUp, CheckCircle2, ArrowLeft } from "lucide-react";

const QUICK = [1_000, 5_000, 10_000, 20_000];

export default function AuctionDetailPage() {
  const { state, dispatch, addToast } = useApp();
  const params = useParams();
  const router = useRouter();
  const id = params.auctionId as string;
  const auction = state.coinAuctions.find((a) => a.id === id);

  const minNext = auction ? auction.topBid + auction.minIncrement : 0;
  const [bid, setBid] = useState<number>(minNext);
  const [mode, setMode] = useState<"bid" | "buynow">("bid");

  if (!auction) {
    return (
      <PageTransition>
        <ExchangeShell bare>
          <EmptyState icon={Coins} title="Auction not found" description="This GKWTH auction has closed or never existed." action={{ label: "Back to Markets", onClick: () => router.push("/exchange") }} />
        </ExchangeShell>
      </PageTransition>
    );
  }

  const up = auction.change >= 0;
  const isTopBidder = auction.myPosition === 1;
  const wasOutbid = auction.myLastBid != null && !isTopBidder;

  function placeBid() {
    if (bid < minNext) {
      addToast({ type: "warning", title: "Bid too low", message: `Minimum next bid is ${formatNaira(minNext)}` });
      return;
    }
    dispatch({ type: "PLACE_COIN_BID", auctionId: auction!.id, amount: bid });
    addToast({ type: "success", title: "Bid placed", message: `${formatNaira(bid)} on ${auction!.pair} #${auction!.id}` });
    setBid(bid + auction!.minIncrement);
  }

  function buyNow() {
    const price = auction!.buyNow ?? auction!.topBid;
    const trade: CoinTrade = {
      id: `A-${Math.floor(10000 + Math.random() * 89999)}`,
      auctionId: auction!.id,
      amount: auction!.amount,
      buyerId: state.currentUser.id,
      buyerName: state.currentUser.name === "Guest" ? "You" : state.currentUser.name,
      sellerId: auction!.sellerId,
      sellerName: auction!.sellerName,
      finalBid: price,
      bids: auction!.bids + 1,
      date: new Date().toISOString(),
      status: "won",
      txnId: `TXN-${Math.floor(10000 + Math.random() * 89999)}`,
    };
    dispatch({ type: "COMPLETE_COIN_TRADE", trade, coinDelta: auction!.amount });
    router.push(`/exchange/result/${trade.id}`);
  }

  return (
    <PageTransition>
      <ExchangeShell bare>
        <button onClick={() => router.push("/exchange")} className="flex items-center gap-1.5 text-small text-ink-subtle hover:text-ink mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All markets
        </button>

        {/* Auction header */}
        <div className="rounded-xl border border-primary-100 bg-surface shadow-card p-4 sm:p-5 mb-4">
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <p className="text-caption text-ink-subtle uppercase tracking-wide">{auction.pair} #{auction.id} · by {auction.sellerName}</p>
              <div className="flex items-end gap-3 mt-1">
                <p className="text-h1 font-bold text-ink tabular-nums">{formatNaira(auction.topBid)}</p>
                <span className={cn("text-small font-medium mb-1.5", up ? "text-secondary" : "text-error")}>
                  {up ? "+" : ""}{formatNaira(auction.topBid - auction.startingBid)} ({up ? "+" : ""}{auction.change}%)
                </span>
              </div>
            </div>
            <div className="ml-auto grid grid-cols-3 sm:grid-cols-6 gap-x-5 gap-y-2">
              <HeaderStat label="Starting bid" value={formatNaira(auction.startingBid)} />
              <HeaderStat label="24h high" value={formatNaira(auction.high24h)} />
              <HeaderStat label="24h low" value={formatNaira(auction.low24h)} />
              <HeaderStat label="Total bids" value={String(auction.bids)} />
              <HeaderStat label="Bidders" value={String(auction.bidders)} />
              <HeaderStat label="Time left" value={timeLeft(auction.endsAt)} tone={up ? undefined : "error"} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="lg:col-span-2 rounded-xl border border-primary-100 bg-surface shadow-card p-4">
            <PriceChart candles={auction.candles} change={auction.change} caption={`${auction.pair} #${auction.id} · ${auction.amount} GKWTH · Ends ${timeLeft(auction.endsAt)}`} />
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="rounded-xl border border-primary-100 bg-surface shadow-card p-4">
              <OrderBook book={auction.book} midPrice={auction.topBid} change={auction.change} />
            </div>

            {/* Bid / Buy panel */}
            <div className="rounded-xl border border-primary-100 bg-surface shadow-card overflow-hidden">
              <div className="grid grid-cols-2 border-b border-primary-100">
                <button onClick={() => setMode("bid")} className={cn("py-3 text-small font-semibold transition-colors", mode === "bid" ? "text-primary-700 border-b-2 border-primary bg-primary-50" : "text-ink-subtle hover:text-ink")}>
                  Place bid
                </button>
                <button onClick={() => setMode("buynow")} className={cn("py-3 text-small font-semibold transition-colors", mode === "buynow" ? "text-secondary border-b-2 border-secondary bg-secondary-50" : "text-ink-subtle hover:text-ink")}>
                  Buy it now {auction.buyNow ? formatNaira(auction.buyNow) : ""}
                </button>
              </div>

              {mode === "bid" ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-small">
                    <span className="text-ink-subtle">Top bid <span className="font-semibold text-ink">{formatNaira(auction.topBid)}</span></span>
                    {isTopBidder
                      ? <span className="inline-flex items-center gap-1 text-secondary font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> You lead</span>
                      : <span className="text-caption text-ink-subtle">Min next: {formatNaira(minNext)}</span>}
                  </div>

                  <div>
                    <label className="text-caption text-ink-subtle uppercase tracking-wide">Bid amount (NGN)</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle">₦</span>
                      <input
                        type="number"
                        value={bid}
                        onChange={(e) => setBid(Number(e.target.value))}
                        className="w-full pl-7 pr-14 py-2.5 rounded-md border border-primary-200 bg-bg text-h3 font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-colors tabular-nums"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-ink-subtle">NGN</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {QUICK.map((q) => (
                      <button key={q} onClick={() => setBid((b) => b + q)} className="py-1.5 rounded-md border border-primary-200 text-caption font-medium text-ink hover:bg-primary-50 transition-colors">
                        +{formatCompact(q, "₦")}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-small pt-1">
                    <span className="text-ink-subtle">You pay</span>
                    <span className="font-semibold text-ink tabular-nums">{formatNaira(bid)} NGN</span>
                  </div>
                  <div className="flex items-center justify-between text-small">
                    <span className="text-ink-subtle">GKWTH received (if won)</span>
                    <span className="font-semibold text-secondary tabular-nums">{auction.amount} GKWTH</span>
                  </div>

                  {wasOutbid && (
                    <div className="rounded-md bg-warning-50 border border-warning/30 px-3 py-2 text-caption text-ink">
                      You were outbid · Last bid {formatNaira(auction.myLastBid!)} · Position #{auction.myPosition} of {auction.bidders}
                    </div>
                  )}
                  {isTopBidder && (
                    <div className="rounded-md bg-secondary-50 border border-secondary-200 px-3 py-2 text-caption text-secondary font-medium flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" /> You&apos;re the top bidder at {formatNaira(auction.myLastBid!)}
                    </div>
                  )}

                  <Button size="lg" className="w-full" onClick={placeBid}>Place bid — {formatNaira(bid)}</Button>
                  {auction.buyNow && (
                    <button onClick={buyNow} className="w-full text-caption text-ink-subtle hover:text-ink py-1.5 transition-colors">
                      Buy it now — {formatNaira(auction.buyNow)} (skip bidding)
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <div className="rounded-lg bg-secondary-50 border border-secondary-200 p-4 text-center">
                    <p className="text-caption text-ink-subtle uppercase tracking-wide">Instant purchase</p>
                    <p className="text-h1 font-bold text-ink mt-1 tabular-nums">{formatNaira(auction.buyNow ?? auction.topBid)}</p>
                    <p className="text-small text-secondary mt-1">{auction.amount} GKWTH → your wallet</p>
                  </div>
                  <div className="flex items-center justify-between text-small">
                    <span className="text-ink-subtle">Unit price</span><span className="font-medium text-ink tabular-nums">{formatNaira(Math.round((auction.buyNow ?? auction.topBid) / auction.amount))}/GKWTH</span>
                  </div>
                  <div className="flex items-center justify-between text-small">
                    <span className="text-ink-subtle">New balance</span><span className="font-medium text-secondary tabular-nums">{(state.coinBalance + auction.amount).toLocaleString()} GKWTH</span>
                  </div>
                  <Button size="lg" variant="secondary" className="w-full" onClick={buyNow}><Zap className="w-4 h-4" /> Buy now & win instantly</Button>
                  <p className="flex items-center justify-center gap-1.5 text-caption text-ink-subtle"><Lock className="w-3.5 h-3.5" /> Secured by GKWTH wallet escrow</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ExchangeShell>
    </PageTransition>
  );
}

function HeaderStat({ label, value, tone }: { label: string; value: string; tone?: "error" }) {
  return (
    <div>
      <p className="text-caption text-ink-subtle uppercase tracking-wide">{label}</p>
      <p className={cn("text-small font-semibold tabular-nums mt-0.5", tone === "error" ? "text-error" : "text-ink")}>{value}</p>
    </div>
  );
}
