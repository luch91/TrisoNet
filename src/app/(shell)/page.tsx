"use client";
import { ShoppingBag, Shield, Store, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/layout/PageTransition";
import Link from "next/link";

export default function HomePage() {
  const features = [
    { icon: Store, title: "Central Market Square", desc: "Quality-verified products from business departments, reviewed by QC and approved by admin." },
    { icon: Users, title: "Citizen Portals", desc: "Independent seller portals where citizens can list and sell their own products directly." },
    { icon: Shield, title: "Buyer Protection", desc: "All purchases route through verified citizen portals with full negotiation support." },
    { icon: ShoppingBag, title: "Easy Discovery", desc: "Browse, filter, and discover products from across Africa's most trusted trading network." },
  ];

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-small font-medium text-primary-700 mb-6 border border-primary-200">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Africa&apos;s Premier Trading Platform
          </div>
          <h1 className="text-display text-ink mb-4">TrisoNet <span className="text-primary">Trading Zone</span></h1>
          <p className="text-body text-ink-subtle max-w-xl mx-auto mb-8">
            A trusted marketplace connecting buyers, citizen sellers, and verified business partners across Africa.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/marketplace">
              <Button size="lg">Browse Marketplace</Button>
            </Link>
            <Link href="/portal/citizen-1">
              <Button size="lg" variant="outline">View Seller Portals</Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-surface rounded-xl p-6 shadow-card border border-primary-50">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="text-h3 text-ink mb-2">{f.title}</h3>
                <p className="text-small text-ink-subtle">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
