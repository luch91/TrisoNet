"use client";
import { motion } from "framer-motion";
import { Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/lib/mock-data";

const steps = [
  { key: "pending",     label: "Submitted",       desc: "Awaiting QC Review" },
  { key: "qc_approved", label: "QC Approved",      desc: "Awaiting Admin Sign-off" },
  { key: "live",        label: "Live",             desc: "Published on Marketplace" },
];

function getStepState(stepKey: string, currentStatus: ProductStatus): "complete" | "current" | "upcoming" | "rejected" {
  if (currentStatus === "rejected") {
    if (stepKey === "pending") return "rejected";
    return "upcoming";
  }
  const order = ["pending", "qc_approved", "live"];
  const stepIdx = order.indexOf(stepKey);
  const currentIdx = order.indexOf(currentStatus);
  if (currentIdx === -1) return "upcoming";
  if (stepIdx < currentIdx) return "complete";
  if (stepIdx === currentIdx) return "current";
  return "upcoming";
}

export default function StatusStepper({ status }: { status: ProductStatus }) {
  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => {
        const state = getStepState(step.key, status);
        return (
          <div key={step.key} className="flex items-start flex-1">
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor:
                    state === "complete" ? "#429E9D" :
                    state === "current" ? "#87D0FD" :
                    state === "rejected" ? "#e53e3e" :
                    "#e2e8f0",
                }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              >
                {state === "complete" && <Check className="w-4 h-4 text-white" />}
                {state === "current" && <Clock className="w-4 h-4 text-ink" />}
                {state === "rejected" && <X className="w-4 h-4 text-white" />}
                {state === "upcoming" && <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
              </motion.div>
              <p className={cn("text-caption font-medium mt-1.5 text-center",
                state === "complete" && "text-secondary",
                state === "current" && "text-primary-700",
                state === "rejected" && "text-error",
                state === "upcoming" && "text-ink-subtle"
              )}>{step.label}</p>
              <p className="text-[10px] text-ink-subtle text-center mt-0.5 max-w-[80px]">{step.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mt-4 mx-2 bg-gray-200 relative overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: state === "complete" ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-y-0 left-0 bg-secondary"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
