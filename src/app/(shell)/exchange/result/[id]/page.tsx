"use client";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/lib/store";
import { formatNaira, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import ExchangeShell from "@/components/exchange/ExchangeShell";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Coins, Check, Store, BarChart3 } from "lucide-react";

export default function ResultPage() {
  const { state } = useApp();
  const params = useParams();
  const router = useRouter();
  const trade = state.coinTrades.find((t) => t.id === params.id);

  if (!trade) {
    return (
      <PageTransition>
        <ExchangeShell bare>
          <EmptyState icon={Coins} title="Result not found" description="We couldn't find this auction result." action={{ label: "Back to Markets", onClick: () => router.push("/exchange") }} />
        </ExchangeShell>
      </PageTransition>
    );
  }

  const isWon = trade.status === "won"; // buyer perspective
  const fee = Math.round(trade.finalBid * 0.005);

  const timeline = [
    { label: "Bid placed", detail: `${formatNaira(trade.finalBid)} bid submitted`, tone: "done" },
    { label: "Bid accepted", detail: `${isWon ? trade.sellerName : trade.buyerName} accepted`, tone: "done" },
    { label: "Payment sent", detail: `${formatNaira(trade.finalBid)} ${isWon ? "debited" : "received"}`, tone: "active" },
    { label: "GKWTH credited", detail: `${trade.amount} GKWTH ${isWon ? "added" : "released"}`, tone: "done" },
  ];

  return (
    <PageTransition>
      <ExchangeShell bare>
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-primary-100 bg-surface shadow-lifted overflow-hidden">
            {/* Hero */}
            <div className="relative bg-gradient-to-br from-secondary-50 to-primary-50 px-6 pt-8 pb-6 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center shadow-lifted"
              >
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </motion.div>
              <p className="text-caption font-semibold text-secondary uppercase tracking-wide mt-4">{isWon ? "Bid accepted!" : "Sale completed!"}</p>
              <h1 className="text-h1 text-ink mt-1">{isWon ? "You won the auction" : "Bid accepted — sold!"}</h1>
              <p className="text-small text-ink-subtle mt-1">
                {isWon
                  ? `Congratulations. ${trade.sellerName} accepted your bid.`
                  : `You accepted ${trade.buyerName}'s bid on GKWTH/NGN #${trade.auctionId}.`}
              </p>

              <div className="flex items-center justify-center divide-x divide-primary-200 mt-6">
                <div className="px-6">
                  <p className="text-h1 font-bold text-ink tabular-nums">{trade.amount}</p>
                  <p className="text-caption text-ink-subtle uppercase tracking-wide">GKWTH {isWon ? "received" : "sold"}</p>
                </div>
                <div className="px-6">
                  <p className="text-h1 font-bold text-primary-700 tabular-nums">{formatNaira(trade.finalBid)}</p>
                  <p className="text-caption text-ink-subtle uppercase tracking-wide">{isWon ? "Amount paid" : "You earned"}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-6">
              <dl className="divide-y divide-primary-100">
                <Row k="Transaction ID" v={`#${trade.txnId ?? trade.id}`} />
                <Row k="Auction" v={`GKWTH/NGN #${trade.auctionId}`} />
                <Row k="GKWTH transferred" v={`${trade.amount} GKWTH → ${isWon ? "your wallet" : trade.buyerName}`} />
                <Row k={isWon ? "Seller" : "Buyer"} v={isWon ? trade.sellerName : trade.buyerName} />
                <Row k="Payment method" v="GKWTH Wallet Balance" />
                <Row k="Platform fee" v={`${formatNaira(fee)} (0.5%)`} />
                <Row k={isWon ? "New GKWTH balance" : "Net proceeds"} v={isWon ? `${state.coinBalance.toLocaleString()} GKWTH` : formatNaira(trade.finalBid - fee)} highlight />
              </dl>

              {/* Timeline */}
              <p className="text-caption font-semibold text-ink-subtle uppercase tracking-wide mt-6 mb-3">What happened</p>
              <div className="space-y-3">
                {timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className={cn("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0", t.tone === "active" ? "bg-warning" : "bg-secondary")} />
                    <div>
                      <p className="text-small font-medium text-ink">{t.label}</p>
                      <p className="text-caption text-ink-subtle">{t.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-7">
                <Button className="flex-1" onClick={() => router.push("/exchange")}><Store className="w-4 h-4" /> Back to markets</Button>
                <Button variant="outline" className="flex-1" onClick={() => router.push("/exchange/portfolio")}><BarChart3 className="w-4 h-4" /> View portfolio</Button>
              </div>
            </div>
          </div>
        </div>
      </ExchangeShell>
    </PageTransition>
  );
}

function Row({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 text-small">
      <dt className="text-ink-subtle">{k}</dt>
      <dd className={cn("font-medium tabular-nums text-right", highlight ? "text-secondary font-bold text-body" : "text-ink")}>{v}</dd>
    </div>
  );
}
