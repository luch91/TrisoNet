"use client";
import { useApp } from "@/lib/store";
import { formatPrice, formatRelativeTime } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import { ClipboardList, Clock } from "lucide-react";

export default function QCQueuePage() {
  const { state } = useApp();
  const pending = state.products
    .filter((p) => p.status === "pending" && p.source === "market_square")
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return (
    <PageTransition>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 text-ink">QC Review Queue</h1>
            <p className="text-small text-ink-subtle mt-1">{pending.length} product{pending.length !== 1 ? "s" : ""} awaiting review</p>
          </div>
        </div>

        {pending.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Queue is clear!" description="All products have been reviewed. Check back later for new submissions." />
        ) : (
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-50 bg-bg">
                    <th className="text-left px-6 py-3 text-caption font-medium text-ink-subtle">Product</th>
                    <th className="text-left px-4 py-3 text-caption font-medium text-ink-subtle">Department</th>
                    <th className="text-left px-4 py-3 text-caption font-medium text-ink-subtle">Submitted By</th>
                    <th className="text-left px-4 py-3 text-caption font-medium text-ink-subtle">Price</th>
                    <th className="text-left px-4 py-3 text-caption font-medium text-ink-subtle">Submitted</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {pending.map((p) => (
                    <tr key={p.id} className="hover:bg-bg transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-50 shrink-0 overflow-hidden">
                            {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                          </div>
                          <p className="text-small font-medium text-ink">{p.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-small text-ink-subtle">{p.department}</td>
                      <td className="px-4 py-4 text-small text-ink-subtle">{p.sellerName}</td>
                      <td className="px-4 py-4 text-small font-medium text-ink">{formatPrice(p.price)}</td>
                      <td className="px-4 py-4"><div className="flex items-center gap-1.5 text-small text-ink-subtle"><Clock className="w-3.5 h-3.5" />{formatRelativeTime(p.submittedAt)}</div></td>
                      <td className="px-4 py-4"><Link href={`/qc/review/${p.id}`} className="text-primary-600 text-small font-medium hover:underline">Review &rarr;</Link></td>
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
