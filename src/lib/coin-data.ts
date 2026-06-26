// GKWTH Exchange — coin trading / auction mock data.
// Kept separate from the large mock-data.ts to keep that file low-risk.

export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number; // volume (relative)
}

export interface BookLevel {
  price: number;  // NGN
  amount: number; // GKWTH
}

export interface OrderBook {
  asks: BookLevel[]; // sellers, above market (low → high handled in UI)
  bids: BookLevel[]; // buyers, below market
}

export type AuctionStatus = "live" | "starting_soon" | "ended" | "sold";

export interface CoinAuction {
  id: string;           // "001"
  pair: string;         // "GKWTH/NGN"
  sellerId: string;
  sellerName: string;
  amount: number;       // GKWTH up for sale
  startingBid: number;  // NGN
  topBid: number;       // NGN — current highest
  unitPrice: number;    // NGN per GKWTH
  reserve?: number;     // hidden minimum
  buyNow?: number;      // NGN — instant purchase
  minIncrement: number; // NGN
  bids: number;
  bidders: number;
  change: number;       // % vs 24h
  high24h: number;
  low24h: number;
  status: AuctionStatus;
  endsAt: string;       // ISO
  startsAt?: string;    // ISO (for starting_soon)
  candles: Candle[];
  book: OrderBook;
  myLastBid?: number;   // populated as the user bids
  myPosition?: number;  // user's rank among bidders
}

export interface CoinTrade {
  id: string;          // "A-00129"
  auctionId: string;
  amount: number;      // GKWTH
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  finalBid: number;    // NGN
  bids: number;
  date: string;        // ISO
  status: "sold" | "won";
  txnId?: string;
}

export const GKWTH = {
  symbol: "GKWTH",
  name: "GKWTH",
  pairCurrency: "NGN",
  price: 18_400,        // NGN per GKWTH
  change24h: 2.1,
  volume24h: 2_408_500,
  totalBidsToday: 648,
  bidsLastHour: 89,
  liveAuctions: 24,
  endingWithinHour: 3,
} as const;

export const INITIAL_COIN_BALANCE = 124.5;      // user's GKWTH wallet
export const INITIAL_CASH_BALANCE = 2_450_000;  // user's NGN cash balance

export interface WalletEntry {
  id: string;
  type: "deposit" | "withdrawal" | "purchase" | "sale" | "bid" | "fee";
  label: string;
  amountNgn?: number;   // signed NGN movement
  amountGkwth?: number; // signed GKWTH movement
  status: "completed" | "pending";
  date: string;
}

// ---- helpers -------------------------------------------------------------

const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

// Deterministic pseudo-random so server and client renders match.
function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate an upward-drifting candle series ending near `end`. */
function genCandles(seed: number, end: number, count = 36, drift = 0.004): Candle[] {
  const rng = mulberry(seed);
  const out: Candle[] = [];
  // Start lower so the series trends up into the current price.
  let price = end * (1 - drift * count * 0.55);
  for (let i = 0; i < count; i++) {
    const o = price;
    const dir = rng() < 0.62 ? 1 : -1; // bias upward
    const move = o * (drift * (0.4 + rng() * 1.6)) * dir;
    const c = Math.max(o + move, o * 0.97);
    const h = Math.max(o, c) * (1 + rng() * 0.004);
    const l = Math.min(o, c) * (1 - rng() * 0.004);
    out.push({
      o: Math.round(o),
      h: Math.round(h),
      l: Math.round(l),
      c: Math.round(c),
      v: Math.round(30 + rng() * 70),
    });
    price = c;
  }
  // Pin the final close exactly to `end`.
  out[out.length - 1].c = end;
  return out;
}

function genBook(mid: number, seed: number): OrderBook {
  const rng = mulberry(seed);
  const step = Math.round(mid * 0.0006);
  const asks: BookLevel[] = [];
  const bids: BookLevel[] = [];
  for (let i = 1; i <= 5; i++) {
    asks.push({ price: mid + step * i + Math.round(rng() * step), amount: +(2 + rng() * 7).toFixed(1) });
    bids.push({ price: mid - step * i - Math.round(rng() * step), amount: +(2 + rng() * 7).toFixed(1) });
  }
  return { asks, bids };
}

/** Build a brand-new live auction from the Sell wizard's inputs. */
export function createListing(input: {
  sellerId: string;
  sellerName: string;
  amount: number;
  startingBid: number;
  reserve?: number;
  buyNow?: number;
  minIncrement: number;
  durationHours: number;
}): CoinAuction {
  const seed = Math.floor(Math.random() * 1e6);
  const id = `${Math.floor(100 + Math.random() * 800)}`;
  return {
    id,
    pair: "GKWTH/NGN",
    sellerId: input.sellerId,
    sellerName: input.sellerName,
    amount: input.amount,
    startingBid: input.startingBid,
    topBid: input.startingBid,
    unitPrice: Math.round(input.startingBid / input.amount),
    reserve: input.reserve,
    buyNow: input.buyNow,
    minIncrement: input.minIncrement,
    bids: 0,
    bidders: 0,
    change: 0,
    high24h: input.startingBid,
    low24h: input.startingBid,
    status: "live",
    endsAt: hoursFromNow(input.durationHours),
    candles: genCandles(seed, input.startingBid, 36, 0.003),
    book: genBook(input.startingBid, seed + 7),
  };
}

// ---- seed auctions -------------------------------------------------------

