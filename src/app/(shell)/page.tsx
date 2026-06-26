"use client";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/layout/PageTransition";
import {
  ShoppingBag, Shield, Store, Users, ArrowRight, Search, MessageSquare,
  CreditCard, MapPin, Star, CheckCircle, Coins, TrendingUp,
} from "lucide-react";
import { GKWTH } from "@/lib/coin-data";
import { formatNaira } from "@/lib/utils";

const CATEGORIES = [
  { label: "Electronics", icon: "📱" },
  { label: "Fashion", icon: "👗" },
  { label: "Home & Decor", icon: "🏺" },
  { label: "Audio", icon: "🎧" },
  { label: "Laptops", icon: "💻" },
  { label: "Crafts", icon: "🧺" },
];

const STEPS = [
  { icon: Search, title: "Discover", desc: "Browse quality-verified products from departments and citizen sellers across Africa." },
  { icon: MessageSquare, title: "Negotiate", desc: "Make an offer and chat with sellers in real time to agree on a fair price." },
  { icon: CreditCard, title: "Pay securely", desc: "Complete payment directly with verified sellers — every step tracked and confirmed." },
];

export default function HomePage() {
  const { state } = useApp();
  const authed = state.isAuthenticated;
  const isBuyer = state.currentRole === "buyer";

  const featured = state.products.filter((p) => p.status === "live").sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 4);

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-bg to-secondary-50" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary-100/50 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface rounded-full text-small font-medium text-primary-700 mb-6 border border-primary-200 shadow-card">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Africa&apos;s Premier Trading Platform
          </div>
          <h1 className="text-display text-ink mb-5 text-balance">
            Trade with trust on <span className="text-primary">TrisoNet</span>
          </h1>
          <p className="text-body text-ink-subtle max-w-2xl mx-auto mb-8">
            A trusted marketplace connecting buyers, citizen sellers, and verified business partners across
            Africa — with real negotiation, quality control, and secure, direct payments.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/marketplace"><Button size="lg"><ShoppingBag className="w-4 h-4" /> Browse Marketplace</Button></Link>
            {authed ? (
              isBuyer
                ? <Link href="/orders"><Button size="lg" variant="outline">My Orders</Button></Link>
                : <Link href="/sellers"><Button size="lg" variant="outline">View Seller Portals</Button></Link>
            ) : (
              <Link href="/signup"><Button size="lg" variant="outline">Start Selling <ArrowRight className="w-4 h-4" /></Button></Link>
            )}
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-center">
            <Stat value="12k+" label="Products" />
            <div className="w-px h-10 bg-primary-100" />
            <Stat value="3.5k+" label="Verified sellers" />
            <div className="w-px h-10 bg-primary-100" />
            <Stat value="98%" label="Satisfaction" />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Categories */}
        <section className="py-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-h2 text-ink">Shop by category</h2>
            <Link href="/marketplace" className="text-small text-primary-600 font-medium hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.map((c) => (
              <Link key={c.label} href={`/marketplace?q=${encodeURIComponent(c.label)}`} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-primary-50 shadow-card hover:shadow-lifted hover:border-primary-200 transition-all">
                <span className="text-2xl">{c.icon}</span>
                <span className="text-caption font-medium text-ink text-center">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section className="py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-h2 text-ink">Trending now</h2>
              <p className="text-small text-ink-subtle mt-1">Most-viewed live products this week</p>
            </div>
            <Link href="/marketplace" className="text-small text-primary-600 font-medium hover:underline flex items-center gap-1">See more <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p) => (
              <Link key={p.id} href={`/marketplace/${p.id}`} className="group block">
                <div className="bg-surface rounded-lg shadow-card border border-primary-50 overflow-hidden hover:shadow-lifted transition-shadow">
                  <div className="relative h-44 bg-bg overflow-hidden">
                    {p.images[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-10 h-10 text-primary-200" /></div>}
                    {p.negotiable && <div className="absolute top-2 right-2 bg-primary text-ink text-caption font-medium px-2 py-0.5 rounded-full">Offers accepted</div>}
                  </div>
                  <div className="p-4">
                    <p className="text-small font-medium text-ink line-clamp-1">{p.name}</p>
                    <div className="flex items-center gap-1 text-caption text-ink-subtle mt-1 mb-2"><MapPin className="w-3 h-3" /> {p.location ?? "Africa"}</div>
                    <p className="text-h3 font-bold text-ink">{formatPrice(p.price)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* GKWTH Exchange promo */}
        <section className="py-12">
          <div className="relative overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-secondary-50 p-6 sm:p-8">
            <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-secondary-100/40 blur-3xl" />
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-primary-200 text-caption font-medium text-secondary mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> New · GKWTH Exchange
                </div>
                <h2 className="text-h2 text-ink flex items-center gap-2">
                  <Coins className="w-6 h-6 text-secondary" /> Trade &amp; auction GKWTH coins
                </h2>
                <p className="text-small text-ink-subtle mt-2 max-w-xl">
                  Bid on live coin auctions, watch the order book move in real time, or list your own
                  GKWTH for sale and accept the best offer — all in Naira, settled to your wallet.
                </p>
                <div className="flex items-center gap-3 mt-5 flex-wrap">
                  <Link href="/exchange"><Button><TrendingUp className="w-4 h-4" /> Open Exchange</Button></Link>
                  <Link href="/exchange/sell"><Button variant="outline">List your GKWTH</Button></Link>
                </div>
              </div>
              <div className="w-full lg:w-64 rounded-xl bg-surface border border-primary-100 shadow-card p-4 shrink-0">
                <p className="text-caption text-ink-subtle uppercase tracking-wide">GKWTH / NGN</p>
                <p className="text-h1 font-bold text-ink mt-1 tabular-nums">{formatNaira(GKWTH.price)}</p>
                <p className="text-small text-secondary font-medium">+{GKWTH.change24h}% today</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary-50 text-caption">
                  <span className="text-ink-subtle">Live auctions</span>
                  <span className="font-semibold text-ink">{GKWTH.liveAuctions}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12">
          <div className="text-center mb-10">
            <h2 className="text-h2 text-ink">How TrisoNet works</h2>
            <p className="text-small text-ink-subtle mt-2 max-w-lg mx-auto">From discovery to delivery, every trade is built on trust and verification.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="relative bg-surface rounded-xl p-6 shadow-card border border-primary-50">
                  <span className="absolute top-5 right-5 text-h2 font-bold text-primary-100">{i + 1}</span>
                  <div className="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center mb-4"><Icon className="w-5 h-5 text-primary-600" /></div>
                  <h3 className="text-h3 text-ink mb-2">{s.title}</h3>
                  <p className="text-small text-ink-subtle">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Trust features */}
        <section className="py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Store, title: "Central Market Square", desc: "Quality-verified products reviewed by QC and approved by admin." },
              { icon: Users, title: "Citizen Portals", desc: "Independent seller portals to list and sell directly." },
              { icon: Shield, title: "Buyer Protection", desc: "Verified sellers and full negotiation support on every deal." },
              { icon: Star, title: "Trusted Across Africa", desc: "Thousands of buyers and sellers, one trusted network." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-surface rounded-xl p-6 shadow-card border border-primary-50">
                  <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center mb-4"><Icon className="w-5 h-5 text-secondary" /></div>
                  <h3 className="text-small font-semibold text-ink mb-1.5">{f.title}</h3>
                  <p className="text-caption text-ink-subtle">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        {!authed && (
          <section className="py-12">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 px-8 py-12 text-center text-white">
              <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <h2 className="text-h1 mb-3">Ready to start trading?</h2>
                <p className="text-white/80 max-w-md mx-auto mb-6">Create a free account to buy with confidence or open your own seller portal in minutes.</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Link href="/signup"><Button size="lg" variant="secondary">Create free account</Button></Link>
                  <Link href="/login"><Button size="lg" variant="ghost" className="text-white hover:bg-white/10">Sign in</Button></Link>
                </div>
                <div className="flex items-center justify-center gap-5 mt-6 text-caption text-white/80">
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Free to join</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> No listing fees</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </PageTransition>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-h1 font-bold text-ink">{value}</p>
      <p className="text-caption text-ink-subtle">{label}</p>
    </div>
  );
}
