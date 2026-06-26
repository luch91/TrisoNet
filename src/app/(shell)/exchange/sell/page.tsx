"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { createListing, INITIAL_COIN_BALANCE } from "@/lib/coin-data";
import { formatNaira, cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import ExchangeShell from "@/components/exchange/ExchangeShell";
import Button from "@/components/ui/Button";
import { Check, ChevronRight, ChevronLeft, Rocket, Lock } from "lucide-react";

const DURATIONS = [
  { label: "6 hrs", hours: 6 },
  { label: "24 hrs", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "7 days", hours: 168 },
];
const INCREMENTS = [500, 1_000, 2_000];
const STEPS = ["Amount", "Pricing", "Duration", "Review"];
const FEE_RATE = 0.005;

export default function SellPage() {
  const { state, dispatch, addToast } = useApp();
  const router = useRouter();

  const balance = state.coinBalance || INITIAL_COIN_BALANCE;
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState(50);
  const [startingBid, setStartingBid] = useState(900_000);
  const [reserve, setReserve] = useState<number | "">("");
  const [minIncrement, setMinIncrement] = useState(1_000);
  const [durationHours, setDurationHours] = useState(24);
  const [buyNow, setBuyNow] = useState<number | "">("");
  const [visibility, setVisibility] = useState<"Public" | "Unlisted">("Public");

  const perUnit = amount > 0 ? Math.round(startingBid / amount) : 0;
  const fee = Math.round(startingBid * FEE_RATE);
  const youReceive = startingBid - fee;
  const endsLabel = new Date(Date.now() + durationHours * 3600_000).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" });

  const canNext = step === 0 ? amount > 0 && amount <= balance : step === 1 ? startingBid > 0 : true;

  function launch() {
    const auction = createListing({
      sellerId: state.currentUser.id,
      sellerName: state.currentUser.name === "Guest" ? "You" : state.currentUser.name,
      amount,
      startingBid,
      reserve: reserve === "" ? undefined : Number(reserve),
      buyNow: buyNow === "" ? undefined : Number(buyNow),
      minIncrement,
      durationHours,
    });
    dispatch({ type: "LAUNCH_COIN_AUCTION", auction });
    addToast({ type: "success", title: "Auction launched", message: `${amount} GKWTH listed · ${auction.pair} #${auction.id}` });
    router.push(`/exchange/${auction.id}`);
  }

  return (
    <PageTransition>
      <ExchangeShell bare>
        <div className="mb-5">
          <p className="text-caption text-primary-600 font-semibold uppercase tracking-wide">New listing</p>
          <h1 className="text-h1 text-ink mt-1">List your GKWTH for sale</h1>
          <p className="text-small text-ink-subtle mt-1">Set your terms — open to bidders — accept the offer you want.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
              <button onClick={() => i < step && setStep(i)} className="flex items-center gap-2">
                <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-caption font-bold transition-colors",
                  i < step ? "bg-secondary text-white" : i === step ? "bg-primary text-ink" : "bg-bg text-ink-subtle border border-primary-200")}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </span>
                <span className={cn("text-small font-medium hidden sm:inline", i === step ? "text-ink" : "text-ink-subtle")}>{s}</span>
              </button>
              {i < STEPS.length - 1 && <span className={cn("h-px flex-1 hidden sm:block", i < step ? "bg-secondary" : "bg-primary-200")} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            {step === 0 && (
              <Section title="GKWTH amount to sell" hint={`Available: ${balance} GKWTH · Minimum: 0.5 GKWTH`}>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle font-medium">GKW</span>
                  <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-16 pr-16 py-4 rounded-lg border border-primary-200 bg-bg text-h1 font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface tabular-nums" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-subtle">GKWTH</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[10, 25, 50, 100].map((v) => (
                    <Chip key={v} active={amount === v} onClick={() => setAmount(v)}>{v}</Chip>
                  ))}
                  <Chip active={amount === balance} onClick={() => setAmount(balance)}>Max ({balance})</Chip>
                </div>
                {amount > balance && <p className="text-caption text-error">You only have {balance} GKWTH available.</p>}
              </Section>
            )}

            {step === 1 && (
              <Section title="Bidding & pricing setup">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Starting bid (₦)">
                    <CurrencyInput value={startingBid} onChange={setStartingBid} />
                    <p className="text-caption text-ink-subtle mt-1">= {formatNaira(perUnit)}/GKWTH</p>
                  </Field>
                  <Field label="Reserve price (₦) — optional">
                    <CurrencyInput value={reserve} onChange={(v) => setReserve(v)} placeholder="Hidden minimum…" />
                    <p className="text-caption text-ink-subtle mt-1">Auction won&apos;t sell below this.</p>
                  </Field>
                </div>
                <div>
                  <p className="text-caption text-ink-subtle uppercase tracking-wide mb-2">Min bid increment</p>
                  <div className="flex gap-2 flex-wrap">
                    {INCREMENTS.map((v) => (
                      <Chip key={v} active={minIncrement === v} onClick={() => setMinIncrement(v)}>{formatNaira(v)}</Chip>
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {step === 2 && (
              <>
                <Section title="Auction duration" hint={`Auction ends: ${endsLabel}`}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DURATIONS.map((d) => (
                      <button key={d.hours} onClick={() => setDurationHours(d.hours)}
                        className={cn("rounded-lg border py-4 text-center transition-colors", durationHours === d.hours ? "border-primary bg-primary-50" : "border-primary-200 hover:bg-bg")}>
                        <p className={cn("text-h3 font-bold", durationHours === d.hours ? "text-primary-700" : "text-ink")}>{d.label.split(" ")[0]}</p>
                        <p className="text-caption text-ink-subtle uppercase">{d.label.split(" ")[1]}</p>
                      </button>
                    ))}
                  </div>
                </Section>
                <Section title="Advanced settings" hint="Buy-now price & visibility">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Buy It Now (₦) — optional">
                      <CurrencyInput value={buyNow} onChange={(v) => setBuyNow(v)} placeholder="Allow instant purchase…" />
                    </Field>
                    <Field label="Visibility">
                      <div className="flex gap-2">
                        {(["Public", "Unlisted"] as const).map((v) => (
                          <Chip key={v} active={visibility === v} onClick={() => setVisibility(v)}>{v}</Chip>
                        ))}
                      </div>
                    </Field>
                  </div>
                </Section>
              </>
            )}

            {step === 3 && (
              <Section title="Review your listing">
                <dl className="divide-y divide-primary-100">
                  <ReviewRow k="GKWTH amount" v={`${amount} GKWTH`} />
                  <ReviewRow k="Starting bid" v={formatNaira(startingBid)} />
                  <ReviewRow k="Per unit" v={`≈ ${formatNaira(perUnit)}`} />
                  <ReviewRow k="Reserve" v={reserve === "" ? "None" : formatNaira(Number(reserve))} />
                  <ReviewRow k="Buy It Now" v={buyNow === "" ? "Off" : formatNaira(Number(buyNow))} />
                  <ReviewRow k="Min increment" v={formatNaira(minIncrement)} />
                  <ReviewRow k="Duration" v={DURATIONS.find((d) => d.hours === durationHours)?.label ?? `${durationHours}h`} />
                  <ReviewRow k="Visibility" v={visibility} />
                  <ReviewRow k="Platform fee" v={`${formatNaira(fee)} (0.5%)`} />
                </dl>
              </Section>
            )}

            <div className="flex items-center justify-between">
              {step > 0
                ? <Button variant="ghost" onClick={() => setStep((s) => s - 1)}><ChevronLeft className="w-4 h-4" /> Back</Button>
                : <span />}
              {step < STEPS.length - 1
                ? <Button onClick={() => canNext && setStep((s) => s + 1)} disabled={!canNext}>Next <ChevronRight className="w-4 h-4" /></Button>
                : <Button size="lg" variant="secondary" onClick={launch}><Rocket className="w-4 h-4" /> Launch auction</Button>}
            </div>
          </div>

          {/* Live preview */}
          <div className="lg:sticky lg:top-20 self-start">
            <div className="rounded-xl border border-primary-100 bg-surface shadow-card overflow-hidden">
              <div className="px-4 py-3 bg-surface-2 border-b border-primary-100">
                <p className="text-caption text-ink-subtle uppercase tracking-wide">Auction preview</p>
              </div>
              <div className="p-4">
                <div className="flex items-baseline gap-2">
                  <p className="text-display font-bold text-ink leading-none tabular-nums">{amount}</p>
                  <p className="text-h3 text-ink-subtle">GKWTH</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 text-caption font-medium text-secondary px-2 py-0.5 rounded-full bg-secondary-50 border border-secondary-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Live
                  </span>
                  <span className="text-caption text-ink-subtle">Starting {formatNaira(startingBid)} · {formatNaira(perUnit)}/GKWTH</span>
                </div>

                <dl className="mt-4 space-y-2 text-small">
                  <PreviewRow k="Starting bid" v={formatNaira(startingBid)} />
                  <PreviewRow k="Per unit" v={`≈ ${formatNaira(perUnit)}`} />
                  <PreviewRow k="Duration" v={DURATIONS.find((d) => d.hours === durationHours)?.label ?? `${durationHours}h`} />
                  <PreviewRow k="Visibility" v={visibility} />
                  <PreviewRow k="Platform fee" v="0.5% on sale" />
                </dl>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary-100">
                  <span className="text-small text-ink-subtle">You receive (min)</span>
                  <span className="text-h3 font-bold text-secondary tabular-nums">{formatNaira(youReceive)}</span>
                </div>

                <div className="mt-3 rounded-md bg-warning-50 border border-warning/30 px-3 py-2 text-caption text-ink flex gap-2">
                  <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-warning" />
                  GKWTH is locked while the auction is live. Released back to your wallet if no bid is accepted.
                </div>
              </div>
            </div>
          </div>
        </div>
      </ExchangeShell>
    </PageTransition>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-primary-100 bg-surface shadow-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-1">
        <h2 className="text-caption font-semibold text-ink uppercase tracking-wide">{title}</h2>
        {hint && <span className="text-caption text-ink-subtle">{hint}</span>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-caption text-ink-subtle uppercase tracking-wide">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function CurrencyInput({ value, onChange, placeholder }: { value: number | ""; onChange: (v: number) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle">₦</span>
      <input type="number" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className="w-full pl-7 pr-3 py-2.5 rounded-md border border-primary-200 bg-bg text-body font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface tabular-nums" />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("px-3.5 py-1.5 rounded-md text-small font-medium transition-colors",
      active ? "bg-secondary text-white" : "border border-primary-200 text-ink hover:bg-bg")}>
      {children}
    </button>
  );
}

function ReviewRow({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between py-2.5 text-small"><dt className="text-ink-subtle">{k}</dt><dd className="font-medium text-ink tabular-nums">{v}</dd></div>;
}

function PreviewRow({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between"><dt className="text-ink-subtle">{k}</dt><dd className="font-medium text-ink tabular-nums">{v}</dd></div>;
}
