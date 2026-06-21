"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useApp } from "@/lib/store";
import type { Role } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const ROLES: { id: Role; label: string; emoji: string; defaultPath: string }[] = [
  { id: "super_admin",       label: "Super Admin",       emoji: "👑", defaultPath: "/admin/dashboard" },
  { id: "qc_officer",        label: "QC Officer",        emoji: "🔍", defaultPath: "/qc/queue" },
  { id: "business_manager",  label: "Business Manager",  emoji: "📦", defaultPath: "/manager/dashboard" },
  { id: "citizen_seller",    label: "Citizen Seller",    emoji: "🏪", defaultPath: "/portal/citizen-1/edit" },
  { id: "buyer",             label: "Buyer",             emoji: "🛒", defaultPath: "/marketplace" },
  { id: "visitor",           label: "Visitor",           emoji: "👀", defaultPath: "/" },
];

export default function RoleSwitcher() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const current = ROLES.find((r) => r.id === state.currentRole) ?? ROLES[4];

  function switchRole(role: typeof ROLES[0]) {
    dispatch({ type: "SET_ROLE", role: role.id });
    setOpen(false);
    router.push(role.defaultPath);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary-50 border border-primary-200 hover:bg-primary-100 transition-colors text-small font-medium"
      >
        <span className="text-base leading-none">{current.emoji}</span>
        <span className="hidden sm:block text-ink">{current.label}</span>
        <ChevronDown className={cn("w-4 h-4 text-ink-subtle transition-transform", open && "rotate-180")} />
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
              className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-lg shadow-modal border border-primary-100 z-50 overflow-hidden"
            >
              <div className="p-2">
                <p className="text-caption text-ink-subtle px-2 py-1.5 font-medium uppercase tracking-wide">Switch Role</p>
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => switchRole(role)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-small transition-colors",
                      role.id === state.currentRole
                        ? "bg-primary-50 text-primary-700 font-medium"
                        : "text-ink hover:bg-bg"
                    )}
                  >
                    <span className="text-base leading-none">{role.emoji}</span>
                    {role.label}
                    {role.id === state.currentRole && (
                      <span className="ml-auto text-caption bg-primary text-ink px-1.5 py-0.5 rounded-full">Active</span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
