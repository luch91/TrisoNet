"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Package, Lock, ChevronRight, CheckCircle, Clock, XCircle } from "lucide-react";
import type { Transaction } from "@/lib/mock-data";

function statusMeta(status: Transaction["status"]) {
  switch (status) {
    case "completed": return { label: "Completed", icon: CheckCircle, class: "bg-secondary-50 text-secondary border-secondary-200" };
    case "processing": return { label: "Processing", icon: Clock, class: "bg-warning-50 text-warning-600 border-warning-100" };
    default: return { label: "Failed", icon: XCircle, class: "bg-error-50 text-error border-error-200" };
  }
}

export default function OrdersPage() {
  const { state } = useApp();
  const router = useRouter();

  if (!state.isAuthenticated || state.currentRole !== "buyer") {
    return (
      <PageTransition>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-h2 text-ink mb-2">Sign in to see your orders</h1>
          <p className="text-small text-ink-subtle mb-6">Your purchase history lives in your buyer account.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login?redirect=/orders"><Button variant="outline">Sign in</Button></Link>
            <Link href="/signup?redirect=/orders"><Button>Create account</Button></Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const orders = state.transactions
    .filter((t) => t.buyerId === state.currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalSpent = orders.filter((o) => o.status === "completed").reduce((s, o) => s + o.amount, 0);

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My Orders" }]} />
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-h1 text-ink">My Orders</h1>
            <p className="text-small text-ink-subtle mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} · {formatPrice(totalSpent)} spent</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <EmptyState icon={Package} title="No orders yet" description="When you complete a purchase, it'll appear here." action={{ label: "Browse Marketplace", onClick: () => router.push("/marketplace") }} />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => {
              const product = state.products.find((p) => p.id === o.productId);
              const meta = statusMeta(o.status);
              const Icon = meta.icon;
              return (
                <Link key={o.id} href={`/orders/${o.id}`} className="block">
                  <Card hover className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-bg shrink-0 overflow-hidden">
                      {product?.images[0] ? <img src={product.images[0]} alt={o.productName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-primary-200" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-small font-semibold text-ink line-clamp-1">{o.productName}</p>
                      <p className="text-caption text-ink-subtle mt-0.5">{o.confirmationNumber} · {formatDate(o.createdAt)}</p>
                      <span className={cn("inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-caption font-medium border", meta.class)}>
                        <Icon className="w-3 h-3" /> {meta.label}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-h3 font-bold text-ink">{formatPrice(o.amount)}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-ink-subtle shrink-0" />
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
