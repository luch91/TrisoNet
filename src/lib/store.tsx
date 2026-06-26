"use client";
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import {
  Role,
  User,
  Product,
  Negotiation,
  NegotiationMessage,
  Notification,
  Transaction,
  ActivityEvent,
  GUEST_USER,
  MOCK_USERS,
  MOCK_PRODUCTS,
  MOCK_NEGOTIATIONS,
  MOCK_NOTIFICATIONS,
  MOCK_TRANSACTIONS,
  MOCK_ACTIVITY,
} from "./mock-data";
import {
  CoinAuction,
  CoinTrade,
  WalletEntry,
  SEED_AUCTIONS,
  SEED_TRADES,
  SEED_LEDGER,
  INITIAL_COIN_BALANCE,
  INITIAL_CASH_BALANCE,
} from "./coin-data";

export type Theme = "light" | "dark";

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Preferences {
  emailOffers: boolean;
  emailOrders: boolean;
  emailMarketing: boolean;
}

interface AppState {
  currentRole: Role;
  currentUser: User;
  isAuthenticated: boolean;
  products: Product[];
  negotiations: Negotiation[];
  notifications: Notification[];
  transactions: Transaction[];
  activity: ActivityEvent[];
  cart: CartItem[];
  preferences: Preferences;
  coinAuctions: CoinAuction[];
  coinTrades: CoinTrade[];
  coinBalance: number;
  cashBalance: number;
  walletLedger: WalletEntry[];
  theme: Theme;
  toasts: Toast[];
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

type Action =
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" }
  | { type: "SET_ROLE"; role: Role }
  | { type: "UPDATE_USER"; updates: Partial<User> }
  | { type: "UPDATE_PREFERENCES"; updates: Partial<Preferences> }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "UPDATE_PRODUCT"; productId: string; updates: Partial<Product> }
  | { type: "ADD_TO_CART"; productId: string; quantity?: number }
  | { type: "REMOVE_FROM_CART"; productId: string }
  | { type: "SET_CART_QTY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "ADD_NEGOTIATION_MESSAGE"; negotiationId: string; message: NegotiationMessage; productId: string; buyerId: string; sellerId: string }
  | { type: "UPDATE_NEGOTIATION"; negotiationId: string; updates: Partial<Negotiation> }
  | { type: "ADD_NOTIFICATION"; notification: Notification }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: string }
  | { type: "MARK_ALL_READ" }
  | { type: "ADD_TRANSACTION"; transaction: Transaction }
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "REMOVE_TOAST"; id: string }
  | { type: "ADD_ACTIVITY"; event: ActivityEvent }
  | { type: "SET_THEME"; theme: Theme }
  | { type: "PLACE_COIN_BID"; auctionId: string; amount: number }
  | { type: "LAUNCH_COIN_AUCTION"; auction: CoinAuction }
  | { type: "COMPLETE_COIN_TRADE"; trade: CoinTrade; coinDelta: number }
  | { type: "END_COIN_AUCTION"; auctionId: string }
  | { type: "WALLET_DEPOSIT"; amount: number; label: string }
  | { type: "WALLET_WITHDRAW"; amount: number; label: string }
  | { type: "HYDRATE"; payload: Partial<AppState> };

function getDefaultUser(role: Role): User {
  if (role === "visitor") return GUEST_USER;
  return MOCK_USERS.find((u) => u.role === role) ?? MOCK_USERS[0];
}

const DEFAULT_PREFERENCES: Preferences = {
  emailOffers: true,
  emailOrders: true,
  emailMarketing: false,
};

