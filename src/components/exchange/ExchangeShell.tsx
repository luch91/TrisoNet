"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins, Plus } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn, formatNaira } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

const TABS = [
  { href: "/exchange", label: "Markets" },
  { href: "/exchange/portfolio", label: "Auctions & Earnings" },
  { href: "/exchange/wallet", label: "Wallet" },
  { href: "/exchange/sell", label: "Sell GKWTH" },
];

/**
 * Branded wrapper for every GKWTH Exchange screen — gives the module its own identity
 * (logo, market status, wallet balance, sub-nav) while sitting inside the normal app shell.
 */
export default function ExchangeShell({
  children,
  bare = false,
}: {
  children: React.ReactNode;
  bare?: boolean;
}) {
  const { state } = useApp();
  const pathname = usePathname();

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {/* Branded header bar */}
      <div className="rounded-xl bg-surface border border-primary-100 shadow-card px-4 sm:px-6 py-4 flex items-center gap-4 flex-wrap">
        <Link href="/exchange" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-btn">
            <Coins className="w-5 h-5 text-ink" />
          </div>
          <div className="leading-tight">
            <p className="font-bold text-ink tracking-tight">GKWTH <span className="text-primary-600">Exchange</span></p>
            <p className="text-[11px] uppercase tracking-wide text-ink-subtle">Coin Auctions</p>
          </div>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-caption font-medium text-secondary px-2.5 py-1 rounded-full bg-secondary-50 border border-secondary-200">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" /> Market open
        </span>

        <Link href="/exchange/wallet" className="ml-auto flex items-center gap-4 group" title="Open wallet">
          <div className="text-right">
            <p className="text-body font-bold text-ink leading-none group-hover:text-primary-600 transition-colors">{state.coinBalance.toLocaleString()} <span className="text-primary-600">GKWTH</span></p>
            <p className="text-caption text-ink-subtle mt-0.5">Wallet · {formatNaira(state.cashBalance)}</p>
          </div>
          <Avatar name={state.currentUser.name === "Guest" ? "GK" : state.currentUser.name} size="md" />
        </Link>
      </div>

      {/* Sub-nav */}
      {!bare && (
        <div className="flex items-center gap-1 mt-4 mb-2 overflow-x-auto">
          {TABS.map((t) => {
            const active = t.href === "/exchange" ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "px-3.5 py-2 rounded-md text-small font-medium whitespace-nowrap transition-colors",
                  active ? "bg-primary text-ink shadow-btn" : "text-ink-subtle hover:text-ink hover:bg-primary-50"
                )}
              >
                {t.label}
              </Link>
            );
          })}
          <Link
            href="/exchange/sell"
            className="ml-auto hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-small font-semibold text-secondary border border-secondary-200 hover:bg-secondary-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> New listing
          </Link>
        </div>
      )}

      <div className="mt-4">{children}</div>
    </div>
  );
}
