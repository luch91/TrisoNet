"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/store";
import { useParams, useSearchParams } from "next/navigation";
import { MOCK_USERS } from "@/lib/mock-data";
import { formatPrice, generateId, generateConfirmationNumber } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { CheckCircle, Lock, CreditCard, ShieldCheck, Bell, Home } from "lucide-react";

export default function CheckoutPage() {
  const { state, dispatch, addToast } = useApp();
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.productId as string;
  const product = state.products.find((p) => p.id === productId);
  const agreedPriceParam = searchParams.get("price");
  const finalPrice = agreedPriceParam ? parseFloat(agreedPriceParam) : product?.price ?? 0;
  const seller = product ? MOCK_USERS.find((u) => u.id === product.sellerId) : null;

  const [step, setStep] = useState<"summary" | "processing" | "success">("summary");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  if (!product) return <PageTransition><div className="p-6 text-center text-ink-subtle">Product not found.</div></PageTransition>;

  async function handleConfirmPay() {
    if (!agreedToTerms) { setTermsError(true); return; }
    setTermsError(false);
    setStep("processing");
    await new Promise((r) => setTimeout(r, 1800));
    const confNum = generateConfirmationNumber();
    setConfirmationNumber(confNum);
    dispatch({ type: "ADD_TRANSACTION", transaction: { id: generateId(), productId: product!.id, productName: product!.name, buyerId: state.currentUser.id, sellerId: product!.sellerId, amount: finalPrice, status: "completed", confirmationNumber: confNum, createdAt: new Date().toISOString() } });
    dispatch({ type: "ADD_NOTIFICATION", notification: { id: `notif-${Date.now()}`, userId: state.currentUser.id, type: "payment_confirmed", title: "Payment Confirmed", message: `Your payment of ${formatPrice(finalPrice)} for ${product!.name} has been confirmed. Ref: ${confNum}`, read: false, linkTo: `/notifications`, createdAt: new Date().toISOString() } });
    dispatch({ type: "ADD_NOTIFICATION", notification: { id: `notif-${Date.now() + 1}`, userId: product!.sellerId, type: "payment_confirmed", title: "Payment Received", message: `${state.currentUser.name} completed payment of ${formatPrice(finalPrice)} for ${product!.name}. Ref: ${confNum}`, read: false, linkTo: `/portal/${product!.sellerId}`, createdAt: new Date().toISOString() } });
    addToast({ type: "success", title: "Payment confirmed!", message: `Ref: ${confNum}` });
    setStep("success");
  }

  if (step === "processing") return (
    <PageTransition>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-h3 text-ink">Processing payment...</p>
          <p className="text-small text-ink-subtle">Please don&apos;t close this page.</p>
        </div>
      </div>
    </PageTransition>
  );

  if (step === "success") return (
    <PageTransition>
      <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
        <Card className="text-center">
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }} className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", damping: 12 }}><CheckCircle className="w-10 h-10 text-secondary" /></motion.div>
          </motion.div>
          <h2 className="text-h2 text-ink mb-1">Payment Confirmed!</h2>
          <p className="text-small text-ink-subtle mb-4">Confirmation: <span className="font-semibold text-ink">{confirmationNumber}</span></p>
          <div className="bg-bg rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-small"><span className="text-ink-subtle">Product</span><span className="font-medium text-ink">{product.name}</span></div>
            <div className="flex justify-between text-small"><span className="text-ink-subtle">Amount paid</span><span className="font-bold text-ink">{formatPrice(finalPrice)}</span></div>
            {seller && <div className="flex justify-between text-small"><span className="text-ink-subtle">Seller</span><span className="font-medium text-ink">{seller.name}</span></div>}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-primary-50 rounded-xl p-3 text-left border border-primary-100"><div className="flex items-center gap-1.5 text-caption font-semibold text-primary-700 mb-1.5"><Bell className="w-3.5 h-3.5" /> Buyer receives</div><p className="text-caption text-ink-muted">Payment of {formatPrice(finalPrice)} confirmed for {product.name}. Ref: {confirmationNumber}</p></div>
            <div className="bg-secondary-50 rounded-xl p-3 text-left border border-secondary-200"><div className="flex items-center gap-1.5 text-caption font-semibold text-secondary mb-1.5"><Bell className="w-3.5 h-3.5" /> Seller receives</div><p className="text-caption text-ink-muted">Payment received from buyer. {formatPrice(finalPrice)} for {product.name}.</p></div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/marketplace"><Button variant="outline"><Home className="w-4 h-4" /> Browse More</Button></Link>
            <Link href="/notifications"><Button><Bell className="w-4 h-4" /> View Notifications</Button></Link>
          </div>
        </Card>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: "Marketplace", href: "/marketplace" }, { label: product.name, href: `/marketplace/${product.id}` }, { label: "Checkout" }]} />
        <h1 className="text-h1 text-ink mt-4 mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <h3 className="text-h3 text-ink mb-4">Order Summary</h3>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-bg shrink-0 overflow-hidden">{product.images[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}</div>
                <div className="flex-1">
                  <p className="text-small font-semibold text-ink">{product.name}</p>
                  {seller && <div className="flex items-center gap-2 mt-1"><Avatar name={seller.name} size="xs" /><p className="text-caption text-ink-subtle">{seller.name}</p>{seller.role === "citizen_seller" && <Link href={`/portal/${seller.id}`} className="text-caption text-primary-600 hover:underline">View portal</Link>}</div>}
                  {agreedPriceParam && <p className="text-caption text-secondary mt-1 font-medium">Negotiated price</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-h3 font-bold text-ink">{formatPrice(finalPrice)}</p>
                  {agreedPriceParam && parseFloat(agreedPriceParam) < product.price && <p className="text-caption text-ink-subtle line-through">{formatPrice(product.price)}</p>}
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-secondary" />
                <h3 className="text-h3 text-ink">Seller Payment Details</h3>
                <span className="ml-auto inline-flex items-center gap-1 text-caption text-secondary font-medium"><ShieldCheck className="w-3.5 h-3.5" /> Secure</span>
              </div>
              <div className="bg-secondary-50 rounded-xl p-4 border border-secondary-100 space-y-3">
                <div className="flex items-center gap-2 text-small font-medium text-secondary mb-2"><ShieldCheck className="w-4 h-4" /> Payments go directly to the seller</div>
                <div className="space-y-2 text-small">
                  <div className="flex justify-between"><span className="text-ink-subtle">Bank</span><span className="font-medium text-ink">First Bank Nigeria</span></div>
                  <div className="flex justify-between"><span className="text-ink-subtle">Account</span><span className="font-medium text-ink">&bull;&bull;&bull;&bull;&bull;&bull;3421</span></div>
                  <div className="flex justify-between"><span className="text-ink-subtle">Account Name</span><span className="font-medium text-ink">{seller?.name ?? "Seller"}</span></div>
                  <div className="flex justify-between"><span className="text-ink-subtle">Amount</span><span className="font-bold text-ink">{formatPrice(finalPrice)}</span></div>
                </div>
              </div>
              <p className="text-caption text-ink-subtle mt-3 flex items-start gap-1.5"><Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />Account details are shared only after offer acceptance. TrisoNet facilitates the connection &mdash; payment is direct between buyer and seller.</p>
            </Card>
            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => { setAgreedToTerms(e.target.checked); setTermsError(false); }} className="mt-0.5 accent-primary w-4 h-4" />
              <label htmlFor="terms" className="text-small text-ink-muted cursor-pointer">I confirm the payment details are correct and agree to TrisoNet&apos;s trading terms.</label>
            </div>
            {termsError && <p className="text-caption text-error">Please confirm the terms to proceed.</p>}
          </div>
          <div>
            <Card className="sticky top-24">
              <h3 className="text-h3 text-ink mb-4">Total</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-small"><span className="text-ink-subtle">Subtotal</span><span className="text-ink">{formatPrice(finalPrice)}</span></div>
                <div className="flex justify-between text-small"><span className="text-ink-subtle">Platform fee</span><span className="text-secondary">Free</span></div>
                <div className="h-px bg-primary-100 my-2" />
                <div className="flex justify-between font-bold text-ink"><span>Total</span><span>{formatPrice(finalPrice)}</span></div>
              </div>
              <Button className="w-full" size="lg" onClick={handleConfirmPay}><CreditCard className="w-4 h-4" /> Confirm &amp; Pay</Button>
              <p className="text-caption text-ink-subtle text-center mt-3 flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Secured by TrisoNet</p>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
