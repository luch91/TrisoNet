"use client";
import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mock-data";
import { formatPrice, generateId, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import Tabs from "@/components/ui/Tabs";
import Link from "next/link";
import type { Product } from "@/lib/mock-data";
import { Package, Plus, Upload, CheckCircle, Eye, MessageSquare, TrendingUp, Info, BarChart2, AlertCircle } from "lucide-react";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop",
];

export default function CitizenPortalEditPage() {
  const { state, dispatch, addToast } = useApp();
  const params = useParams();
  const [activeTab, setActiveTab] = useState("products");
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const citizenId = params.citizenId as string;
  const seller = MOCK_USERS.find((u) => u.id === citizenId) ?? state.currentUser;
  const isOwner = state.currentRole === "citizen_seller";

  const myProducts = state.products.filter((p) => p.sellerId === seller.id && p.source === "citizen_listing");
  const liveProducts = myProducts.filter((p) => p.status === "live");
  const pendingProducts = myProducts.filter((p) => p.status === "pending_platform");
  const incomingOffers = state.negotiations.filter((n) => n.sellerId === seller.id);

  const [form, setFormState] = useState({ name: "", description: "", price: "", category: "", imagePreview: PLACEHOLDER_IMAGES[0] });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setField(field: string, value: string) {
    setFormState((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Product name required";
    if (!form.description.trim()) e.description = "Description required";
    if (!form.price || Number(form.price) <= 0) e.price = "Valid price required";
    if (!form.category.trim()) e.category = "Category required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    await new Promise<void>((r) => setTimeout(r, 700));
    const product: Product = { id: `prod-${generateId()}`, name: form.name, description: form.description, price: Number(form.price), quantity: 1, category: form.category, status: "pending_platform", source: "citizen_listing", sellerId: seller.id, sellerName: seller.name, images: [form.imagePreview], submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), negotiable: true, location: seller.location, views: 0 };
    dispatch({ type: "ADD_PRODUCT", product });
    addToast({ type: "success", title: "Product submitted!", message: "Pending platform validation." });
    setFormState({ name: "", description: "", price: "", category: "", imagePreview: PLACEHOLDER_IMAGES[0] });
    setAddProductOpen(false);
    setLoading(false);
  }

  if (!isOwner) {
    return (
      <PageTransition>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-3" />
          <h2 className="text-h2 text-ink mb-2">Access Restricted</h2>
          <p className="text-small text-ink-subtle mb-4">Only the seller can access the portal edit view. Switch to the Citizen Seller role.</p>
          <Link href={`/portal/${citizenId}`}><Button variant="outline">View Public Portal</Button></Link>
        </div>
      </PageTransition>
    );
  }

  const tabs = [
    { id: "products", label: "My Products", count: myProducts.length },
    { id: "offers", label: "Incoming Offers", count: incomingOffers.length },
    { id: "promotion", label: "Promotion" },
  ];

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-h1 text-ink">My Portal</h1>
          <Link href={`/portal/${citizenId}`}><Button variant="outline" size="sm"><Eye className="w-4 h-4" /> View Public Portal</Button></Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Live Products", value: liveProducts.length, icon: Package, color: "text-secondary bg-secondary-50" },
            { label: "Pending Validation", value: pendingProducts.length, icon: CheckCircle, color: "text-warning-600 bg-warning-50" },
            { label: "Total Offers", value: incomingOffers.length, icon: MessageSquare, color: "text-primary-700 bg-primary-50" },
            { label: "Profile Views", value: 142, icon: Eye, color: "text-ink bg-bg" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="flex flex-col gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", s.color)}><Icon className="w-4 h-4" /></div>
                <p className="text-h2 font-bold text-ink">{s.value}</p>
                <p className="text-caption text-ink-subtle">{s.label}</p>
              </Card>
            );
          })}
        </div>

        <div className="flex items-start gap-3 bg-primary-50 rounded-xl p-4 border border-primary-100">
          <Info className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-small font-semibold text-ink">Platform Validation vs. Market Square Review</p>
            <p className="text-small text-ink-muted mt-0.5">Products you upload here go through a lighter <strong>platform validation</strong> check &mdash; faster and independent from the Central Market Square&apos;s full QC + Super Admin pipeline used by Business Managers.</p>
          </div>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex justify-end"><Button onClick={() => setAddProductOpen(true)}><Plus className="w-4 h-4" /> Add Product</Button></div>
            {addProductOpen && (
              <Card>
                <h3 className="text-h3 text-ink mb-4">Add New Product</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Product Name" value={form.name} onChange={(e) => setField("name", e.target.value)} error={errors.name} />
                    <Input label="Category" value={form.category} onChange={(e) => setField("category", e.target.value)} error={errors.category} />
                  </div>
                  <Textarea label="Description" value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3} error={errors.description} />
                  <Input label="Price (USD)" type="number" value={form.price} onChange={(e) => setField("price", e.target.value)} error={errors.price} />
                  <div>
                    <p className="text-small font-medium text-ink mb-2">Product Image</p>
                    <div className="flex gap-2 flex-wrap">
                      {PLACEHOLDER_IMAGES.map((img, i) => (
                        <button key={i} onClick={() => setField("imagePreview", img)} className={cn("w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors", form.imagePreview === img ? "border-primary" : "border-primary-100")}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <button onClick={() => fileRef.current?.click()} className="w-16 h-16 rounded-lg border-2 border-dashed border-primary-200 flex items-center justify-center hover:bg-bg transition-colors"><Upload className="w-5 h-5 text-primary-400" /></button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setField("imagePreview", URL.createObjectURL(f)); }} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setAddProductOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={loading}>Submit for Validation</Button>
                  </div>
                </div>
              </Card>
            )}
            {myProducts.length === 0 ? (
              <EmptyState icon={Package} title="No products yet" description="Add your first product to start selling on TrisoNet." action={{ label: "Add Product", onClick: () => setAddProductOpen(true) }} />
            ) : (
              <Card padding="none">
                <div className="divide-y divide-primary-50">
                  {myProducts.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-bg shrink-0 overflow-hidden">{p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}</div>
                      <div className="flex-1 min-w-0"><p className="text-small font-medium text-ink truncate">{p.name}</p><p className="text-caption text-ink-subtle">{formatPrice(p.price)} &middot; {p.category}</p></div>
                      <StatusBadge status={p.status} />
                      {p.status === "live" && <Link href={`/marketplace/${p.id}`} className="text-caption text-primary-600 hover:underline">View &rarr;</Link>}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === "offers" && (
          <div className="space-y-4">
            {incomingOffers.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No offers yet" description="When buyers make offers on your products, they'll appear here." />
            ) : (
              incomingOffers.map((neg) => {
                const product = state.products.find((p) => p.id === neg.productId);
                const lastMsg = neg.messages[neg.messages.length - 1];
                return (
                  <Card key={neg.id} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-bg shrink-0 overflow-hidden">{product?.images[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-small font-semibold text-ink">{product?.name}</p>
                      {lastMsg && <p className="text-caption text-ink-subtle mt-0.5 truncate">{lastMsg.senderName}: {lastMsg.amount ? formatPrice(lastMsg.amount) : lastMsg.message}</p>}
                    </div>
                    <Link href={`/marketplace/${neg.productId}/negotiate`}><Button size="sm" variant="outline">Respond</Button></Link>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {activeTab === "promotion" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {liveProducts.map((p) => (
                <Card key={p.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-bg overflow-hidden shrink-0">{p.images[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}</div>
                    <p className="text-small font-medium text-ink line-clamp-2">{p.name}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-small"><span className="text-ink-subtle flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Views</span><span className="font-semibold text-ink">{p.views ?? 0}</span></div>
                    <div className="flex justify-between text-small"><span className="text-ink-subtle flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Social clicks</span><span className="font-semibold text-primary-600">{Math.floor(Math.random() * 40 + 5)}</span></div>
                    <div className="flex justify-between text-small"><span className="text-ink-subtle flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" /> Social views</span><span className="font-semibold text-secondary">{Math.floor(Math.random() * 200 + 30)}</span></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-primary-50">
                    <div className="w-full bg-primary-50 rounded-full h-2 overflow-hidden"><div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, (p.views ?? 0) / 2)}%` }} /></div>
                    <p className="text-caption text-ink-subtle mt-1.5">Traffic from social</p>
                  </div>
                </Card>
              ))}
              {liveProducts.length === 0 && <div className="col-span-3"><EmptyState icon={BarChart2} title="No live products" description="Get products live to track their promotion performance." /></div>}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
