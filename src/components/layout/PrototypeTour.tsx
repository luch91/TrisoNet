"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/mock-data";
import {
  Map, X, ChevronRight, ChevronLeft, CheckCircle, Play,
  Package, ClipboardList, ShieldCheck, Store, ShoppingCart, CreditCard, Bell, Eye,
} from "lucide-react";
import Button from "@/components/ui/Button";

interface TourStep {
  number: number;
  title: string;
  description: string;
  role: Role;
  path: string;
  icon: React.ElementType;
  roleLabel: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    number: 1,
    title: "Stock a Product",
    description: "As Business Manager, submit a new product to the Central Market Square for QC review.",
    role: "business_manager",
    path: "/manager/inventory/new",
    icon: Package,
    roleLabel: "Business Manager",
  },
  {
    number: 2,
    title: "QC Review",
    description: "As QC Officer, review the pending product and approve it to move to Super Admin sign-off.",
    role: "qc_officer",
    path: "/qc/queue",
    icon: ClipboardList,
    roleLabel: "QC Officer",
  },
  {
    number: 3,
    title: "Admin Final Approval",
    description: "As Super Admin, give final approval — the product goes Live on the marketplace.",
    role: "super_admin",
    path: "/admin/products/pending",
    icon: ShieldCheck,
    roleLabel: "Super Admin",
  },
  {
    number: 4,
    title: "Seller Portal Listing",
    description: "As Citizen Seller, add an independent listing to your personal portal.",
    role: "citizen_seller",
    path: "/portal/citizen-1/edit",
    icon: Store,
    roleLabel: "Citizen Seller",
  },
  {
    number: 5,
    title: "Browse & Discover",
    description: "As Buyer, browse the marketplace and view a citizen seller's portal.",
    role: "buyer",
    path: "/marketplace",
    icon: ShoppingCart,
    roleLabel: "Buyer",
  },
  {
    number: 6,
    title: "Negotiate & Accept",
    description: "Make an offer on a product, negotiate with the seller, and get an accepted deal.",
    role: "buyer",
    path: "/marketplace/prod-6/negotiate",
    icon: ChevronRight,
    roleLabel: "Buyer",
  },
  {
    number: 7,
    title: "Complete Payment",
    description: "Proceed to checkout with the agreed price and confirm payment.",
    role: "buyer",
    path: "/checkout/prod-6",
    icon: CreditCard,
    roleLabel: "Buyer",
  },
  {
    number: 8,
    title: "View Notifications",
    description: "Check the notifications feed — both buyer and seller are notified of the completed transaction.",
    role: "buyer",
    path: "/notifications",
    icon: Bell,
    roleLabel: "Buyer",
  },
  {
    number: 9,
    title: "Visitor Access Control",
    description: "As Visitor, browse the marketplace freely — but checkout is gated until sign-up.",
    role: "visitor",
    path: "/marketplace/prod-1",
    icon: Eye,
    roleLabel: "Visitor",
  },
];

const ROLE_EMOJI: Record<Role, string> = {
  super_admin: "👑",
  qc_officer: "🔍",
  business_manager: "📦",
  citizen_seller: "🏪",
  buyer: "🛒",
  visitor: "👀",
};

export default function PrototypeTour() {
  const { dispatch } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  const step = TOUR_STEPS[currentStep];

  function goToStep(index: number) {
    const s = TOUR_STEPS[index];
    dispatch({ type: "SET_ROLE", role: s.role });
    router.push(s.path);
    setCompleted((c) => c.includes(currentStep) ? c : [...c, currentStep]);
    setCurrentStep(index);
  }

  function handleNext() {
    if (currentStep < TOUR_STEPS.length - 1) {
      goToStep(currentStep + 1);
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }

  function jumpTo(index: number) {
    goToStep(index);
    setOpen(true);
  }

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-ink text-white px-4 py-3 rounded-full shadow-modal hover:bg-ink/90 transition-colors text-small font-medium"
      >
        <Map className="w-4 h-4" />
        <span className="hidden sm:block">Prototype Tour</span>
      </motion.button>

      {/* Tour overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-surface border-l border-primary-100 shadow-modal flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-primary-50">
                <div className="flex items-center gap-2">
                  <Map className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-ink">Prototype Tour</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-bg transition-colors">
                  <X className="w-5 h-5 text-ink-subtle" />
                </button>
              </div>

              {/* Current step highlight */}
              <div className="p-5 bg-primary-50 border-b border-primary-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-ink text-caption font-bold flex items-center justify-center">{step.number}</span>
                  <span className="text-caption font-medium text-primary-700">{ROLE_EMOJI[step.role]} {step.roleLabel}</span>
                </div>
                <h3 className="text-h3 text-ink mb-1">{step.title}</h3>
                <p className="text-small text-ink-muted">{step.description}</p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => { goToStep(currentStep); setOpen(false); }} className="flex-1">
                    <Play className="w-3.5 h-3.5" /> Go to this step
                  </Button>
                </div>
              </div>

              {/* Step list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
                {TOUR_STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const isDone = completed.includes(i);
                  const isActive = i === currentStep;
                  return (
                    <button
                      key={i}
                      onClick={() => jumpTo(i)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors",
                        isActive ? "bg-primary/20 border border-primary-200" : "hover:bg-bg"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                        isDone ? "bg-secondary text-white" : isActive ? "bg-primary text-ink" : "bg-bg text-ink-subtle border border-primary-100"
                      )}>
                        {isDone ? <CheckCircle className="w-4 h-4" /> : <span className="text-caption font-bold">{s.number}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-small font-medium truncate", isActive ? "text-primary-700" : "text-ink")}>{s.title}</p>
                        <p className="text-caption text-ink-subtle">{ROLE_EMOJI[s.role]} {s.roleLabel}</p>
                      </div>
                      <Icon className="w-4 h-4 text-ink-subtle shrink-0" />
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="px-5 py-4 border-t border-primary-50">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentStep === 0} className="flex-1">
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Button>
                  <span className="text-caption text-ink-subtle whitespace-nowrap">{currentStep + 1} / {TOUR_STEPS.length}</span>
                  <Button size="sm" onClick={handleNext} disabled={currentStep === TOUR_STEPS.length - 1} className="flex-1">
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-1 mt-3 justify-center">
                  {TOUR_STEPS.map((_, i) => (
                    <div key={i} className={cn("h-1 rounded-full transition-all", i === currentStep ? "w-6 bg-primary" : completed.includes(i) ? "w-2 bg-secondary" : "w-2 bg-primary-100")} />
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
