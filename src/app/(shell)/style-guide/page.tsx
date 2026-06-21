"use client";
import { useState } from "react";
import PageTransition from "@/components/layout/PageTransition";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge, { StatusBadge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Avatar from "@/components/ui/Avatar";
import Tabs from "@/components/ui/Tabs";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton, ProductCardSkeleton } from "@/components/ui/Skeleton";
import StatusStepper from "@/components/ui/StatusStepper";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Package, AlertCircle } from "lucide-react";

const COLORS = [
  { name: "Primary", shades: [
    { label: "50",  value: "#f0f8ff" }, { label: "100", value: "#dff1fe" }, { label: "200", value: "#b8e4fd" },
    { label: "300 (Primary)", value: "#87D0FD" }, { label: "700", value: "#0f72b4" }, { label: "900", value: "#0b4570" },
  ]},
  { name: "Secondary", shades: [
    { label: "50",  value: "#f0fafa" }, { label: "100", value: "#ccf0ef" },
    { label: "400 (Secondary)", value: "#429E9D" }, { label: "600", value: "#296362" }, { label: "900", value: "#0e2020" },
  ]},
  { name: "Semantic", shades: [
    { label: "Ink", value: "#13202B" }, { label: "Bg", value: "#F5FAFD" }, { label: "Surface", value: "#FFFFFF" },
    { label: "Warning", value: "#f59e0b" }, { label: "Error", value: "#e53e3e" },
  ]},
];

const SECTION = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-4">
    <h2 className="text-h2 text-ink border-b border-primary-100 pb-2">{title}</h2>
    {children}
  </section>
);

export default function StyleGuidePage() {
  const [tab, setTab] = useState("colors");
  const [inputVal, setInputVal] = useState("");

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <div>
          <h1 className="text-display text-ink mb-2">Style Guide</h1>
          <p className="text-body text-ink-subtle">TrisoNet Trading Zone design system &mdash; colors, typography, and component library.</p>
        </div>

        <SECTION title="Color Tokens">
          {COLORS.map((group) => (
            <div key={group.name}>
              <p className="text-small font-semibold text-ink mb-3">{group.name}</p>
              <div className="flex flex-wrap gap-3">
                {group.shades.map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-lg border border-primary-50 shadow-card" style={{ backgroundColor: s.value }} />
                    <p className="text-caption text-ink-subtle text-center max-w-[64px] leading-tight">{s.label}</p>
                    <p className="text-[10px] text-ink-subtle font-mono">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </SECTION>

        <SECTION title="Typography">
          <div className="space-y-4 bg-surface rounded-xl p-6 shadow-card border border-primary-50">
            <p className="text-display text-ink">Display &mdash; 3rem bold</p>
            <p className="text-h1 text-ink">Heading 1 &mdash; 2.25rem bold</p>
            <p className="text-h2 text-ink">Heading 2 &mdash; 1.75rem semibold</p>
            <p className="text-h3 text-ink">Heading 3 &mdash; 1.375rem semibold</p>
            <p className="text-body text-ink">Body &mdash; 1rem regular. The quick brown fox jumps over the lazy dog.</p>
            <p className="text-small text-ink-muted">Small &mdash; 0.875rem. Supporting text and labels.</p>
            <p className="text-caption text-ink-subtle">Caption &mdash; 0.75rem. Metadata and timestamps.</p>
          </div>
        </SECTION>

        <SECTION title="Buttons">
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center mt-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </SECTION>

        <SECTION title="Badges & Status Pills">
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="pending" /><StatusBadge status="qc_approved" /><StatusBadge status="live" /><StatusBadge status="rejected" /><StatusBadge status="pending_platform" />
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <Badge variant="success">Success</Badge><Badge variant="warning">Warning</Badge><Badge variant="info">Info</Badge><Badge>Default</Badge>
          </div>
        </SECTION>

        <SECTION title="Cards">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card padding="sm"><p className="text-small text-ink">Small padding card</p></Card>
            <Card padding="md"><p className="text-small text-ink">Medium padding card (default)</p></Card>
            <Card hover padding="lg"><p className="text-small text-ink">Large padding, hover effect</p></Card>
          </div>
        </SECTION>

        <SECTION title="Form Controls">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <Input label="Text Input" placeholder="Enter text..." value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
            <Input label="With Error" placeholder="Enter text..." error="This field is required" />
            <Input label="Disabled" placeholder="Disabled" disabled />
            <Select label="Select" options={[{ value: "a", label: "Option A" }, { value: "b", label: "Option B" }]} />
          </div>
          <Textarea label="Textarea" placeholder="Enter a longer message..." rows={3} className="max-w-xl mt-4" />
        </SECTION>

        <SECTION title="Avatars">
          <div className="flex items-end gap-4">
            {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
              <div key={size} className="flex flex-col items-center gap-2"><Avatar name="Fatima Al-Rashid" size={size} /><p className="text-caption text-ink-subtle">{size}</p></div>
            ))}
          </div>
        </SECTION>

        <SECTION title="Tabs">
          <Tabs tabs={[{ id: "colors", label: "Colors", count: 3 }, { id: "typography", label: "Typography" }, { id: "components", label: "Components", count: 12 }]} activeTab={tab} onChange={setTab} />
          <div className="bg-bg rounded-lg p-4 text-small text-ink-subtle border border-primary-50">Active tab: <strong className="text-ink">{tab}</strong></div>
        </SECTION>

        <SECTION title="Status Stepper">
          <div className="space-y-6">
            {(["pending", "qc_approved", "live", "rejected"] as const).map((s) => (
              <div key={s} className="bg-surface p-4 rounded-xl border border-primary-50">
                <p className="text-caption text-ink-subtle mb-4 font-medium">Status: {s}</p>
                <StatusStepper status={s} />
              </div>
            ))}
          </div>
        </SECTION>

        <SECTION title="Breadcrumb">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Marketplace", href: "/marketplace" }, { label: "Product Detail" }]} />
        </SECTION>

        <SECTION title="Empty States">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card><EmptyState icon={Package} title="No products" description="Stock your first product to get started." action={{ label: "Add Product", onClick: () => {} }} /></Card>
            <Card><EmptyState icon={AlertCircle} title="Something went wrong" description="An error occurred. Please try again." action={{ label: "Retry", onClick: () => {} }} /></Card>
          </div>
        </SECTION>

        <SECTION title="Skeleton Loaders">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ProductCardSkeleton />
            <div className="space-y-3"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-10 w-full" /></div>
          </div>
        </SECTION>

        <SECTION title="Shadows">
          <div className="flex flex-wrap gap-6">
            {[{ label: "card", cls: "shadow-card" }, { label: "lifted", cls: "shadow-lifted" }, { label: "modal", cls: "shadow-modal" }, { label: "btn", cls: "shadow-btn" }].map((s) => (
              <div key={s.label} className={`w-24 h-24 bg-surface rounded-lg flex items-center justify-center ${s.cls}`}><p className="text-caption text-ink-subtle">{s.label}</p></div>
            ))}
          </div>
        </SECTION>
      </div>
    </PageTransition>
  );
}
