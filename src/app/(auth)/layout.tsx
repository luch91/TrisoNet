import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg">
      {/* Brand / marketing panel */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary-600 to-secondary-600 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-white/10 blur-2xl" />
        <Link href="/" className="relative flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 rounded-md bg-white/20 backdrop-blur flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">TrisoNet</span>
        </Link>
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Africa&apos;s most trusted trading network.
          </h2>
          <p className="text-white/80 leading-relaxed">
            Browse quality-verified products, connect directly with citizen sellers, and negotiate fair
            prices — all in one place.
          </p>
          <div className="flex items-center gap-6 mt-8">
            <div>
              <p className="text-2xl font-bold">12k+</p>
              <p className="text-white/70 text-small">Products listed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">3.5k+</p>
              <p className="text-white/70 text-small">Verified sellers</p>
            </div>
            <div>
              <p className="text-2xl font-bold">98%</p>
              <p className="text-white/70 text-small">Buyer satisfaction</p>
            </div>
          </div>
        </div>
        <p className="relative z-10 text-white/60 text-small">© 2024 TrisoNet Trading Zone</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <ShoppingBag className="w-4.5 h-4.5 text-ink" />
          </div>
          <span className="font-bold text-ink">TrisoNet <span className="text-primary-600">Trading Zone</span></span>
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