const initialState: AppState = {
  currentRole: "visitor",
  currentUser: GUEST_USER,
  isAuthenticated: false,
  products: MOCK_PRODUCTS,
  negotiations: MOCK_NEGOTIATIONS,
  notifications: MOCK_NOTIFICATIONS,
  transactions: MOCK_TRANSACTIONS,
  activity: MOCK_ACTIVITY,
  cart: [],
  preferences: DEFAULT_PREFERENCES,
  coinAuctions: SEED_AUCTIONS,
  coinTrades: SEED_TRADES,
  coinBalance: INITIAL_COIN_BALANCE,
  cashBalance: INITIAL_CASH_BALANCE,
  walletLedger: SEED_LEDGER,
  theme: "light",
  toasts: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload };
    case "LOGIN":
      return { ...state, currentUser: action.user, currentRole: action.user.role, isAuthenticated: true };
    case "LOGOUT":
      return { ...state, currentUser: GUEST_USER, currentRole: "visitor", isAuthenticated: false, cart: [] };
    case "SET_ROLE": {
      const user = getDefaultUser(action.role);
      return { ...state, currentRole: action.role, currentUser: user, isAuthenticated: action.role !== "visitor" };
    }
    case "UPDATE_USER": {
      const updated = { ...state.currentUser, ...action.updates };
      return {
        ...state,
        currentUser: updated,
        // keep the seeded users list in sync so other views reflect the change
        // (only matters for known users, harmless for the guest)
      };
    }
    case "UPDATE_PREFERENCES":
      return { ...state, preferences: { ...state.preferences, ...action.updates } };
    case "ADD_PRODUCT":
      return {
        ...state,
        products: [action.product, ...state.products],
        activity: [
          {
            id: `act-${Date.now()}`,
            type: "submitted",
            productId: action.product.id,
            productName: action.product.name,
            userId: action.product.sellerId,
            createdAt: new Date().toISOString(),
          },
          ...state.activity,
        ],
      };
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.productId ? { ...p, ...action.updates, updatedAt: new Date().toISOString() } : p
        ),
      };
    case "ADD_TO_CART": {
      const qty = action.quantity ?? 1;
      const existing = state.cart.find((c) => c.productId === action.productId);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((c) =>
            c.productId === action.productId ? { ...c, quantity: c.quantity + qty } : c
          ),
        };
      }
      return { ...state, cart: [...state.cart, { productId: action.productId, quantity: qty }] };
    }
    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((c) => c.productId !== action.productId) };
    case "SET_CART_QTY":
      return {
        ...state,
        cart: action.quantity <= 0
          ? state.cart.filter((c) => c.productId !== action.productId)
          : state.cart.map((c) => (c.productId === action.productId ? { ...c, quantity: action.quantity } : c)),
      };
    case "CLEAR_CART":
      return { ...state, cart: [] };
    case "ADD_NEGOTIATION_MESSAGE": {
      const existing = state.negotiations.find((n) => n.id === action.negotiationId);
      if (existing) {
        return {
          ...state,
          negotiations: state.negotiations.map((n) =>
            n.id === action.negotiationId
              ? { ...n, messages: [...n.messages, action.message] }
              : n
          ),
        };
      }
      const newNeg: Negotiation = {
        id: action.negotiationId,
        productId: action.productId,
        buyerId: action.buyerId,
        sellerId: action.sellerId,
        status: "active",
        messages: [action.message],
        createdAt: new Date().toISOString(),
      };
      return { ...state, negotiations: [...state.negotiations, newNeg] };
    }
    case "UPDATE_NEGOTIATION":
      return {
        ...state,
        negotiations: state.negotiations.map((n) =>
          n.id === action.negotiationId ? { ...n, ...action.updates } : n
        ),
      };
    case "ADD_NOTIFICATION":
      return { ...state, notifications: [action.notification, ...state.notifications] };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.notificationId ? { ...n, read: true } : n
        ),
      };
    case "MARK_ALL_READ":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [action.transaction, ...state.transactions] };
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.toast] };
    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "ADD_ACTIVITY":
      return { ...state, activity: [action.event, ...state.activity] };
    case "SET_THEME":
      return { ...state, theme: action.theme };
    case "PLACE_COIN_BID":
      return {
        ...state,
        coinAuctions: state.coinAuctions.map((a) => {
          if (a.id !== action.auctionId) return a;
          const isNewTop = action.amount > a.topBid;
          return {
            ...a,
            topBid: Math.max(a.topBid, action.amount),
            unitPrice: Math.round(Math.max(a.topBid, action.amount) / a.amount),
            bids: a.bids + 1,
            bidders: a.myLastBid ? a.bidders : a.bidders + 1,
            myLastBid: action.amount,
            myPosition: isNewTop ? 1 : a.myPosition ?? 2,
            // surface the bid into the order book so the ladder reacts
            book: {
              ...a.book,
              bids: [{ price: action.amount, amount: a.amount }, ...a.book.bids].slice(0, 5),
            },
          };
        }),
      };
    case "LAUNCH_COIN_AUCTION":
      return { ...state, coinAuctions: [action.auction, ...state.coinAuctions] };
    case "COMPLETE_COIN_TRADE": {
      const t = action.trade;
      const fee = Math.round(t.finalBid * 0.005);
      const won = t.status === "won"; // buyer pays; seller (sold) is credited
      const cashDelta = won ? -t.finalBid : t.finalBid - fee;
      const entry: WalletEntry = {
        id: `w-${Date.now()}`,
        type: won ? "purchase" : "sale",
        label: won
          ? `Won GKWTH/NGN #${t.auctionId} · ${t.amount} GKWTH`
          : `Sold GKWTH/NGN #${t.auctionId} · ${t.amount} GKWTH`,
        amountNgn: cashDelta,
        amountGkwth: won ? t.amount : -t.amount,
        status: "completed",
        date: t.date,
      };
      return {
        ...state,
        coinTrades: [t, ...state.coinTrades],
        coinBalance: Math.max(0, +(state.coinBalance + action.coinDelta).toFixed(2)),
        cashBalance: Math.max(0, state.cashBalance + cashDelta),
        walletLedger: [entry, ...state.walletLedger],
        coinAuctions: state.coinAuctions.map((a) =>
          a.id === t.auctionId ? { ...a, status: "sold" as const } : a
        ),
      };
    }
    case "END_COIN_AUCTION":
      return {
        ...state,
        coinAuctions: state.coinAuctions.map((a) =>
          a.id === action.auctionId ? { ...a, status: "ended" as const } : a
        ),
      };
    case "WALLET_DEPOSIT":
      return {
        ...state,
        cashBalance: state.cashBalance + action.amount,
        walletLedger: [
          { id: `w-${Date.now()}`, type: "deposit", label: action.label, amountNgn: action.amount, status: "completed", date: new Date().toISOString() },
          ...state.walletLedger,
        ],
      };
    case "WALLET_WITHDRAW":
      return {
        ...state,
        cashBalance: Math.max(0, state.cashBalance - action.amount),
        walletLedger: [
          { id: `w-${Date.now()}`, type: "withdrawal", label: action.label, amountNgn: -action.amount, status: "pending", date: new Date().toISOString() },
          ...state.walletLedger,
        ],
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addToast: (toast: Omit<Toast, "id">) => void;
  cartCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "trisonet-session-v1";

interface PersistedShape {
  currentRole: Role;
  currentUser: User;
  isAuthenticated: boolean;
  cart: CartItem[];
  preferences: Preferences;
  coinBalance: number;
  cashBalance: number;
  theme: Theme;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate session (role / auth / cart / prefs) from localStorage after mount.
  // Done in an effect so the first client render matches the server render (no hydration mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PersistedShape>;
      const payload: Partial<AppState> = {};
      if (parsed.currentRole) payload.currentRole = parsed.currentRole;
      if (parsed.currentUser) payload.currentUser = parsed.currentUser;
      if (typeof parsed.isAuthenticated === "boolean") payload.isAuthenticated = parsed.isAuthenticated;
      if (Array.isArray(parsed.cart)) payload.cart = parsed.cart;
      if (parsed.preferences) payload.preferences = { ...DEFAULT_PREFERENCES, ...parsed.preferences };
      if (typeof parsed.coinBalance === "number") payload.coinBalance = parsed.coinBalance;
      if (typeof parsed.cashBalance === "number") payload.cashBalance = parsed.cashBalance;
      if (parsed.theme === "light" || parsed.theme === "dark") payload.theme = parsed.theme;
      if (Object.keys(payload).length) dispatch({ type: "HYDRATE", payload });
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  // Persist the relevant slices whenever they change.
  useEffect(() => {
    try {
      const toStore: PersistedShape = {
        currentRole: state.currentRole,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        cart: state.cart,
        preferences: state.preferences,
        coinBalance: state.coinBalance,
        cashBalance: state.cashBalance,
        theme: state.theme,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      /* ignore quota / unavailable storage */
    }
  }, [state.currentRole, state.currentUser, state.isAuthenticated, state.cart, state.preferences, state.coinBalance, state.cashBalance, state.theme]);

  // Reflect the chosen theme on <html> so Tailwind's `dark:` variant + token vars apply app-wide.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", state.theme === "dark");
    root.style.colorScheme = state.theme;
  }, [state.theme]);

  function addToast(toast: Omit<Toast, "id">) {
    const id = `toast-${Date.now()}`;
    dispatch({ type: "ADD_TOAST", toast: { ...toast, id } });
    setTimeout(() => dispatch({ type: "REMOVE_TOAST", id }), 4000);
  }

  const cartCount = state.cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <AppContext.Provider value={{ state, dispatch, addToast, cartCount }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
