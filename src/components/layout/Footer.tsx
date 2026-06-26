"use client";
import Link from "next/link";
import { ShoppingBag, Globe, MessageCircle, Mail } from "lucide-react";
import { useApp } from "@/lib/store";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse products", href: "/marketplace" },
      { label: "GKWTH Exchange", href: "/exchange" },
      { label: "Seller portals", href: "/sellers" },
      { label: "Citizen listings", href: "/marketplace" },
    ],
  },
  {
    title: "Sell",
    links: [
      { label: "Become a seller", href: "/signup" },
      { label: "Open a portal", href: "/signup" },
      { label: "Sell GKWTH coins", href: "/exchange/sell" },
      { label: "Seller guidelines", href: "/marketplace" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About TrisoNet", href: "/" },
      { label: "How it works", href: "/" },
      { label: "Trust & safety", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
];

export default function Footer() {
  const { state } = useApp();
  // Keep the footer out of focused staff workflows; show it on shopper/public surfaces.
  if (state.currentRole !== "buyer" && state.currentRole !== "visitor") return null;

  return (
    <footer className="border-t border-primary-100 bg-surface mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <ShoppingBag className="w-4.5 h-4.5 text-ink" />
              </div>
              <span className="font-bold text-ink">TrisoNet <span className="text-primary-600">Trading Zone</span></span>
            </Link>
            <p className="text-small text-ink-subtle max-w-xs">
              Africa&apos;s premier marketplace connecting buyers, citizen sellers, and verified business partners.
            </p>
            <div className="flex items-center gap-2 mt-4">
              {[Globe, MessageCircle, Mail].map((Icon, i) => (
                <span key={i} className="w-8 h-8 rounded-md border border-primary-100 flex items-center justify-center text-ink-subtle hover:text-primary-600 hover:border-primary-300 transition-colors cursor-pointer">
                  <Icon className="w-4 h-4" />
                </span>
              ))}
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-small font-semibold text-ink mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-small text-ink-subtle hover:text-primary-600 transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-10 pt-6 border-t border-primary-50">
          <p className="text-caption text-ink-subtle">© 2024 TrisoNet Trading Zone. All rights reserved.</p>
          <div className="flex items-center gap-4 text-caption text-ink-subtle">
            <span className="hover:text-ink cursor-pointer">Privacy</span>
            <span className="hover:text-ink cursor-pointer">Terms</span>
            <span className="hover:text-ink cursor-pointer">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
