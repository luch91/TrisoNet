"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { generateId, cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Role, User } from "@/lib/mock-data";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, ShoppingCart, Store, Check } from "lucide-react";

type Intent = "buyer" | "citizen_seller";

function SignupInner() {
  const { dispatch, addToast } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [intent, setIntent] = useState<Intent>("buyer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 8) errs.password = "Use at least 8 characters";
    if (!agreed) errs.agreed = "Please accept the terms to continue";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const role: Role = intent;
    const user: User = {
      id: intent === "citizen_seller" ? `citizen-${generateId()}` : `buyer-${generateId()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      location: "Africa",
      joinedAt: new Date().toISOString(),
      ...(intent === "citizen_seller" ? { tagline: "New on TrisoNet", bio: "" } : {}),
    };
    dispatch({ type: "LOGIN", user });
    addToast({ type: "success", title: "Account created!", message: `Welcome to TrisoNet, ${user.name.split(" ")[0]}.` });
    setLoading(false);
    router.push(redirect || (intent === "citizen_seller" ? `/portal/${user.id}/edit` : "/marketplace"));
  }

  return (
    <div>
      <h1 className="text-h1 text-ink mb-1">Create your account</h1>
      <p className="text-small text-ink-subtle mb-6">Join TrisoNet to buy and sell across Africa.</p>

      {/* Intent selector */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {([
          { id: "buyer", label: "I want to buy", icon: ShoppingCart },
          { id: "citizen_seller", label: "I want to sell", icon: Store },
        ] as const).map((opt) => {
          const Icon = opt.icon;
          const active = intent === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setIntent(opt.id)}
              className={cn(
                "relative flex flex-col items-start gap-2 p-3.5 rounded-lg border text-left transition-colors",
                active ? "border-primary bg-primary-50" : "border-primary-100 hover:border-primary-300"
              )}
            >
              {active && <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary text-ink flex items-center justify-center"><Check className="w-3 h-3" /></span>}
              <Icon className={cn("w-5 h-5", active ? "text-primary-600" : "text-ink-subtle")} />
              <span className={cn("text-small font-medium", active ? "text-primary-700" : "text-ink")}>{opt.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <UserIcon className="absolute left-3 top-[2.4rem] w-4 h-4 text-ink-subtle z-10" />
          <Input label="Full name" value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }} error={errors.name} placeholder="Ada Obi" className="pl-9" />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-[2.4rem] w-4 h-4 text-ink-subtle z-10" />
          <Input label="Email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }} error={errors.email} placeholder="you@example.com" className="pl-9" />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-[2.4rem] w-4 h-4 text-ink-subtle z-10" />
          <Input label="Password" type={showPw ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }} error={errors.password} hint={!errors.password ? "At least 8 characters" : undefined} placeholder="••••••••" className="pl-9 pr-10" />
          <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-[2.4rem] text-ink-subtle hover:text-ink">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div>
          <label className="flex items-start gap-2.5 text-small text-ink-muted cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, agreed: "" })); }} className="mt-0.5 accent-primary w-4 h-4 shrink-0" />
            <span>I agree to TrisoNet&apos;s <span className="text-primary-600">Terms of Service</span> and <span className="text-primary-600">Privacy Policy</span>.</span>
          </label>
          {errors.agreed && <p className="text-caption text-error mt-1">{errors.agreed}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create account <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-small text-ink-subtle text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}
