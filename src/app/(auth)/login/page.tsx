"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mock-data";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

function LoginInner() {
  const { dispatch, addToast } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/marketplace";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    // Demo: match a seeded account by email, otherwise sign in as a generic buyer.
    const matched = MOCK_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    const user = matched ?? { ...MOCK_USERS.find((u) => u.role === "buyer")!, email: email.trim() };
    dispatch({ type: "LOGIN", user });
    addToast({ type: "success", title: `Welcome back, ${user.name.split(" ")[0]}!` });
    setLoading(false);
    router.push(matched && matched.role !== "buyer" ? defaultPathFor(matched.role) : redirect);
  }

  function quickLogin(roleEmail: string) {
    setEmail(roleEmail);
    setPassword("demo1234");
  }

  return (
    <div>
      <h1 className="text-h1 text-ink mb-1">Welcome back</h1>
      <p className="text-small text-ink-subtle mb-7">Sign in to continue trading on TrisoNet.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-[2.4rem] w-4 h-4 text-ink-subtle z-10" />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            error={errors.email}
            placeholder="you@example.com"
            className="pl-9"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-[2.4rem] w-4 h-4 text-ink-subtle z-10" />
          <Input
            label="Password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
            error={errors.password}
            placeholder="••••••••"
            className="pl-9 pr-10"
          />
          <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-[2.4rem] text-ink-subtle hover:text-ink">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-small">
          <label className="flex items-center gap-2 text-ink-muted cursor-pointer">
            <input type="checkbox" className="accent-primary w-4 h-4" defaultChecked /> Remember me
          </label>
          <button type="button" className="text-primary-600 hover:underline">Forgot password?</button>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign in <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative text-center">
          <span className="relative z-10 bg-bg lg:bg-surface px-3 text-caption text-ink-subtle">or use a demo account</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-primary-100" />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button onClick={() => quickLogin("ngozi@trisonet.com")} className="px-3 py-2 rounded-md border border-primary-100 text-small text-ink-muted hover:bg-surface hover:border-primary-300 transition-colors">🛒 Buyer</button>
          <button onClick={() => quickLogin("fatima@trisonet.com")} className="px-3 py-2 rounded-md border border-primary-100 text-small text-ink-muted hover:bg-surface hover:border-primary-300 transition-colors">🏪 Seller</button>
          <button onClick={() => quickLogin("amara@trisonet.com")} className="px-3 py-2 rounded-md border border-primary-100 text-small text-ink-muted hover:bg-surface hover:border-primary-300 transition-colors">📦 Manager</button>
          <button onClick={() => quickLogin("sarah@trisonet.com")} className="px-3 py-2 rounded-md border border-primary-100 text-small text-ink-muted hover:bg-surface hover:border-primary-300 transition-colors">👑 Admin</button>
        </div>
      </div>

      <p className="text-small text-ink-subtle text-center mt-7">
        New to TrisoNet?{" "}
        <Link href="/signup" className="text-primary-600 font-medium hover:underline">Create an account</Link>
      </p>
    </div>
  );
}

function defaultPathFor(role: string): string {
  switch (role) {
    case "super_admin": return "/admin/dashboard";
    case "qc_officer": return "/qc/queue";
    case "business_manager": return "/manager/dashboard";
    case "citizen_seller": return "/portal/citizen-1/edit";
    default: return "/marketplace";
  }
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
