"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { formatPrice, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import { Search, Package, MapPin, Eye, ShoppingCart } from "lucide-react";

const CATEGORIES = ["All", "Audio", "Smartphones", "TVs", "Laptops", "Dresses", "Fabrics", "Fashion", "Kitchen", "Home Decor"];
type Sort = "newest" | "price-low" | "price-high" | "popular";

function MarketplaceInner() {
  const { state, dispatch, addToast } = useApp();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<Sort>("newest");
  const [loading] = useState(false);

  // Keep the in-page search in sync with the header search (?q=).
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setSearch(q);
  }, [searchParams]);

  const isBuyer = state.currentRole === "buyer";

  const liveProducts = useMemo(() => {
    let p = state.products.filter((p) => p.status === "live");
    if (search) { const q = search.toLowerCase(); p = p.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)); }
    if (category !== "All") p = p.filter((p) => p.category === category);
    if (sort === "price-low") p = [...p].sort((a, b) => a.price - b.price);
    else if (sort === "price-high") p = [...p].sort((a, b) => b.price - a.price);
    else if (sort === "popular") p = [...p].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    else p = [...p].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return p;
  }, [state.products, search, category, sort]);

  const isVisitor = state.currentRole === "visitor";

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-h1 text-ink">Marketplace</h1>
          <p className="text-small text-ink-subtle mt-1">{liveProducts.length} products available</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-3 py-2.5 rounded-md border border-primary-200 bg-surface text-small focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="px-3 py-2.5 rounded-md border border-primary-200 bg-surface text-small focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="newest">Newest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="popular">Most popular</option>
          </select>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className={cn("px-4 py-1.5 rounded-full text-small font-medium whitespace-nowrap transition-colors shrink-0", category === cat ? "bg-primary text-ink shadow-btn" : "bg-surface text-ink-subtle border border-primary-100 hover:border-primary-300")}>{cat}</button>
          ))}
        </div>

        {isVisitor && (
          <div className="bg-primary-50 border border-primary-100 rounded-xl px-5 py-4 flex items-start gap-3">
            <Eye className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-small font-semibold text-ink">You&apos;re browsing as a Visitor</p>
              <p className="text-small text-ink-subtle mt-0.5">You can browse all products, but you&apos;ll need to sign up as a Buyer to make offers or purchase.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
        ) : liveProducts.length === 0 ? (
          <EmptyState icon={Package} title="No products found" description="Try adjusting your search or category filter." action={{ label: "Clear filters", onClick: () => { setSearch(""); setCategory("All"); } }} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {liveProducts.map((p) => (
              <Link key={p.id} href={`/marketplace/${p.id}`} className="group block">
                <div className="bg-surface rounded-lg shadow-card border border-primary-50 overflow-hidden hover:shadow-lifted transition-shadow">
                  <div className="relative h-48 bg-bg overflow-hidden">
                    {p.images[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-12 h-12 text-primary-200" /></div>}
                    <div className={cn("absolute top-2 left-2 text-caption font-medium px-2 py-0.5 rounded-full", p.source === "market_square" ? "bg-white/80 backdrop-blur-sm text-primary-700 border border-primary-100" : "bg-white/80 backdrop-blur-sm text-secondary border border-secondary-200")}>{p.source === "market_square" ? "Market Square" : "Citizen Listing"}</div>
                    {p.negotiable && <div className="absolute top-2 right-2 bg-primary text-ink text-caption font-medium px-2 py-0.5 rounded-full">Offers accepted</div>}
                  </div>
                  <div className="p-4">
                    <p className="text-small font-medium text-ink line-clamp-2 mb-1">{p.name}</p>
                    <div className="flex items-center gap-1 text-caption text-ink-subtle mb-3"><MapPin className="w-3 h-3" />{p.location ?? "Africa"}</div>
                    <div className="flex items-center justify-between">
                      <p className="text-h3 font-bold text-ink">{formatPrice(p.price)}</p>
                      {isBuyer ? (
                        <button
                          onClick={(e) => { e.preventDefault(); dispatch({ type: "ADD_TO_CART", productId: p.id, quantity: 1 }); addToast({ type: "success", title: "Added to cart", message: p.name }); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary-50 text-primary-700 text-caption font-medium hover:bg-primary-100 transition-colors"
                          aria-label="Add to cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Add
                        </button>
                      ) : !isVisitor ? (
                        <span className="text-caption text-primary-600 font-medium">View &rarr;</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={null}>
      <MarketplaceInner />
    </Suspense>
  );
}
