"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Link from "next/link";
import { MapPin, Share2, CheckCircle, Package, Copy, ExternalLink, ShieldCheck } from "lucide-react";

export default function CitizenPortalPage() {
  const { state } = useApp();
  const params = useParams();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const citizenId = params.citizenId as string;
  const seller = MOCK_USERS.find((u) => u.id === citizenId && u.role === "citizen_seller") ?? MOCK_USERS.find((u) => u.role === "citizen_seller")!;
  const liveProducts = state.products.filter((p) => p.sellerId === seller.id && p.status === "live");
  const shareUrl = `https://trisonet.com/portal/${citizenId}`;

  function copyLink() {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isOwner = state.currentRole === "citizen_seller" && state.currentUser.id === seller.id;
  const canTransact = state.currentRole === "buyer";

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar name={seller.name} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-h1 text-ink">{seller.name}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-100 text-secondary text-caption font-medium border border-secondary-200"><ShieldCheck className="w-3.5 h-3.5" /> Verified Seller</span>
              </div>
              {seller.tagline && <p className="text-body text-ink-muted mt-1">{seller.tagline}</p>}
              {seller.location && <div className="flex items-center gap-1.5 text-small text-ink-subtle mt-2"><MapPin className="w-3.5 h-3.5" />{seller.location}</div>}
              {seller.bio && <p className="text-small text-ink-muted mt-3 max-w-xl">{seller.bio}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              {isOwner && <Link href={`/portal/${citizenId}/edit`}><Button variant="outline" size="sm">Edit Portal</Button></Link>}
              <Button variant="ghost" size="sm" onClick={() => setShareOpen(true)}><Share2 className="w-4 h-4" /> Share</Button>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-primary-50">
            <div className="text-center"><p className="text-h3 font-bold text-ink">{liveProducts.length}</p><p className="text-caption text-ink-subtle">Live Products</p></div>
            <div className="text-center"><p className="text-h3 font-bold text-ink">{seller.joinedAt?.split("-")[0] ?? "2024"}</p><p className="text-caption text-ink-subtle">Member Since</p></div>
          </div>
        </Card>

        <div>
          <h2 className="text-h2 text-ink mb-4">Products</h2>
          {liveProducts.length === 0 ? (
            <EmptyState icon={Package} title="No live products yet" description="This seller hasn't published any products yet. Check back soon." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {liveProducts.map((p) => (
                <Link key={p.id} href={`/marketplace/${p.id}`} className="group block">
                  <Card hover className="overflow-hidden p-0">
                    <div className="relative h-48 bg-bg overflow-hidden">
                      {p.images[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-12 h-12 text-primary-200" /></div>}
                      {p.negotiable && <div className="absolute top-2 right-2 bg-primary text-ink text-caption font-medium px-2 py-0.5 rounded-full">Offers accepted</div>}
                      <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-caption font-medium px-2 py-0.5 rounded-full text-secondary">Citizen Listing</div>
                    </div>
                    <div className="p-4">
                      <p className="text-small font-medium text-ink line-clamp-2">{p.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-h3 font-bold text-ink">{formatPrice(p.price)}</p>
                        {canTransact && <span className="text-caption text-primary-600 font-medium">View &rarr;</span>}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title="Share this Portal">
        <div className="space-y-5">
          <div className="bg-bg rounded-xl p-4 border border-primary-100">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={seller.name} size="md" />
              <div><p className="font-semibold text-ink text-small">{seller.name}</p><p className="text-caption text-ink-subtle">{liveProducts.length} products &middot; Verified Seller</p></div>
            </div>
            {liveProducts[0]?.images[0] && <img src={liveProducts[0].images[0]} alt="" className="w-full h-32 object-cover rounded-lg" />}
            <p className="text-caption text-primary-600 mt-2 truncate">{shareUrl}</p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2.5 bg-bg rounded-md border border-primary-200 text-small text-ink-subtle truncate">{shareUrl}</div>
            <Button onClick={copyLink} variant={copied ? "secondary" : "primary"} size="md">{copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Copied!" : "Copy"}</Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["Twitter / X", "WhatsApp", "Facebook"].map((platform) => (
              <button key={platform} className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-primary-100 hover:bg-bg transition-colors text-small text-ink-muted">
                <ExternalLink className="w-5 h-5 text-primary-400" />{platform}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
