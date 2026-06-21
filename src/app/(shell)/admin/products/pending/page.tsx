"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { formatPrice, formatDate } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import EmptyState from "@/components/ui/EmptyState";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { Package } from "lucide-react";

export default function AdminProductsPendingPage() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState("qc_approved");
  const marketProducts = state.products.filter((p) => p.source === "market_square");

  const tabs = [
    { id: "qc_approved", label: "Awaiting My Approval", count: marketProducts.filter((p) => p.status === "qc_approved").length },
    { id: "pending", label: "In QC Review", count: marketProducts.filter((p) => p.status === "pending").length },
    { id: "rejected", label: "Rejected", count: marketProducts.filter((p) => p.status === "rejected").length },
    { id: "live", label: "Live", count: marketProducts.filter((p) => p.status === "live").length },
  ];

  const filtered = marketProducts.filter((p) => p.status === activeTab);
  const emptyDescription = activeTab === "qc_approved" ? "No products awaiting your approval." : activeTab === "pending" ? "No products in QC review." : activeTab === "rejected" ? "No rejected products." : "No live products yet.";

  return (
    <PageTransition>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Products" }]} />
        <h1 className="text-h1 text-ink">Product Management</h1>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        {filtered.length === 0 ? (
          <EmptyState icon={Package} title="Nothing here" description={emptyDescription} />
        ) : (
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-50 bg-bg">
                    <th className="text-left px-6 py-3 text-caption font-medium text-ink-subtle">Product</th>
                    <th className="text-left px-4 py-3 text-caption font-medium text-ink-subtle">Department</th>
                    <th className="text-left px-4 py-3 text-caption font-medium text-ink-subtle">Price</th>
                    <th className="text-left px-4 py-3 text-caption font-medium text-ink-subtle">Status</th>
                    <th className="text-left px-4 py-3 text-caption font-medium text-ink-subtle">Updated</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-bg transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-50 shrink-0 overflow-hidden">
                            {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                          </div>
                          <div><p className="text-small font-medium text-ink">{p.name}</p><p className="text-caption text-ink-subtle">{p.sellerName}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-small text-ink-subtle">{p.department}</td>
                      <td className="px-4 py-4 text-small font-medium text-ink">{formatPrice(p.price)}</td>
                      <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-4 text-small text-ink-subtle">{formatDate(p.updatedAt)}</td>
                      <td className="px-4 py-4"><Link href={`/admin/products/${p.id}/review`} className="text-primary-600 text-small font-medium hover:underline">{activeTab === "qc_approved" ? "Review →" : "View →"}</Link></td>
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
