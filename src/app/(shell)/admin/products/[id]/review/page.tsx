"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Input";
import StatusStepper from "@/components/ui/StatusStepper";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { CheckCircle, XCircle, Package, MessageSquare } from "lucide-react";

export default function AdminProductReviewPage() {
  const { state, dispatch, addToast } = useApp();
  const params = useParams();
  const router = useRouter();
  const product = state.products.find((p) => p.id === params.id);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  if (!product) {
    return (
      <PageTransition>
        <div className="p-6 text-center">
          <Package className="w-12 h-12 text-ink-subtle mx-auto mb-3" />
          <p className="text-h3 text-ink">Product not found</p>
          <Button className="mt-4" onClick={() => router.push("/admin/products/pending")}>Back</Button>
        </div>
      </PageTransition>
    );
  }

  async function handleApprove() {
    if (!comment.trim()) { setCommentError("Please add a comment before approving."); return; }
    setLoading("approve");
    await new Promise((r) => setTimeout(r, 800));
    dispatch({ type: "UPDATE_PRODUCT", productId: product!.id, updates: { status: "live", adminComment: comment } });
    dispatch({ type: "ADD_NOTIFICATION", notification: { id: `notif-${Date.now()}`, userId: product!.sellerId, type: "product_approved", title: "Product Approved & Live!", message: `${product!.name} has been approved by Super Admin and is now live on the marketplace.`, read: false, linkTo: `/marketplace/${product!.id}`, createdAt: new Date().toISOString() } });
    addToast({ type: "success", title: "Product is now Live!", message: "It will appear on the marketplace immediately." });
    setLoading(null);
    router.push("/admin/products/pending");
  }

  async function handleReject() {
    if (!comment.trim()) { setCommentError("A rejection reason is required."); return; }
    setLoading("reject");
    await new Promise((r) => setTimeout(r, 800));
    dispatch({ type: "UPDATE_PRODUCT", productId: product!.id, updates: { status: "rejected", adminComment: comment } });
    dispatch({ type: "ADD_NOTIFICATION", notification: { id: `notif-${Date.now()}`, userId: product!.sellerId, type: "product_rejected", title: "Product Rejected by Admin", message: `${product!.name} was rejected. Reason: ${comment}`, read: false, linkTo: `/manager/inventory`, createdAt: new Date().toISOString() } });
    addToast({ type: "error", title: "Product rejected" });
    setLoading(null);
    router.push("/admin/products/pending");
  }

  const canAct = product.status === "qc_approved";

  return (
    <PageTransition>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Products", href: "/admin/products/pending" }, { label: "Review" }]} />
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-h1 text-ink">Final Approval Review</h1>
          <StatusBadge status={product.status} />
        </div>
        <StatusStepper status={product.status} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {product.images[0] && <div className="w-full h-64 rounded-xl overflow-hidden bg-bg"><img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /></div>}
            <Card>
              <h2 className="text-h2 text-ink mb-1">{product.name}</h2>
              <p className="text-caption text-ink-subtle mb-4">{product.department} &middot; {product.category}</p>
              <p className="text-body text-ink-muted mb-6">{product.description}</p>
              <div className="grid grid-cols-2 gap-4 text-small">
                <div><p className="text-ink-subtle">Price</p><p className="font-semibold text-ink text-h3">{formatPrice(product.price)}</p></div>
                <div><p className="text-ink-subtle">Quantity</p><p className="font-semibold text-ink">{product.quantity} units</p></div>
                <div><p className="text-ink-subtle">Submitted by</p><p className="font-medium text-ink">{product.sellerName}</p></div>
                <div><p className="text-ink-subtle">Department</p><p className="font-medium text-ink">{product.department}</p></div>
              </div>
            </Card>
            {product.qcComment && (
              <Card>
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-small font-semibold text-ink mb-1">QC Officer&apos;s Comment</p>
                    <p className="text-small text-ink-muted">{product.qcComment}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
          <div className="space-y-4">
            <Card>
              <h3 className="text-h3 text-ink mb-4">Final Decision</h3>
              {canAct ? (
                <div className="space-y-4">
                  <Textarea label="Admin Comment *" value={comment} onChange={(e) => { setComment(e.target.value); setCommentError(""); }} rows={5} placeholder="Your final assessment..." error={commentError} />
                  <Button className="w-full" variant="secondary" onClick={handleApprove} loading={loading === "approve"} disabled={loading !== null}><CheckCircle className="w-4 h-4" /> Approve &mdash; Go Live</Button>
                  <Button className="w-full" variant="destructive" onClick={handleReject} loading={loading === "reject"} disabled={loading !== null}><XCircle className="w-4 h-4" /> Reject</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-bg rounded-lg p-3"><p className="text-caption text-ink-subtle">Current Status</p><StatusBadge status={product.status} className="mt-1" /></div>
                  {product.adminComment && <div className="bg-bg rounded-lg p-3"><p className="text-caption text-ink-subtle mb-1">Admin Comment</p><p className="text-small text-ink">{product.adminComment}</p></div>}
                  <Button variant="outline" className="w-full" onClick={() => router.push("/admin/products/pending")}>Back to Queue</Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
