"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { GKWTH, type WalletEntry } from "@/lib/coin-data";
import { formatNaira, formatCompact, formatDate, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import ExchangeShell from "@/components/exchange/ExchangeShell";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Coins, Lock, ArrowDownLeft, ArrowUpRight, TrendingUp, Percent, Plus, X,
} from "lucide-react";

const QUICK = [100_000, 500_000, 1_000_000];

export default function WalletPage() {
  const { state, dispatch, addToast } = useApp();
  const [modal, setModal] = useState<null | "deposit" | "withdraw">(null);
  const [amount, setAmount] = useState(100_000);

  const coinValue = state.coinBalance * GKWTH.price;
  const locked = useMemo(
    () => state.coinAuctions
      .filter((a) => a.status === "live" && a.myLastBid != null)
      .reduce((s, a) => s + (a.myLastBid ?? 0), 0),
    [state.coinAuctions]
  );
  const available = Math.max(0, state.cashBalance - locked);
  const portfolio = coinValue + state.cashBalance;

  function confirm() {
    if (amount <= 0) { addToast({ type: "warning", title: "Enter an amount" }); return; }
    if (modal === "withdraw" && amount > available) {
      addToast({ type: "warning", title: "Insufficient available balance", message: `You can withdraw up to ${formatNaira(available)}` });
      return;
    }
    if (modal === "deposit") {
      dispatch({ type: "WALLET_DEPOSIT", amount, label: "Bank deposit · GTBank ****4021" });
      addToast({ type: "success", title: "Deposit successful", message: `${formatNaira(amount)} added to your wallet` });
    } else {
      dispatch({ type: "WALLET_WITHDRAW", amount, label: "Withdrawal to GTBank ****4021" });
      addToast({ type: "info", title: "Withdrawal requested", message: `${formatNaira(amount)} is on its way (pending)` });
    }
    setModal(null);
  }

  return (
    <PageTransition>
      <ExchangeShell bare>
        <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
          <div>
            <p className="text-caption text-primary-600 font-semibold uppercase tracking-wide flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Wallet</p>
            <h1 className="text-h1 text-ink mt-1">Your GKWTH wallet</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { setAmount(100_000); setModal("withdraw"); }}><ArrowUpRight className="w-4 h-4" /> Withdraw</Button>
            <Button onClick={() => { setAmount(100_000); setModal("deposit"); }}><ArrowDownLeft className="w-4 h-4" /> Deposit</Button>
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
          {/* Portfolio value — hero */}
          <div className="rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50 to-secondary-50 shadow-card p-5">
            <p className="text-caption text-ink-subtle uppercase tracking-wide">Total portfolio value</p>
            <p className="text-display font-bold text-ink mt-1 tabular-nums leading-none">{formatCompact(portfolio)}</p>
            <p className="text-small text-secondary font-medium mt-2 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +{GKWTH.change24h}% (24h)</p>
            <p className="text-caption text-ink-subtle mt-1">{formatNaira(portfolio)}</p>
          </div>

          {/* GKWTH balance */}
          <div className="rounded-xl border border-primary-100 bg-surface shadow-card p-5">
            <div className="flex items-center gap-2 text-caption text-ink-subtle uppercase tracking-wide"><Coins className="w-4 h-4 text-secondary" /> GKWTH balance</div>
            <p className="text-h1 font-bold text-ink mt-2 tabular-nums">{state.coinBalance.toLocaleString()} <span className="text-h3 text-primary-600">GKWTH</span></p>
            <p className="text-small text-ink-subtle mt-1">≈ {formatNaira(coinValue)}</p>
            <Link href="/exchange" className="inline-flex items-center gap-1 text-small text-primary-600 font-medium hover:underline mt-3">Buy more GKWTH <ArrowUpRight className="w-3.5 h-3.5" /></Link>
          </div>

          {/* Cash balance with locked split */}
          <div className="rounded-xl border border-primary-100 bg-surface shadow-card p-5">
            <div className="flex items-center gap-2 text-caption text-ink-subtle uppercase tracking-wide"><Wallet className="w-4 h-4 text-primary-600" /> NGN cash balance</div>
            <p className="text-h1 font-bold text-ink mt-2 tabular-nums">{formatNaira(state.cashBalance)}</p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-small">
                <span className="text-ink-subtle">Available</span>
                <span className="font-semibold text-secondary tabular-nums">{formatNaira(available)}</span>
              </div>
              <div className="flex items-center justify-between text-small">
                <span className="text-ink-subtle flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Locked in bids</span>
                <span className="font-medium text-ink tabular-nums">{formatNaira(locked)}</span>
              </div>
              {/* split bar */}
              <div className="h-1.5 rounded-full bg-primary-100 overflow-hidden flex mt-1">
                <span className="bg-secondary h-full" style={{ width: `${state.cashBalance ? (available / state.cashBalance) * 100 : 0}%` }} />
                <span className="bg-warning h-full" style={{ width: `${state.cashBalance ? (locked / state.cashBalance) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Ledger */}
        <div className="rounded-xl border border-primary-100 bg-surface shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-primary-100 flex items-center justify-between">
            <p className="text-small font-semibold text-ink">Transaction history</p>
            <span className="text-caption text-ink-subtle">{state.walletLedger.length} entries</span>
          </div>
          <div className="divide-y divide-primary-100">
            {state.walletLedger.map((e) => <LedgerRow key={e.id} e={e} />)}
            {state.walletLedger.length === 0 && <div className="px-4 py-12 text-center text-small text-ink-subtle">No transactions yet.</div>}
          </div>
        </div>
      </ExchangeShell>

      {/* Deposit / Withdraw modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" onClick={() => setModal(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.18 }}
                className="w-full max-w-md bg-surface rounded-2xl shadow-modal border border-primary-100 pointer-events-auto overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-primary-100">
                  <h2 className="text-h3 text-ink">{modal === "deposit" ? "Deposit funds" : "Withdraw funds"}</h2>
                  <button onClick={() => setModal(null)} className="p-1 rounded-md hover:bg-bg text-ink-subtle"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-small text-ink-subtle">
                    {modal === "deposit"
                      ? "Add Naira to your wallet to bid and buy GKWTH instantly."
                      : `Available to withdraw: ${formatNaira(available)}`}
                  </p>
                  <div>
                    <label className="text-caption text-ink-subtle uppercase tracking-wide">Amount (NGN)</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle">₦</span>
                      <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-3 rounded-md border border-primary-200 bg-bg text-h3 font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface tabular-nums" />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {QUICK.map((q) => (
                      <button key={q} onClick={() => setAmount(q)} className={cn("px-3 py-1.5 rounded-md text-small font-medium transition-colors", amount === q ? "bg-primary text-ink" : "border border-primary-200 text-ink hover:bg-primary-50")}>
                        {formatCompact(q)}
                      </button>
                    ))}
                  </div>
                  <div className="rounded-md bg-bg border border-primary-100 px-3 py-2.5 flex items-center justify-between text-small">
                    <span className="text-ink-subtle">Balance after</span>
                    <span className="font-semibold text-ink tabular-nums">
                      {formatNaira(modal === "deposit" ? state.cashBalance + amount : Math.max(0, state.cashBalance - amount))}
                    </span>
                  </div>
                  <Button size="lg" className="w-full" variant={modal === "deposit" ? "primary" : "secondary"} onClick={confirm}>
                    {modal === "deposit" ? "Confirm deposit" : "Confirm withdrawal"}
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

const META: Record<WalletEntry["type"], { icon: React.ElementType; tint: string }> = {
  deposit:    { icon: ArrowDownLeft, tint: "text-secondary bg-secondary-50" },
  withdrawal: { icon: ArrowUpRight, tint: "text-primary-700 bg-primary-50" },
  purchase:   { icon: Coins, tint: "text-primary-700 bg-primary-50" },
  sale:       { icon: TrendingUp, tint: "text-secondary bg-secondary-50" },
  fee:        { icon: Percent, tint: "text-ink-subtle bg-bg" },
  bid:        { icon: Plus, tint: "text-ink-subtle bg-bg" },
};

function LedgerRow({ e }: { e: WalletEntry }) {
  const m = META[e.type];
  const Icon = m.icon;
  const pos = (e.amountNgn ?? 0) >= 0;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", m.tint)}><Icon className="w-4 h-4" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-small font-medium text-ink truncate capitalize">{e.label}</p>
        <p className="text-caption text-ink-subtle">{formatDate(e.date)} · {e.type}</p>
      </div>
      <div className="text-right shrink-0">
        {e.amountNgn != null && (
          <p className={cn("text-small font-semibold tabular-nums", pos ? "text-secondary" : "text-ink")}>
            {pos ? "+" : "−"}{formatNaira(Math.abs(e.amountNgn))}
          </p>
        )}
        {e.amountGkwth != null && (
          <p className="text-caption text-ink-subtle tabular-nums">{e.amountGkwth >= 0 ? "+" : "−"}{Math.abs(e.amountGkwth)} GKWTH</p>
        )}
        {e.status === "pending" && <span className="inline-block mt-0.5 text-[10px] font-medium text-warning bg-warning-50 px-1.5 py-0.5 rounded-full border border-warning/30">Pending</span>}
      </div>
    </div>
  );
}
