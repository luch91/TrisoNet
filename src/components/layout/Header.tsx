"use client";
import Link from "next/link";
import { Bell, ShoppingBag } from "lucide-react";
import { useApp } from "@/lib/store";
import RoleSwitcher from "./RoleSwitcher";
import Avatar from "@/components/ui/Avatar";
import { useRouter } from "next/navigation";

export default function Header() {
  const { state } = useApp();
  const router = useRouter();
  const unread = state.notifications.filter(
    (n) => !n.read && (n.userId === state.currentUser.id || state.currentRole === "super_admin")
  ).length;

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-primary-100 shadow-card">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <ShoppingBag className="w-4.5 h-4.5 text-ink" />
          </div>
          <span className="font-bold text-ink hidden sm:block">TrisoNet <span className="text-primary-600">Trading Zone</span></span>
        </Link>

        {/* Nav links (public roles) */}
        {(state.currentRole === "buyer" || state.currentRole === "visitor") && (
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/marketplace" className="px-3 py-2 text-small font-medium text-ink-subtle hover:text-ink hover:bg-bg rounded-md transition-colors">Marketplace</Link>
            <Link href="/portal/citizen-1" className="px-3 py-2 text-small font-medium text-ink-subtle hover:text-ink hover:bg-bg rounded-md transition-colors">Seller Portals</Link>
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <RoleSwitcher />
          <button
            onClick={() => router.push("/notifications")}
            className="relative p-2 rounded-md hover:bg-bg transition-colors"
          >
            <Bell className="w-5 h-5 text-ink-subtle" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          <Avatar name={state.currentUser.name} size="sm" className="cursor-pointer" />
        </div>
      </div>
    </header>
  );
}
