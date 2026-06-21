"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ClipboardList,
  Menu, X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV: Record<string, { icon: React.ElementType; label: string; href: string }[]> = {
  super_admin: [
    { icon: LayoutDashboard, label: "Dashboard",   href: "/admin/dashboard" },
    { icon: Package,         label: "Products",    href: "/admin/products/pending" },
  ],
  qc_officer: [
    { icon: ClipboardList,   label: "QC Queue",    href: "/qc/queue" },
  ],
  business_manager: [
    { icon: LayoutDashboard, label: "Dashboard",   href: "/manager/dashboard" },
    { icon: Package,         label: "Inventory",   href: "/manager/inventory" },
  ],
};

export default function Sidebar() {
  const { state } = useApp();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = NAV[state.currentRole] ?? [];

  if (!links.length) return null;

  const NavContent = () => (
    <nav className="flex flex-col gap-1 p-3">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-small font-medium transition-colors",
              active ? "bg-primary text-ink shadow-btn" : "text-ink-subtle hover:text-ink hover:bg-primary-50"
            )}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-40 bg-primary text-ink p-3 rounded-full shadow-lifted"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 bg-surface border-r border-primary-100 shadow-modal lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-primary-100">
                <span className="font-semibold text-ink">Menu</span>
                <button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 border-r border-primary-100 bg-surface min-h-[calc(100vh-4rem)]">
        <NavContent />
      </aside>
    </>
  );
}