export const SEED_AUCTIONS: CoinAuction[] = [
  {
    id: "001", pair: "GKWTH/NGN", sellerId: "seller-alex", sellerName: "Alex Obi",
    amount: 50, startingBid: 900_000, topBid: 920_000, unitPrice: 18_400,
    reserve: 905_000, buyNow: 950_000, minIncrement: 1_000,
    bids: 18, bidders: 5, change: 2.3, high24h: 922_000, low24h: 900_000,
    status: "live", endsAt: hoursFromNow(2.23),
    candles: genCandles(101, 920_000), book: genBook(920_000, 11),
  },
  {
    id: "002", pair: "GKWTH/NGN", sellerId: "seller-kemi", sellerName: "Kemi Adeyemi",
    amount: 120, startingBid: 2_100_000, topBid: 2_184_000, unitPrice: 18_200,
    reserve: 2_150_000, buyNow: 2_300_000, minIncrement: 2_000,
    bids: 31, bidders: 9, change: 1.1, high24h: 2_190_000, low24h: 2_100_000,
    status: "live", endsAt: hoursFromNow(5.8),
    candles: genCandles(202, 2_184_000), book: genBook(2_184_000, 22),
  },
  {
    id: "003", pair: "GKWTH/NGN", sellerId: "seller-tunde", sellerName: "Tunde Balogun",
    amount: 10, startingBid: 180_000, topBid: 188_500, unitPrice: 18_850,
    reserve: 185_000, buyNow: 195_000, minIncrement: 500,
    bids: 44, bidders: 12, change: 4.7, high24h: 189_000, low24h: 180_000,
    status: "live", endsAt: hoursFromNow(0.2),
    candles: genCandles(303, 188_500, 36, 0.006), book: genBook(188_500, 33),
  },
  {
    id: "004", pair: "GKWTH/NGN", sellerId: "seller-fatima", sellerName: "Fatima Sule",
    amount: 200, startingBid: 3_500_000, topBid: 3_500_000, unitPrice: 17_500,
    minIncrement: 5_000,
    bids: 0, bidders: 0, change: -2.8, high24h: 3_600_000, low24h: 3_480_000,
    status: "starting_soon", endsAt: hoursFromNow(6), startsAt: hoursFromNow(3),
    candles: genCandles(404, 3_500_000, 36, 0.003), book: genBook(3_500_000, 44),
  },
  {
    id: "005", pair: "GKWTH/NGN", sellerId: "seller-bola", sellerName: "Bola Eze",
    amount: 75, startingBid: 1_300_000, topBid: 1_380_000, unitPrice: 18_400,
    minIncrement: 1_000,
    bids: 28, bidders: 11, change: 0, high24h: 1_385_000, low24h: 1_300_000,
    status: "ended", endsAt: hoursFromNow(-1),
    candles: genCandles(505, 1_380_000), book: genBook(1_380_000, 55),
  },
  {
    id: "006", pair: "GKWTH/NGN", sellerId: "seller-ngozi", sellerName: "Ngozi Kalu",
    amount: 30, startingBid: 520_000, topBid: 540_000, unitPrice: 18_000,
    reserve: 525_000, buyNow: 560_000, minIncrement: 1_000,
    bids: 12, bidders: 6, change: 0.8, high24h: 542_000, low24h: 520_000,
    status: "live", endsAt: hoursFromNow(9.5),
    candles: genCandles(606, 540_000), book: genBook(540_000, 66),
  },
];

// ---- seed completed trades ----------------------------------------------

export const SEED_TRADES: CoinTrade[] = [
  { id: "A-00129", auctionId: "129", amount: 75, buyerId: "buyer-1", buyerName: "Bola Eze",
    sellerId: "seller-alex", sellerName: "Alex Obi", finalBid: 1_380_000, bids: 28,
    date: daysAgo(2), status: "sold" },
  { id: "A-00115", auctionId: "115", amount: 30, buyerId: "buyer-2", buyerName: "Kemi Adeyemi",
    sellerId: "seller-alex", sellerName: "Alex Obi", finalBid: 558_000, bids: 14,
    date: daysAgo(6), status: "sold" },
  { id: "A-00108", auctionId: "108", amount: 40, buyerId: "buyer-3", buyerName: "Chidi Nwosu",
    sellerId: "seller-alex", sellerName: "Alex Obi", finalBid: 740_000, bids: 22,
    date: daysAgo(9), status: "sold" },
];

// ---- seed wallet ledger --------------------------------------------------

export const SEED_LEDGER: WalletEntry[] = [
  { id: "w-1", type: "deposit",  label: "Bank deposit · GTBank ****4021", amountNgn: 1_500_000, status: "completed", date: daysAgo(1) },
  { id: "w-2", type: "purchase", label: "Won GKWTH/NGN #129 · 75 GKWTH", amountNgn: -1_380_000, amountGkwth: 75, status: "completed", date: daysAgo(2) },
  { id: "w-3", type: "sale",     label: "Sold GKWTH/NGN #115 · 30 GKWTH", amountNgn: 555_210, amountGkwth: -30, status: "completed", date: daysAgo(6) },
  { id: "w-4", type: "fee",      label: "Platform fee · auction #115", amountNgn: -2_790, status: "completed", date: daysAgo(6) },
  { id: "w-5", type: "deposit",  label: "Card top-up · Visa ****8842", amountNgn: 800_000, status: "completed", date: daysAgo(11) },
];

// Ticker tape sellers shown at the top of the markets screen.
export const TICKER = [
  { id: "001", name: "Alex Obi", value: "₦920k", change: 2.3 },
  { id: "002", name: "Kemi A.", value: "₦2.18M", change: 1.1 },
  { id: "003", name: "Tunde B.", value: "₦188.5k", change: 4.7 },
  { id: "004", name: "Fatima S.", value: "₦3.5M", change: -2.8 },
  { id: "005", name: "Bola E.", value: "₦1.38M", change: 0 },
  { id: "006", name: "Ngozi K.", value: "₦540k", change: 0.8 },
];
