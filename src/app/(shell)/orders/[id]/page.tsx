"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mock-data";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Breadcrumb from "@/components/ui/Breadcrumb";
import EmptyState from "@/components/ui/EmptyState";
import { Package, CheckCircle, Clock, Truck, MapPin, MessageSquare, Download } from "lucide-react";

const TIMELINE = [
  { key: "placed", label: "Order placed", desc: "We received your order" },
  { key: "confirmed", label: "Payment confirmed", desc: "Funds confirmed with seller" },
  { key: "shipped", label: "Preparing / shipped", desc: "Seller is fulfilling your order" },
  { key: "delivered", label: "Delivered", desc: "Order complete" },
];

export default function OrderDetailPage() {
  const { state } = useApp();
  const params = useParams();
  const router = useRouter();
  const order = state.transactions.find((t) => t.id === params.id);

  if (!order) {
    return (
      <PageTransition>
        <div className="p-6 max-w-2xl mx-auto">
          <EmptyState icon={Package} title="Order not found" description="This order doesn't exist or belongs to another account." action={{ label: "Back to Orders", onClick: () => router.push("/orders") }} />
        </div>
      </PageTransition>
    );
  }

  const product = state.products.find((p) => p.id === order.productId);
  const seller = MOCK_USERS.find((u) => u.id === order.sellerId);
  // Completed orders show full timeline; processing stops at "confirmed".
  const reachedIdx = order.status === "completed" ? TIMELINE.length - 1 : 1;

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Breadcrumb items={[{ label: "My Orders", href: "/orders" }, { label: order.confirmationNumber }]} />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-h1 text-ink">Order {order.confirmationNumber}</h1>
            <p className="text-small text-ink-subtle mt-1">Placed {formatDate(order.createdAt)}</p>
          </div>
          <Button variant="outline" size="sm"><Download className="w-4 h-4" /> Receipt</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Item */}
            <Card>
              <h3 className="text-h3 text-ink mb-4">Item</h3>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-bg shrink-0 overflow-hidden">
                  {product?.images[0] ? <img src={product.images[0]} alt={order.productName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-7 h-7 text-primary-200" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-small font-semibold text-ink">{order.productName}</p>
                  {product?.location && <p className="text-caption text-ink-subtle flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {product.location}</p>}
                  {product && <Link href={`/marketplace/${product.id}`} className="text-caption text-primary-600 hover:underline mt-1 inline-block">View product</Link>}
                </div>
                <p className="text-h3 font-bold text-ink shrink-0">{formatPrice(order.amount)}</p>
              </div>
            </Card>

            {/* Timeline */}
            <Card>
              <h3 className="text-h3 text-ink mb-5">Tracking</h3>
              <div className="space-y-0">
                {TIMELINE.map((t, i) => {
                  const done = i <= reachedIdx;
                  const current = i === reachedIdx;
                  const Icon = i === 0 ? Package : i === 1 ? CheckCircle : i === 2 ? Truck : CheckCircle;
                  return (
                    <div key={t.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", done ? "bg-secondary text-white" : current ? "bg-primary text-ink" : "bg-bg text-ink-subtle border border-primary-100")}>
                          {done ? <Icon className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        {i < TIMELINE.length - 1 && <div className={cn("w-0.5 flex-1 min-h-8 my-1", done && i < reachedIdx ? "bg-secondary" : "bg-primary-100")} />}
                      </div>
                      <div className={cn("pb-6", i === TIMELINE.length - 1 && "pb-0")}>
                        <p className={cn("text-small font-medium", done ? "text-ink" : "text-ink-subtle")}>{t.label}</p>
                        <p className="text-caption text-ink-subtle">{t.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="text-h3 text-ink mb-3">Summary</h3>
              <div className="space-y-2 text-small">
                <div className="flex justify-between"><span className="text-ink-subtle">Subtotal</span><span className="text-ink">{formatPrice(order.amount)}</span></div>
                <div className="flex justify-between"><span className="text-ink-subtle">Platform fee</span><span className="text-secondary">Free</span></div>
                <div className="h-px bg-primary-100 my-2" />
                <div className="flex justify-between font-bold text-ink"><span>Total paid</span><span>{formatPrice(order.amount)}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-primary-50 text-caption text-ink-subtle">
                <p>Ref: <span className="font-medium text-ink">{order.confirmationNumber}</span></p>
                <p className="mt-1 capitalize">Status: <span className="font-medium text-ink">{order.status}</span></p>
              </div>
            </Card>
            {seller && (
              <Card>
                <p className="text-caption text-ink-subtle mb-3 font-medium uppercase tracking-wide">Seller</p>
                <div className="flex items-center gap-3">
                  <Avatar name={seller.name} size="md" />
                  <div className="min-w-0">
                    <p className="text-small font-semibold text-ink truncate">{seller.name}</p>
                    {seller.location && <p className="text-caption text-ink-subtle">{seller.location}</p>}
                  </div>
                </div>
                {seller.role === "citizen_seller" && <Link href={`/portal/${seller.id}`} className="block mt-3"><Button variant="outline" size="sm" className="w-full">Visit Portal</Button></Link>}
                <Button variant="ghost" size="sm" className="w-full mt-2"><MessageSquare className="w-4 h-4" /> Contact seller</Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
