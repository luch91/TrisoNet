"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mock-data";
import { formatPrice, generateId, generateConfirmationNumber } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { CheckCircle, Lock, CreditCard, ShieldCheck, Package } from "lucide-react";
import type { Transaction } from "@/lib/mock-data";

export default function CartCheckoutPage() {
  const { state, dispatch, addToast } = useApp();
  const router = useRouter();

  const items = state.cart
    .map((c) => ({ item: c, product: state.products.find((p) => p.id === c.productId) }))
    .filter((x) => x.product);
  const subtotal = items.reduce((sum, { item, product }) => sum + product!.price * item.quantity, 0);

  const [step, setStep] = useState<"summary" | "processing" | "success">("summary");
  const [agreed, setAgreed] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [confNum, setConfNum] = useState("");

  if (!state.isAuthenticated || state.currentRole !== "buyer") {
    if (typeof window !== "undefined") router.replace("/cart");
    return null;
  }

  if (items.length === 0 && step !== "success") {
    return (
      <PageTransition>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <Package className="w-12 h-12 text-primary-300 mx-auto mb-3" />
          <h1 className="text-h2 text-ink mb-2">Nothing to check out</h1>
          <p className="text-small text-ink-subtle mb-6">Your cart is empty.</p>
          <Link href="/marketplace"><Button>Browse Marketplace</Button></Link>
        </div>
      </PageTransition>
    );
  }

  async function handlePay() {
    if (!agreed) { setTermsError(true); return; }
    setTermsError(false);
    setStep("processing");
    await new Promise((r) => setTimeout(r, 1800));
    const ref = generateConfirmationNumber();
    setConfNum(ref);

    items.forEach(({ item, product }, idx) => {
      const txn: Transaction = {
        id: generateId(),
        productId: product!.id,
        productName: product!.name,
        buyerId: state.currentUser.id,
        sellerId: product!.sellerId,
        amount: product!.price * item.quantity,
        status: "completed",
        confirmationNumber: ref,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_TRANSACTION", transaction: txn });
      dispatch({ type: "ADD_NOTIFICATION", notification: { id: `notif-${Date.now() + idx}`, userId: product!.sellerId, type: "payment_confirmed", title: "Payment Received", message: `${state.currentUser.name} purchased ${product!.name} (${formatPrice(product!.price * item.quantity)}). Ref: ${ref}`, read: false, linkTo: `/portal/${product!.sellerId}`, createdAt: new Date().toISOString() } });
    });
    dispatch({ type: "ADD_NOTIFICATION", notification: { id: `notif-${Date.now() + 999}`, userId: state.currentUser.id, type: "payment_confirmed", title: "Order Confirmed", message: `Your order of ${items.length} item${items.length !== 1 ? "s" : ""} (${formatPrice(subtotal)}) is confirmed. Ref: ${ref}`, read: false, linkTo: "/orders", createdAt: new Date().toISOString() } });
    dispatch({ type: "CLEAR_CART" });
    addToast({ type: "success", title: "Order confirmed!", message: `Ref: ${ref}` });
    setStep("success");
  }

  if (step === "processing") {
    return (
      <PageTransition>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-h3 text-ink">Processing your order...</p>
            <p className="text-small text-ink-subtle">Please don&apos;t close this page.</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (step === "success") {
    return (
      <PageTransition>
        <div className="max-w-xl mx-auto px-4 py-12">
          <Card className="text-center">
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }} className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-secondary" />
            </motion.div>
            <h2 className="text-h2 text-ink mb-1">Order Confirmed!</h2>
            <p className="text-small text-ink-subtle mb-6">Confirmation: <span className="font-semibold text-ink">{confNum}</span></p>
            <div className="flex gap-3 justify-center">
              <Link href="/orders"><Button><Package className="w-4 h-4" /> View Orders</Button></Link>
              <Link href="/marketplace"><Button variant="outline">Continue Shopping</Button></Link>
            </div>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
        <h1 className="text-h1 text-ink mt-4 mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <h3 className="text-h3 text-ink mb-4">Order Summary ({items.length} item{items.length !== 1 ? "s" : ""})</h3>
              <div className="divide-y divide-primary-50">
                {items.map(({ item, product }) => {
                  const seller = MOCK_USERS.find((u) => u.id === product!.sellerId);
                  return (
                    <div key={product!.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="w-16 h-16 rounded-lg bg-bg shrink-0 overflow-hidden">{product!.images[0] && <img src={product!.images[0]} alt={product!.name} className="w-full h-full object-cover" />}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-small font-medium text-ink line-clamp-1">{product!.name}</p>
                        <p className="text-caption text-ink-subtle">{seller?.name ?? product!.sellerName} · Qty {item.quantity}</p>
                      </div>
                      <p className="text-small font-bold text-ink shrink-0">{formatPrice(product!.price * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-secondary" />
                <h3 className="text-h3 text-ink">Payment</h3>
                <span className="ml-auto inline-flex items-center gap-1 text-caption text-secondary font-medium"><ShieldCheck className="w-3.5 h-3.5" /> Secure</span>
              </div>
              <div className="bg-secondary-50 rounded-xl p-4 border border-secondary-100 text-small text-ink-muted">
                Payments are routed directly to each verified seller. TrisoNet facilitates the connection — funds move between buyer and seller, with confirmation tracked here.
              </div>
            </Card>
            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setTermsError(false); }} className="mt-0.5 accent-primary w-4 h-4" />
              <label htmlFor="terms" className="text-small text-ink-muted cursor-pointer">I confirm the order details and agree to TrisoNet&apos;s trading terms.</label>
            </div>
            {termsError && <p className="text-caption text-error">Please confirm the terms to proceed.</p>}
          </div>
          <Card className="sticky top-24">
            <h3 className="text-h3 text-ink mb-4">Total</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-small"><span className="text-ink-subtle">Subtotal</span><span className="text-ink">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-small"><span className="text-ink-subtle">Platform fee</span><span className="text-secondary">Free</span></div>
              <div className="h-px bg-primary-100 my-2" />
              <div className="flex justify-between font-bold text-ink"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
            </div>
            <Button className="w-full" size="lg" onClick={handlePay}><CreditCard className="w-4 h-4" /> Pay {formatPrice(subtotal)}</Button>
            <p className="text-caption text-ink-subtle text-center mt-3 flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Secured by TrisoNet</p>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
