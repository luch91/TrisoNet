"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShoppingBag, ShoppingCart, Search, LogOut, User as UserIcon, Package, LayoutDashboard, Store, Settings, ChevronDown, Coins } from "lucide-react";
import { useApp } from "@/lib/store";
import RoleSwitcher from "./RoleSwitcher";
import ThemeToggle from "./ThemeToggle";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function Header() {
  const { state, cartCount } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const isAuthed = state.isAuthenticated;
  const role = state.currentRole;
  const isShopper = role === "buyer" || role === "visitor";

  const unread = state.notifications.filter(
    (n) => !n.read && (n.userId === state.currentUser.id || role === "super_admin")
  ).length;

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query.trim() ? `/marketplace?q=${encodeURIComponent(query.trim())}` : "/marketplace");
  }

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-primary-100 shadow-card">
      <div className="flex items-center gap-3 sm:gap-4 h-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <ShoppingBag className="w-4.5 h-4.5 text-ink" />
          </div>
          <span className="font-bold text-ink hidden sm:block">TrisoNet <span className="text-primary-600">Trading Zone</span></span>
        </Link>

        {/* Primary nav (shoppers) */}
        {isShopper && (
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            <NavLink href="/marketplace">Marketplace</NavLink>
            <NavLink href="/exchange">Exchange</NavLink>
            <NavLink href="/sellers">Sellers</NavLink>
            {isAuthed && <NavLink href="/orders">Orders</NavLink>}
          </nav>
        )}

        {/* Search (shoppers) */}
        {isShopper && (
          <form onSubmit={submitSearch} className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products across TrisoNet..."
              className="w-full pl-9 pr-3 py-2 rounded-md border border-primary-200 bg-bg text-small focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-colors"
            />
          </form>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
          {/* GKWTH balance pill */}
          {isAuthed && (
            <Link href="/exchange/wallet" className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-primary-200 text-small font-semibold text-ink hover:bg-primary-50 transition-colors" title="GKWTH Wallet">
              <Coins className="w-4 h-4 text-secondary" />
              <span className="tabular-nums">{state.coinBalance.toLocaleString()}</span>
              <span className="text-primary-600">GKWTH</span>
            </Link>
          )}

          <ThemeToggle />
          <RoleSwitcher />

          {/* Cart (buyers) */}
          {role === "buyer" && (
            <button onClick={() => router.push("/cart")} className="relative p-2 rounded-md hover:bg-bg transition-colors" aria-label="Cart">
              <ShoppingCart className="w-5 h-5 text-ink-subtle" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 bg-primary text-ink text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications (authed) */}
          {isAuthed && (
            <button onClick={() => router.push("/notifications")} className="relative p-2 rounded-md hover:bg-bg transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5 text-ink-subtle" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          )}

          {/* Account / auth */}
          {isAuthed ? (
            <AccountMenu />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button></Link>
              <Link href="/signup"><Button size="sm">Sign up</Button></Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-2 text-small font-medium rounded-md transition-colors",
        active ? "text-primary-700 dark:text-primary-300 bg-primary-50" : "text-ink-subtle hover:text-ink hover:bg-bg"
      )}
    >
      {children}
    </Link>
  );
}

function AccountMenu() {
  const { state, dispatch, addToast } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const user = state.currentUser;
  const role = state.currentRole;

  const links = menuLinksFor(role, user.id);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function logout() {
    setOpen(false);
    dispatch({ type: "LOGOUT" });
    addToast({ type: "info", title: "Signed out" });
    router.push("/");
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 p-1 rounded-md hover:bg-bg transition-colors">
        <Avatar name={user.name} size="sm" />
        <ChevronDown className={cn("w-4 h-4 text-ink-subtle transition-transform hidden sm:block", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-60 bg-surface rounded-lg shadow-modal border border-primary-100 z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-primary-50 flex items-center gap-3">
                <Avatar name={user.name} size="md" />
                <div className="min-w-0">
                  <p className="text-small font-semibold text-ink truncate">{user.name}</p>
                  <p className="text-caption text-ink-subtle truncate">{user.email || roleLabel(role)}</p>
                </div>
              </div>
              <div className="p-1.5">
                {links.map((l) => {
                  const Icon = l.icon;
                  return (
                    <button key={l.href} onClick={() => go(l.href)} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-small text-ink hover:bg-bg transition-colors">
                      <Icon className="w-4 h-4 text-ink-subtle" /> {l.label}
                    </button>
                  );
                })}
              </div>
              <div className="p-1.5 border-t border-primary-50">
                <button onClick={logout} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-small text-error hover:bg-error-50 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function menuLinksFor(role: string, userId: string): { href: string; label: string; icon: React.ElementType }[] {
  switch (role) {
    case "buyer":
      return [
        { href: "/account", label: "My account", icon: UserIcon },
        { href: "/orders", label: "My orders", icon: Package },
        { href: "/cart", label: "Cart", icon: ShoppingCart },
        { href: "/account?tab=settings", label: "Settings", icon: Settings },
      ];
    case "citizen_seller":
      return [
        { href: `/portal/${userId}/edit`, label: "My portal", icon: Store },
        { href: `/portal/${userId}`, label: "Public portal", icon: UserIcon },
        { href: "/account", label: "My account", icon: Settings },
      ];
    case "business_manager":
      return [
        { href: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/manager/inventory", label: "Inventory", icon: Package },
        { href: "/account", label: "My account", icon: Settings },
      ];
    case "qc_officer":
      return [
        { href: "/qc/queue", label: "QC queue", icon: Package },
        { href: "/account", label: "My account", icon: Settings },
      ];
    case "super_admin":
      return [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/products/pending", label: "Products", icon: Package },
        { href: "/account", label: "My account", icon: Settings },
      ];
    default:
      return [{ href: "/account", label: "My account", icon: UserIcon }];
  }
}

function roleLabel(role: string): string {
  return role.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}
