"use client";
import { useApp } from "@/lib/store";
import { useState } from "react";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { Plus, Search, Package } from "lucide-react";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "QC Approved", value: "qc_approved" },
  { label: "Live", value: "live" },
  { label: "Rejected", value: "rejected" },
];

export default function ManagerInventoryPage() {
  const { state } = useApp();
  const dept = state.currentUser.department;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const products = state.products
    .filter((p) => p.source === "market_square" && p.department === dept)
    .filter((p) => statusFilter === "all" || p.status === statusFilter)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageTransition>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Manager", href: "/manager/dashboard" }, { label: "Inventory" }]} />

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-h1 text-ink">{dept} Inventory</h1>
          <Link href="/manager/inventory/new">
            <Button><Plus className="w-4 h-4" /> Stock Product</Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2.5 rounded-md border border-primary-200 bg-surface text-small focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-caption font-medium transition-colors",
                  statusFilter === f.value
                    ? "bg-primary text-ink"
                    : "bg-surface text-ink-subtle border border-primary-100 hover:border-primary-300"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={search ? "Try adjusting your search terms." : "Start by stocking a new product for your department."}
            action={{ label: "Stock New Product", onClick: () => { window.location.href = "/manager/inventory/new"; } }}
          />
        ) : (
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-50 bg-bg">
                    <th className="text-left px-6 py-3 text-caption font-medium text-ink-subtle">Product</th>
                    <th className="text-left px-4 py-3 text-caption font-medium text-ink-subtle">Price</th>
                    <th className="text-left px-4 py-3 text-caption font-medium text-ink-subtle">Qty</th>
                    <th className="text-left px-4 py-3 text-caption font-medium text-ink-subtle">Status</th>
                    <th className="text-left px-4 py-3 text-caption font-medium text-ink-subtle">Submitted</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-bg transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-50 shrink-0 overflow-hidden">
                            {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="text-small font-medium text-ink">{p.name}</p>
                            <p className="text-caption text-ink-subtle">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-small font-medium text-ink">{formatPrice(p.price)}</td>
                      <td className="px-4 py-4 text-small text-ink-subtle">{p.quantity}</td>
                      <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-4 text-small text-ink-subtle">{formatDate(p.submittedAt)}</td>
                      <td className="px-4 py-4">
                        {p.status === "rejected" && p.qcComment && (
                          <span className="text-caption text-error" title={p.qcComment}>&#9888; See feedback</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
