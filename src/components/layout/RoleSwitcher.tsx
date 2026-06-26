"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ChevronDown } from "lucide-react";
import { useApp } from "@/lib/store";
import type { Role } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const ROLES: { id: Role; label: string; emoji: string; defaultPath: string; group: "shopper" | "staff" }[] = [
  { id: "visitor",          label: "Visitor",           emoji: "👀", defaultPath: "/", group: "shopper" },
  { id: "buyer",            label: "Buyer",             emoji: "🛒", defaultPath: "/marketplace", group: "shopper" },
  { id: "citizen_seller",   label: "Citizen Seller",    emoji: "🏪", defaultPath: "/portal/citizen-1/edit", group: "staff" },
  { id: "business_manager", label: "Business Manager",  emoji: "📦", defaultPath: "/manager/dashboard", group: "staff" },
  { id: "qc_officer",       label: "QC Officer",        emoji: "🔍", defaultPath: "/qc/queue", group: "staff" },
  { id: "super_admin",      label: "Super Admin",       emoji: "👑", defaultPath: "/admin/dashboard", group: "staff" },
];

/**
 * Discreet demo-only control that lets a reviewer jump between role perspectives.
 * Not part of the "real product" chrome — deliberately subdued and clearly labelled "Demo".
 */
export default function RoleSwitcher() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const current = ROLES.find((r) => r.id === state.currentRole) ?? ROLES[0];

  function switchRole(role: typeof ROLES[0]) {
    dispatch({ type: "SET_ROLE", role: role.id });
    setOpen(false);
    router.push(role.defaultPath);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Demo: view the platform as a different role"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-caption text-ink-subtle hover:text-ink hover:bg-bg border border-dashed border-primary-200 transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">View as</span>
        <span className="leading-none">{current.emoji}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
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
              <div className="px-3 py-2.5 bg-bg border-b border-primary-50">
                <p className="text-caption font-semibold text-ink">Demo mode</p>
                <p className="text-[11px] text-ink-subtle leading-snug mt-0.5">Preview the product from any role. In a live deployment, access is set by your account.</p>
              </div>
              <div className="p-2">
                <p className="text-[11px] text-ink-subtle px-2 py-1 font-medium uppercase tracking-wide">Shoppers</p>
                {ROLES.filter((r) => r.group === "shopper").map((role) => (
                  <RoleRow key={role.id} role={role} active={role.id === state.currentRole} onClick={() => switchRole(role)} />
                ))}
                <p className="text-[11px] text-ink-subtle px-2 py-1 mt-1 font-medium uppercase tracking-wide">Staff &amp; sellers</p>
                {ROLES.filter((r) => r.group === "staff").map((role) => (
                  <RoleRow key={role.id} role={role} active={role.id === state.currentRole} onClick={() => switchRole(role)} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function RoleRow({ role, active, onClick }: { role: typeof ROLES[0]; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-small transition-colors",
        active ? "bg-primary-50 text-primary-700 dark:text-primary-300 font-medium" : "text-ink hover:bg-bg"
      )}
    >
      <span className="text-base leading-none">{role.emoji}</span>
      {role.label}
      {active && <span className="ml-auto text-[10px] bg-primary text-ink px-1.5 py-0.5 rounded-full">Active</span>}
    </button>
  );
}
