import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNaira(amount: number, opts?: { decimals?: number }): string {
  const decimals = opts?.decimals ?? 0;
  return `₦${amount.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

/** Compact money for stat tiles, e.g. ₦2.4M, ₦920k, ₦540. */
export function formatCompact(amount: number, prefix = "₦"): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) return `${prefix}${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (abs >= 1_000_000) return `${prefix}${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (abs >= 1_000) return `${prefix}${(amount / 1_000).toFixed(abs >= 100_000 ? 0 : 1).replace(/\.0$/, "")}k`;
  return `${prefix}${amount.toLocaleString("en-US")}`;
}

/** Human countdown to an ISO timestamp, e.g. "2h 14m", "12m", "Ended". */
export function timeLeft(endsAt: string): string {
  const diffMs = new Date(endsAt).getTime() - Date.now();
  if (diffMs <= 0) return "Ended";
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days}d ${hours % 24}h`;
  if (hours >= 1) return `${hours}h ${mins % 60}m`;
  return `${mins}m`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateConfirmationNumber(): string {
  return `TRN-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}
