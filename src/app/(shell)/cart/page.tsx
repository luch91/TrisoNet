"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { ShoppingCart, Trash2, Minus, Plus, Lock, ArrowRight, Tag } from "lucide-react";

export default function CartPage() {
  const { state, dispatch } = useApp();
  const router = useRouter();

  const items = state.cart
    .map((c) => ({ item: c, product: state.products.find((p) => p.id === c.productId) }))
    .filter((x) => x.product);

  const subtotal = items.reduce((sum, { item, product }) => sum + (product!.price * item.quantity), 0);

  // Gate the cart behind a buyer account.
  if (!state.isAuthenticated || state.currentRole !== "buyer") {
    return (
      <PageTransition>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-h2 text-ink mb-2">Sign in to view your cart</h1>
          <p className="text-small text-ink-subtle mb-6">Only verified buyers can add items and check out on TrisoNet.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login?redirect=/cart"><Button variant="outline">Sign in</Button></Link>
            <Link href="/signup?redirect=/cart"><Button>Create buyer account</Button></Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Breadcrumb items={[{ label: "Marketplace", href: "/marketplace" }, { label: "Cart" }]} />
        <h1 className="text-h1 text-ink">Your Cart</h1>

        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            description="Browse the marketplace and add products to get started."
            action={{ label: "Browse Marketplace", onClick: () => router.push("/marketplace") }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-3">
              {items.map(({ item, product }) => (
                <Card key={product!.id} padding="none" className="flex items-center gap-4 p-4">
                  <Link href={`/marketplace/${product!.id}`} className="w-20 h-20 rounded-lg bg-bg shrink-0 overflow-hidden">
                    {product!.images[0] && <img src={product!.images[0]} alt={product!.name} className="w-full h-full object-cover" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/marketplace/${product!.id}`} className="text-small font-semibold text-ink hover:text-primary-600 line-clamp-1">{product!.name}</Link>
                    <p className="text-caption text-ink-subtle mt-0.5">{product!.sellerName}</p>
                    <p className="text-small font-bold text-ink mt-1">{formatPrice(product!.price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center border border-primary-200 rounded-md">
                      <button onClick={() => dispatch({ type: "SET_CART_QTY", productId: product!.id, quantity: item.quantity - 1 })} className="p-1.5 hover:bg-bg transition-colors rounded-l-md" aria-label="Decrease">
                        <Minus className="w-3.5 h-3.5 text-ink-subtle" />
                      </button>
                      <span className="w-9 text-center text-small font-medium text-ink">{item.quantity}</span>
                      <button onClick={() => dispatch({ type: "SET_CART_QTY", productId: product!.id, quantity: Math.min(item.quantity + 1, product!.quantity) })} className="p-1.5 hover:bg-bg transition-colors rounded-r-md" aria-label="Increase">
                        <Plus className="w-3.5 h-3.5 text-ink-subtle" />
                      </button>
                    </div>
                    <button onClick={() => dispatch({ type: "REMOVE_FROM_CART", productId: product!.id })} className="text-caption text-error hover:underline flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </Card>
              ))}
              <button onClick={() => dispatch({ type: "CLEAR_CART" })} className="text-caption text-ink-subtle hover:text-error transition-colors">Clear cart</button>
            </div>

            <Card className="sticky top-24">
              <h3 className="text-h3 text-ink mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-small"><span className="text-ink-subtle">Items ({items.reduce((s, x) => s + x.item.quantity, 0)})</span><span className="text-ink">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-small"><span className="text-ink-subtle">Platform fee</span><span className="text-secondary">Free</span></div>
                <div className="h-px bg-primary-100 my-2" />
                <div className="flex justify-between font-bold text-ink"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
              </div>
              <Button className="w-full" size="lg" onClick={() => router.push("/cart/checkout")}>
                Checkout <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-caption text-ink-subtle text-center mt-3 flex items-center justify-center gap-1"><Tag className="w-3 h-3" /> Negotiated prices apply at checkout where available</p>
            </Card>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
