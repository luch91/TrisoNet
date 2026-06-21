"use client";
import { useState, useRef } from "react";
import { useApp } from "@/lib/store";
import { generateId, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { CheckCircle, Upload, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/mock-data";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop",
];

export default function NewProductPage() {
  const { state, dispatch, addToast } = useApp();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    negotiable: "true",
    imagePreview: PLACEHOLDER_IMAGES[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.category.trim()) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = "Enter a valid price";
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) < 1) e.quantity = "Enter a valid quantity";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      set("imagePreview", url);
    }
  }

  async function handleSubmit() {
    if (!validateStep2()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const product: Product = {
      id: `prod-${generateId()}`,
      name: form.name,
      description: form.description,
      price: Number(form.price),
      quantity: Number(form.quantity),
      department: state.currentUser.department,
      category: form.category,
      status: "pending",
      source: "market_square",
      sellerId: state.currentUser.id,
      sellerName: state.currentUser.name,
      images: [form.imagePreview],
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      negotiable: form.negotiable === "true",
      location: state.currentUser.location,
      views: 0,
    };
    dispatch({ type: "ADD_PRODUCT", product });
    addToast({ type: "success", title: "Product submitted!", message: "Now awaiting Quality Control review." });
    setSubmitted(product);
    setLoading(false);
  }

  if (submitted) {
    return (
      <PageTransition>
        <div className="p-6 max-w-2xl mx-auto">
          <Card className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-h2 text-ink mb-2">Product Submitted!</h2>
            <p className="text-small text-ink-subtle mb-6">
              <span className="font-semibold text-ink">{submitted.name}</span> has been submitted and is now awaiting Quality Control review.
            </p>
            <div className="bg-bg rounded-lg p-4 text-left mb-8 space-y-2">
              <div className="flex justify-between text-small"><span className="text-ink-subtle">Product</span><span className="font-medium text-ink">{submitted.name}</span></div>
              <div className="flex justify-between text-small"><span className="text-ink-subtle">Price</span><span className="font-medium text-ink">${submitted.price}</span></div>
              <div className="flex justify-between text-small"><span className="text-ink-subtle">Department</span><span className="font-medium text-ink">{submitted.department}</span></div>
              <div className="flex justify-between text-small"><span className="text-ink-subtle">Status</span><span className="font-medium text-warning-600">Pending QC Review</span></div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setSubmitted(null); setStep(1); setForm({ name: "", description: "", price: "", quantity: "", category: "", negotiable: "true", imagePreview: PLACEHOLDER_IMAGES[0] }); }}>Stock Another Product</Button>
              <Link href="/manager/inventory"><Button variant="outline">Back to Inventory</Button></Link>
            </div>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Manager", href: "/manager/dashboard" }, { label: "Inventory", href: "/manager/inventory" }, { label: "New Product" }]} />
        <h1 className="text-h1 text-ink">Stock New Product</h1>

        <div className="flex gap-2 items-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-caption font-semibold", step >= s ? "bg-primary text-ink" : "bg-bg text-ink-subtle border border-primary-200")}>{s}</div>
              {s < 3 && <div className={cn("flex-1 h-0.5 w-8", step > s ? "bg-primary" : "bg-primary-100")} />}
            </div>
          ))}
          <div className="ml-2 text-small text-ink-subtle">{step === 1 ? "Product Info" : step === 2 ? "Pricing & Stock" : "Image & Review"}</div>
        </div>

        <Card>
          {step === 1 && (
            <div className="space-y-4">
              <Input label="Product Name" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} placeholder="e.g. Sony WH-1000XM5 Headphones" />
              <Textarea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} error={errors.description} rows={4} placeholder="Describe the product, features, and condition..." />
              <Input label="Category" value={form.category} onChange={(e) => set("category", e.target.value)} error={errors.category} placeholder="e.g. Audio, Smartphones, Dresses" />
              <div className="bg-primary-50 rounded-lg px-4 py-3 text-caption text-primary-700 border border-primary-100">Department is locked to <strong>{state.currentUser.department}</strong> &mdash; your assigned department.</div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price (USD)" type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} error={errors.price} placeholder="0.00" />
                <Input label="Quantity" type="number" min="1" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} error={errors.quantity} placeholder="1" />
              </div>
              <Select label="Allow Negotiation" value={form.negotiable} onChange={(e) => set("negotiable", e.target.value)} options={[{ value: "true", label: "Yes — buyers can make offers" }, { value: "false", label: "No — fixed price only" }]} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-small font-medium text-ink mb-2">Product Image</p>
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-bg border-2 border-dashed border-primary-200 flex items-center justify-center group cursor-pointer" onClick={() => fileRef.current?.click()}>
                  {form.imagePreview ? (
                    <>
                      <img src={form.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                        <span className="text-white text-small ml-2">Change image</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center"><Upload className="w-8 h-8 text-primary-400 mx-auto mb-2" /><p className="text-small text-ink-subtle">Click to upload or drag &amp; drop</p></div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <div className="flex gap-2 mt-3">
                  {PLACEHOLDER_IMAGES.map((img, i) => (
                    <button key={i} onClick={() => set("imagePreview", img)} className={cn("w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors", form.imagePreview === img ? "border-primary" : "border-transparent")}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-bg rounded-lg p-4 space-y-2">
                <p className="text-small font-semibold text-ink mb-2">Review Summary</p>
                <div className="flex justify-between text-small"><span className="text-ink-subtle">Name</span><span className="font-medium">{form.name}</span></div>
                <div className="flex justify-between text-small"><span className="text-ink-subtle">Price</span><span className="font-medium">${form.price}</span></div>
                <div className="flex justify-between text-small"><span className="text-ink-subtle">Qty</span><span className="font-medium">{form.quantity}</span></div>
                <div className="flex justify-between text-small"><span className="text-ink-subtle">Department</span><span className="font-medium">{state.currentUser.department}</span></div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6 pt-6 border-t border-primary-50">
            {step > 1 ? <Button variant="ghost" onClick={() => setStep((s) => s - 1)}><ArrowLeft className="w-4 h-4" /> Back</Button> : <div />}
            {step < 3 ? (
              <Button onClick={() => { if (step === 1 && !validateStep1()) return; setStep((s) => s + 1); }}>Next <ArrowRight className="w-4 h-4" /></Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading}>Submit for QC Review</Button>
            )}
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
