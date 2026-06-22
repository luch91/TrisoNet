"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import { Search, MapPin, ShieldCheck, Package, Users, ArrowRight } from "lucide-react";

export default function SellersDirectoryPage() {
  const { state } = useApp();
  const [search, setSearch] = useState("");

  const sellers = useMemo(() => {
    const citizens = MOCK_USERS.filter((u) => u.role === "citizen_seller");
    return citizens
      .map((s) => ({
        ...s,
        liveCount: state.products.filter((p) => p.sellerId === s.id && p.status === "live").length,
      }))
      .filter((s) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.location?.toLowerCase().includes(q) ||
          s.tagline?.toLowerCase().includes(q) ||
          s.bio?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.liveCount - a.liveCount);
  }, [state.products, search]);

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-h1 text-ink">Seller Portals</h1>
            <p className="text-small text-ink-subtle mt-1">
              Browse {sellers.length} verified citizen seller{sellers.length !== 1 ? "s" : ""} across Africa.
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sellers by name, location, or craft..."
            className="w-full pl-9 pr-3 py-2.5 rounded-md border border-primary-200 bg-surface text-small focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {sellers.length === 0 ? (
          <EmptyState icon={Users} title="No sellers found" description="Try a different search term." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sellers.map((s) => {
              const featured = state.products.filter((p) => p.sellerId === s.id && p.status === "live").slice(0, 3);
              return (
                <Link key={s.id} href={`/portal/${s.id}`} className="group block">
                  <Card hover className="h-full flex flex-col">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size="lg" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-small font-semibold text-ink truncate">{s.name}</p>
                          <ShieldCheck className="w-3.5 h-3.5 text-secondary shrink-0" />
                        </div>
                        {s.location && <p className="text-caption text-ink-subtle flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {s.location}</p>}
                      </div>
                    </div>
                    {s.tagline && <p className="text-small text-ink-muted mt-3 line-clamp-2">{s.tagline}</p>}

                    {featured.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {featured.map((p) => (
                          <div key={p.id} className="w-1/3 aspect-square rounded-lg bg-bg overflow-hidden">
                            {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary-50">
                      <span className="text-caption text-ink-subtle flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" /> {s.liveCount} live product{s.liveCount !== 1 ? "s" : ""}
                      </span>
                      <span className={cn("text-caption font-medium text-primary-600 flex items-center gap-1 transition-transform group-hover:translate-x-0.5")}>
                        Visit <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
