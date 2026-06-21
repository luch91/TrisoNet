"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: "bg-success text-white",
  error: "bg-error text-white",
  warning: "bg-warning text-white",
  info: "bg-primary text-ink",
};

export default function ToastContainer() {
  const { state, dispatch } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {state.toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg shadow-lifted max-w-sm",
                colors[toast.type]
              )}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-small font-semibold">{toast.title}</p>
                {toast.message && <p className="text-caption opacity-90 mt-0.5">{toast.message}</p>}
              </div>
              <button
                onClick={() => dispatch({ type: "REMOVE_TOAST", id: toast.id })}
                className="shrink-0 opacity-80 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
