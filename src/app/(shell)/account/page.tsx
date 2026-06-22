"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { Input, Textarea } from "@/components/ui/Input";
import Tabs from "@/components/ui/Tabs";
import { Lock, Shield, Bell, User as UserIcon } from "lucide-react";

function AccountInner() {
  const { state, dispatch, addToast } = useApp();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && ["profile", "settings", "security"].includes(t)) setActiveTab(t);
  }, [searchParams]);

  const user = state.currentUser;

  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    location: user.location ?? "",
    bio: user.bio ?? "",
    tagline: user.tagline ?? "",
  });
  const [saving, setSaving] = useState(false);

  if (!state.isAuthenticated) {
    return (
      <PageTransition>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-h2 text-ink mb-2">Sign in to manage your account</h1>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/login?redirect=/account"><Button variant="outline">Sign in</Button></Link>
            <Link href="/signup?redirect=/account"><Button>Create account</Button></Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const isSeller = state.currentRole === "citizen_seller";

  async function saveProfile() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    dispatch({ type: "UPDATE_USER", updates: { name: form.name, email: form.email, phone: form.phone, location: form.location, bio: form.bio, tagline: form.tagline } });
    addToast({ type: "success", title: "Profile updated" });
    setSaving(false);
  }

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "settings", label: "Notifications" },
    { id: "security", label: "Security" },
  ];

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="xl" />
          <div>
            <h1 className="text-h1 text-ink">{user.name}</h1>
            <p className="text-small text-ink-subtle">{user.email || "—"} · {roleLabel(state.currentRole)}</p>
          </div>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "profile" && (
          <Card className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+234 ..." />
              <Input label="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="City, Country" />
            </div>
            {isSeller && (
              <>
                <Input label="Tagline" value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="A short line that describes your shop" />
                <Textarea label="Bio" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} placeholder="Tell buyers about your craft..." />
              </>
            )}
            <div className="flex justify-end pt-2">
              <Button onClick={saveProfile} loading={saving}>Save changes</Button>
            </div>
          </Card>
        )}

        {activeTab === "settings" && (
          <Card className="space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-primary-600" />
              <h3 className="text-h3 text-ink">Email notifications</h3>
            </div>
            <ToggleRow
              label="Offers & negotiations"
              desc="When a buyer makes an offer or a seller responds."
              checked={state.preferences.emailOffers}
              onChange={(v) => { dispatch({ type: "UPDATE_PREFERENCES", updates: { emailOffers: v } }); addToast({ type: "info", title: "Preference saved" }); }}
            />
            <ToggleRow
              label="Order updates"
              desc="Payment confirmations, shipping, and delivery."
              checked={state.preferences.emailOrders}
              onChange={(v) => { dispatch({ type: "UPDATE_PREFERENCES", updates: { emailOrders: v } }); addToast({ type: "info", title: "Preference saved" }); }}
            />
            <ToggleRow
              label="Promotions & tips"
              desc="Marketplace news, featured sellers, and seasonal offers."
              checked={state.preferences.emailMarketing}
              onChange={(v) => { dispatch({ type: "UPDATE_PREFERENCES", updates: { emailMarketing: v } }); addToast({ type: "info", title: "Preference saved" }); }}
            />
          </Card>
        )}

        {activeTab === "security" && (
          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-600" />
              <h3 className="text-h3 text-ink">Password & security</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 max-w-md">
              <Input label="Current password" type="password" placeholder="••••••••" />
              <Input label="New password" type="password" placeholder="••••••••" hint="At least 8 characters" />
              <Input label="Confirm new password" type="password" placeholder="••••••••" />
            </div>
            <Button onClick={() => addToast({ type: "success", title: "Password updated" })}>Update password</Button>
            <div className="pt-4 border-t border-primary-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small font-medium text-ink flex items-center gap-2"><UserIcon className="w-4 h-4 text-ink-subtle" /> Two-factor authentication</p>
                  <p className="text-caption text-ink-subtle mt-0.5">Add an extra layer of security to your account.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => addToast({ type: "info", title: "2FA setup", message: "This is a demo action." })}>Enable</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-primary-50 last:border-0">
      <div className="pr-4">
        <p className="text-small font-medium text-ink">{label}</p>
        <p className="text-caption text-ink-subtle mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-primary" : "bg-primary-100"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function roleLabel(role: string): string {
  return role.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountInner />
    </Suspense>
  );
}
