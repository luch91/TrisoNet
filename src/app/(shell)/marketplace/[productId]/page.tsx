"use client";
import { useApp } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mock-data";
import { formatPrice, formatDate } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import { MapPin, Package, Store, Users, ShoppingCart, MessageSquare, Lock, ArrowRight, Tag } from "lucide-react";

export default function ProductDetailPage() {
  const { state } = useApp();
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  const product = state.products.find((p) => p.id === productId);
  const canTransact = state.currentRole === "buyer";
  const isVisitor = state.currentRole === "visitor";
  const seller = product ? MOCK_USERS.find((u) => u.id === product.sellerId) ?? null : null;

  if (!product) {
    return (
      <PageTransition>
        <div className="p-6">
          <EmptyState icon={Package} title="Product not found" description="This product doesn't exist or has been removed." action={{ label: "Browse Marketplace", onClick: () => router.push("/marketplace") }} />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="w-full h-80 rounded-xl overflow-hidden bg-bg">
              {product.images[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-16 h-16 text-primary-200" /></div>}
            </div>
            <Card>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {product.source === "market_square" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-caption font-medium border border-primary-100"><Store className="w-3.5 h-3.5" /> Market Square</span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-50 text-secondary text-caption font-medium border border-secondary-200"><Users className="w-3.5 h-3.5" /> Citizen Listing</span>
                )}
                {product.negotiable && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-ink text-caption font-medium"><Tag className="w-3.5 h-3.5" /> Offers accepted</span>}
              </div>
              <h1 className="text-h1 text-ink mb-2">{product.name}</h1>
              {product.location && <div className="flex items-center gap-1.5 text-small text-ink-subtle mb-4"><MapPin className="w-3.5 h-3.5" /> {product.location}</div>}
              <p className="text-body text-ink-muted">{product.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-primary-50">
                <div><p className="text-caption text-ink-subtle">Category</p><p className="text-small font-medium text-ink mt-0.5">{product.category ?? product.department}</p></div>
                <div><p className="text-caption text-ink-subtle">Available</p><p className="text-small font-medium text-ink mt-0.5">{product.quantity} units</p></div>
                <div><p className="text-caption text-ink-subtle">Listed</p><p className="text-small font-medium text-ink mt-0.5">{formatDate(product.submittedAt)}</p></div>
              </div>
            </Card>
          </div>
          <div className="space-y-4">
            <Card>
              <p className="text-h1 font-bold text-ink">{formatPrice(product.price)}</p>
              {product.negotiable && <p className="text-caption text-secondary mt-1">Open to negotiation</p>}
              {canTransact && (
                <div className="space-y-3 mt-5">
                  {product.negotiable && <Link href={`/marketplace/${product.id}/negotiate`} className="block"><Button className="w-full" size="lg"><MessageSquare className="w-4 h-4" /> Make an Offer</Button></Link>}
                  <Link href={`/checkout/${product.id}`} className="block"><Button variant="secondary" className="w-full" size="lg"><ShoppingCart className="w-4 h-4" /> Buy Now</Button></Link>
                </div>
              )}
              {isVisitor && (
                <div className="mt-5 bg-bg rounded-xl p-4 border border-primary-100 text-center">
                  <Lock className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                  <p className="text-small font-semibold text-ink mb-1">Sign up as a Buyer to continue</p>
                  <p className="text-caption text-ink-subtle mb-3">Only verified buyers can make offers and complete purchases.</p>
                  <Button size="sm" className="w-full">Create Buyer Account</Button>
                </div>
              )}
              {!canTransact && !isVisitor && <div className="mt-5 bg-bg rounded-xl p-4 border border-primary-100 text-center"><p className="text-caption text-ink-subtle">Switch to the Buyer role to transact.</p></div>}
            </Card>
            {seller && (
              <Card>
                <p className="text-caption text-ink-subtle mb-3 font-medium uppercase tracking-wide">Seller</p>
                <div className="flex items-center gap-3">
                  <Avatar name={seller.name} size="md" />
                  <div><p className="text-small font-semibold text-ink">{seller.name}</p>{seller.location && <p className="text-caption text-ink-subtle">{seller.location}</p>}</div>
                </div>
                {seller.role === "citizen_seller" && <Link href={`/portal/${seller.id}`} className="block mt-3"><Button variant="outline" size="sm" className="w-full">View Seller Portal <ArrowRight className="w-3.5 h-3.5" /></Button></Link>}
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
