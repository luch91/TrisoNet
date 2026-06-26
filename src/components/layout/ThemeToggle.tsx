"use client";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/store";

export default function ThemeToggle({ className }: { className?: string }) {
  const { state, dispatch } = useApp();
  const isDark = state.theme === "dark";

  return (
    <button
      onClick={() => dispatch({ type: "SET_THEME", theme: isDark ? "light" : "dark" })}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`relative p-2 rounded-md text-ink-subtle hover:text-ink hover:bg-bg transition-colors ${className ?? ""}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.18 }}
            className="block"
          >
            <Moon className="w-5 h-5" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.18 }}
            className="block"
          >
            <Sun className="w-5 h-5" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
