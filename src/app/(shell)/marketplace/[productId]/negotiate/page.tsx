"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/store";
import { useParams } from "next/navigation";
import { MOCK_USERS } from "@/lib/mock-data";
import { formatPrice, formatRelativeTime, generateId, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { Send, CheckCircle, Tag, ShoppingCart } from "lucide-react";
import type { NegotiationMessage } from "@/lib/mock-data";

export default function NegotiatePage() {
  const { state, dispatch, addToast } = useApp();
  const params = useParams();
  const productId = params.productId as string;
  const product = state.products.find((p) => p.id === productId);
  const seller = product ? MOCK_USERS.find((u) => u.id === product.sellerId) : null;

  const negotiationId = `neg-${productId}-${state.currentUser.id}`;
  const negotiation = state.negotiations.find((n) => n.id === negotiationId) ?? state.negotiations.find((n) => n.productId === productId);

  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sellerTyping, setSellerTyping] = useState(false);
  const [amountError, setAmountError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = negotiation?.messages ?? [];
  const negotiationStatus = negotiation?.status ?? "active";
  const agreedPrice = negotiation?.agreedPrice;
  const messageCount = messages.length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageCount, sellerTyping]);

  if (!product || !seller) {
    return <PageTransition><div className="p-6 text-center text-ink-subtle">Product not found.</div></PageTransition>;
  }

  const canSendOffer = state.currentRole === "buyer" && negotiationStatus === "active";

  async function sendOffer() {
    const amount = parseFloat(offerAmount);
    if (!offerAmount || isNaN(amount) || amount <= 0) { setAmountError("Enter a valid offer amount."); return; }
    if (amount >= product!.price) { setAmountError(`Offer must be below asking price of ${formatPrice(product!.price)}.`); return; }
    setAmountError("");
    setSending(true);

    const buyerMsg: NegotiationMessage = { id: generateId(), productId: product!.id, negotiationId, senderId: state.currentUser.id, senderName: state.currentUser.name, senderRole: "buyer", type: "offer", amount, message: offerMessage || `I'd like to offer ${formatPrice(amount)} for this item.`, createdAt: new Date().toISOString() };
    dispatch({ type: "ADD_NEGOTIATION_MESSAGE", negotiationId, message: buyerMsg, productId: product!.id, buyerId: state.currentUser.id, sellerId: seller!.id });
    dispatch({ type: "ADD_NOTIFICATION", notification: { id: `notif-${Date.now()}`, userId: seller!.id, type: "offer_received", title: "New Offer Received", message: `${state.currentUser.name} offered ${formatPrice(amount)} on ${product!.name}`, read: false, linkTo: `/marketplace/${product!.id}/negotiate`, createdAt: new Date().toISOString() } });
    setOfferAmount(""); setOfferMessage(""); setSending(false); setSellerTyping(true);

    const delay = 1500 + Math.random() * 1000;
    await new Promise((r) => setTimeout(r, delay));

    const rand = Math.random();
    let sellerMsg: NegotiationMessage;
    if (rand < 0.3) {
      sellerMsg = { id: generateId(), productId: product!.id, negotiationId, senderId: seller!.id, senderName: seller!.name, senderRole: "seller", type: "accept", amount, message: `That works for me! I accept your offer of ${formatPrice(amount)}. Please proceed to payment.`, createdAt: new Date().toISOString() };
      dispatch({ type: "UPDATE_NEGOTIATION", negotiationId, updates: { status: "accepted", agreedPrice: amount } });
      dispatch({ type: "ADD_NOTIFICATION", notification: { id: `notif-${Date.now()}`, userId: state.currentUser.id, type: "offer_accepted", title: "Offer Accepted!", message: `${seller!.name} accepted your offer of ${formatPrice(amount)} for ${product!.name}`, read: false, linkTo: `/marketplace/${product!.id}/negotiate`, createdAt: new Date().toISOString() } });
      addToast({ type: "success", title: "Offer accepted!", message: `Agreed price: ${formatPrice(amount)}` });
    } else if (rand < 0.55) {
      sellerMsg = { id: generateId(), productId: product!.id, negotiationId, senderId: seller!.id, senderName: seller!.name, senderRole: "seller", type: "reject", message: `Sorry, ${formatPrice(amount)} is too low for this item. The asking price is my best offer right now.`, createdAt: new Date().toISOString() };
    } else {
      const counter = Math.round(amount + (product!.price - amount) * (0.4 + Math.random() * 0.3));
      sellerMsg = { id: generateId(), productId: product!.id, negotiationId, senderId: seller!.id, senderName: seller!.name, senderRole: "seller", type: "counter", amount: counter, message: `Thanks for your offer. I can do ${formatPrice(counter)} — that's my best price.`, createdAt: new Date().toISOString() };
    }
    dispatch({ type: "ADD_NEGOTIATION_MESSAGE", negotiationId, message: sellerMsg, productId: product!.id, buyerId: state.currentUser.id, sellerId: seller!.id });
    setSellerTyping(false);
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <Breadcrumb items={[{ label: "Marketplace", href: "/marketplace" }, { label: product.name, href: `/marketplace/${product.id}` }, { label: "Negotiate" }]} />
        <Card padding="sm" className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-bg shrink-0 overflow-hidden">{product.images[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}</div>
          <div className="flex-1 min-w-0">
            <p className="text-small font-semibold text-ink truncate">{product.name}</p>
            <p className="text-caption text-ink-subtle">Asking price: <span className="font-semibold text-ink">{formatPrice(product.price)}</span></p>
          </div>
          {negotiationStatus === "accepted" && agreedPrice && <div className="text-right shrink-0"><p className="text-caption text-secondary font-medium">Agreed</p><p className="text-h3 font-bold text-ink">{formatPrice(agreedPrice)}</p></div>}
        </Card>

        {negotiationStatus === "accepted" && agreedPrice && (
          <Card className="text-center bg-secondary-50 border-secondary-200">
            <CheckCircle className="w-10 h-10 text-secondary mx-auto mb-3" />
            <h3 className="text-h3 text-ink mb-1">Offer Accepted!</h3>
            <p className="text-small text-ink-muted mb-4">Agreed price: <span className="font-bold text-ink">{formatPrice(agreedPrice)}</span></p>
            <Link href={`/checkout/${product.id}?price=${agreedPrice}`}><Button variant="secondary" size="lg"><ShoppingCart className="w-4 h-4" /> Proceed to Payment</Button></Link>
          </Card>
        )}

        <Card padding="none">
          <div className="px-5 py-3 border-b border-primary-50 flex items-center gap-2">
            <Avatar name={seller.name} size="sm" />
            <p className="text-small font-semibold text-ink">{seller.name}</p>
            <span className="w-2 h-2 rounded-full bg-secondary ml-auto" title="Online" />
          </div>
          <div className="h-96 overflow-y-auto p-5 space-y-4 scrollbar-thin">
            {messages.length === 0 && <div className="text-center py-8 text-ink-subtle text-small">Start by making an offer below.</div>}
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isBuyer = msg.senderRole === "buyer";
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={cn("flex items-end gap-2", isBuyer ? "justify-end" : "justify-start")}>
                    {!isBuyer && <Avatar name={msg.senderName} size="xs" />}
                    <div className={cn("max-w-[75%] px-4 py-3 rounded-2xl", isBuyer ? "bg-primary text-ink rounded-br-md" : msg.type === "accept" ? "bg-secondary text-white rounded-bl-md" : msg.type === "reject" ? "bg-error-50 border border-error-200 text-ink rounded-bl-md" : "bg-bg text-ink border border-primary-50 rounded-bl-md")}>
                      {msg.amount && <p className="text-small font-bold mb-1 flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{msg.type === "offer" ? "Offered: " : msg.type === "counter" ? "Counter: " : "Agreed: "}{formatPrice(msg.amount)}</p>}
                      <p className="text-small">{msg.message}</p>
                      <p className={cn("text-[11px] mt-1.5 opacity-70", isBuyer ? "text-right" : "")}>{formatRelativeTime(msg.createdAt)}{msg.type === "accept" && " · Accepted ✓"}</p>
                    </div>
                    {isBuyer && <Avatar name={msg.senderName} size="xs" />}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {sellerTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-small text-ink-subtle">
                <Avatar name={seller.name} size="xs" />
                <div className="bg-bg border border-primary-50 rounded-full px-4 py-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-subtle animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-subtle animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-subtle animate-bounce" />
                  <span className="text-caption ml-1">Seller is reviewing...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {canSendOffer && negotiationStatus === "active" && (
            <div className="px-5 py-4 border-t border-primary-50 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle font-medium">$</span>
                  <input type="number" min="1" value={offerAmount} onChange={(e) => { setOfferAmount(e.target.value); setAmountError(""); }} placeholder="Your offer amount" className={cn("w-full pl-7 pr-3 py-2.5 rounded-md border bg-surface text-small focus:outline-none focus:ring-2 focus:ring-primary", amountError ? "border-error" : "border-primary-200")} />
                </div>
                <Button onClick={sendOffer} loading={sending || sellerTyping} disabled={sending || sellerTyping}><Send className="w-4 h-4" /> Send</Button>
              </div>
              {amountError && <p className="text-caption text-error">{amountError}</p>}
              <input type="text" value={offerMessage} onChange={(e) => setOfferMessage(e.target.value)} placeholder="Add a message (optional)" className="w-full px-3 py-2 rounded-md border border-primary-200 bg-surface text-small focus:outline-none focus:ring-2 focus:ring-primary" onKeyDown={(e) => { if (e.key === "Enter") sendOffer(); }} />
            </div>
          )}
          {!canSendOffer && state.currentRole !== "citizen_seller" && <div className="px-5 py-4 border-t border-primary-50 text-center text-small text-ink-subtle">Switch to the Buyer role to make offers.</div>}
        </Card>
      </div>
    </PageTransition>
  );
}
