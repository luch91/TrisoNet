"use client";
import { useApp } from "@/lib/store";
import { formatPrice, formatRelativeTime, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import Link from "next/link";
import { Package, Clock, CheckCircle, XCircle, Plus, ArrowRight } from "lucide-react";

export default function ManagerDashboardPage() {
  const { state } = useApp();
  const dept = state.currentUser.department;
  const myProducts = state.products.filter(
    (p) => p.source === "market_square" && p.department === dept
  );

  const stats = [
    { label: "Total Products", value: myProducts.length, icon: Package, color: "text-primary-600 bg-primary-50" },
    { label: "Pending QC", value: myProducts.filter((p) => p.status === "pending").length, icon: Clock, color: "text-warning-600 bg-warning-50" },
    { label: "Approved & Live", value: myProducts.filter((p) => p.status === "live").length, icon: CheckCircle, color: "text-secondary bg-secondary-50" },
    { label: "Rejected", value: myProducts.filter((p) => p.status === "rejected").length, icon: XCircle, color: "text-error bg-error-50" },
  ];

  const activity = state.activity.slice(0, 8);

  const activityIcon = (type: string) => {
    if (type === "submitted") return <div className="w-2 h-2 rounded-full bg-primary" />;
    if (type === "approved" || type === "qc_approved") return <div className="w-2 h-2 rounded-full bg-secondary" />;
    if (type === "rejected") return <div className="w-2 h-2 rounded-full bg-error" />;
    return <div className="w-2 h-2 rounded-full bg-ink-subtle" />;
  };

  return (
    <PageTransition>
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 text-ink">Manager Dashboard</h1>
            <p className="text-small text-ink-subtle mt-1">{dept} Department &middot; {state.currentUser.name}</p>
          </div>
          <Link href="/manager/inventory/new">
            <Button size="lg">
              <Plus className="w-4 h-4" /> Stock New Product
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="flex flex-col gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-h2 font-bold text-ink">{s.value}</p>
                  <p className="text-caption text-ink-subtle">{s.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Products */}
          <Card className="lg:col-span-2" padding="none">
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary-50">
              <h3 className="text-h3 text-ink">My Products</h3>
              <Link href="/manager/inventory">
                <Button variant="ghost" size="sm">View all <ArrowRight className="w-3.5 h-3.5" /></Button>
              </Link>
            </div>
            <div className="divide-y divide-primary-50">
              {myProducts.slice(0, 5).map((p) => (
                <Link key={p.id} href="/manager/inventory" className="flex items-center justify-between px-6 py-3.5 hover:bg-bg transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 shrink-0 overflow-hidden">
                      {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-small font-medium text-ink truncate">{p.name}</p>
                      <p className="text-caption text-ink-subtle">{formatPrice(p.price)} &middot; Qty {p.quantity}</p>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
              {myProducts.length === 0 && (
                <div className="px-6 py-8 text-center text-ink-subtle text-small">
                  No products yet.{" "}
                  <Link href="/manager/inventory/new" className="text-primary-600 hover:underline">
                    Stock your first product.
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Activity Feed */}
          <Card padding="none">
            <div className="px-6 py-4 border-b border-primary-50">
              <h3 className="text-h3 text-ink">Recent Activity</h3>
            </div>
            <div className="divide-y divide-primary-50">
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="mt-1.5">{activityIcon(a.type)}</div>
                  <div className="min-w-0">
                    <p className="text-caption font-medium text-ink truncate">{a.productName}</p>
                    <p className="text-caption text-ink-subtle capitalize">{a.type.replace("_", " ")}</p>
                    <p className="text-[11px] text-ink-subtle mt-0.5">{formatRelativeTime(a.createdAt)}</p>
                  </div>
                </div>
              ))}
              {activity.length === 0 && (
                <div className="px-5 py-6 text-center text-caption text-ink-subtle">No activity yet</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
