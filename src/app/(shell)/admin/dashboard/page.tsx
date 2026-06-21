"use client";
import { useApp } from "@/lib/store";
import { formatPrice, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import Link from "next/link";
import { Package, Clock, CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";

export default function AdminDashboardPage() {
  const { state } = useApp();
  const products = state.products.filter((p) => p.source === "market_square");
  const live = products.filter((p) => p.status === "live");
  const pending = products.filter((p) => p.status === "pending");
  const qcApproved = products.filter((p) => p.status === "qc_approved");
  const rejected = products.filter((p) => p.status === "rejected");

  const stats = [
    { label: "Awaiting My Approval", value: qcApproved.length, icon: CheckCircle, color: "text-primary-700 bg-primary-50", href: "/admin/products/pending" },
    { label: "In QC Review", value: pending.length, icon: Clock, color: "text-warning-600 bg-warning-50", href: "/admin/products/pending" },
    { label: "Live Products", value: live.length, icon: ShoppingBag, color: "text-secondary bg-secondary-50", href: "/admin/products/pending" },
    { label: "Rejected", value: rejected.length, icon: Package, color: "text-error bg-error-50", href: "/admin/products/pending" },
  ];

  return (
    <PageTransition>
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 text-ink">Admin Dashboard</h1>
            <p className="text-small text-ink-subtle mt-1">Welcome back, {state.currentUser.name}</p>
          </div>
          <Link href="/admin/products/pending"><Button>View Approval Queue <ArrowRight className="w-4 h-4" /></Button></Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.label} href={s.href}>
                <Card className={cn("flex flex-col gap-3 hover:shadow-lifted transition-shadow cursor-pointer")}>
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.color)}><Icon className="w-5 h-5" /></div>
                  <div><p className="text-h2 font-bold text-ink">{s.value}</p><p className="text-caption text-ink-subtle">{s.label}</p></div>
                </Card>
              </Link>
            );
          })}
        </div>

        {qcApproved.length > 0 && (
          <Card padding="none">
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary-50">
              <h3 className="text-h3 text-ink">Awaiting Your Approval</h3>
              <Link href="/admin/products/pending"><Button variant="ghost" size="sm">View all <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
            </div>
            <div className="divide-y divide-primary-50">
              {qcApproved.slice(0, 5).map((p) => (
                <Link key={p.id} href={`/admin/products/${p.id}/review`} className="flex items-center justify-between px-6 py-3.5 hover:bg-bg transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 shrink-0 overflow-hidden">
                      {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-small font-medium text-ink truncate">{p.name}</p>
                      <p className="text-caption text-ink-subtle">{p.department} &middot; {formatPrice(p.price)}</p>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
