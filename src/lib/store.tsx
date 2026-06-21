"use client";
import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  Role,
  User,
  Product,
  Negotiation,
  NegotiationMessage,
  Notification,
  Transaction,
  ActivityEvent,
  MOCK_USERS,
  MOCK_PRODUCTS,
  MOCK_NEGOTIATIONS,
  MOCK_NOTIFICATIONS,
  MOCK_TRANSACTIONS,
  MOCK_ACTIVITY,
} from "./mock-data";

interface AppState {
  currentRole: Role;
  currentUser: User;
  products: Product[];
  negotiations: Negotiation[];
  notifications: Notification[];
  transactions: Transaction[];
  activity: ActivityEvent[];
  toasts: Toast[];
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

type Action =
  | { type: "SET_ROLE"; role: Role }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "UPDATE_PRODUCT"; productId: string; updates: Partial<Product> }
  | { type: "ADD_NEGOTIATION_MESSAGE"; negotiationId: string; message: NegotiationMessage; productId: string; buyerId: string; sellerId: string }
  | { type: "UPDATE_NEGOTIATION"; negotiationId: string; updates: Partial<Negotiation> }
  | { type: "ADD_NOTIFICATION"; notification: Notification }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: string }
  | { type: "MARK_ALL_READ" }
  | { type: "ADD_TRANSACTION"; transaction: Transaction }
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "REMOVE_TOAST"; id: string }
  | { type: "ADD_ACTIVITY"; event: ActivityEvent };

function getDefaultUser(role: Role): User {
  return MOCK_USERS.find((u) => u.role === role) ?? MOCK_USERS[0];
}

const initialState: AppState = {
  currentRole: "buyer",
  currentUser: MOCK_USERS.find((u) => u.role === "buyer")!,
  products: MOCK_PRODUCTS,
  negotiations: MOCK_NEGOTIATIONS,
  notifications: MOCK_NOTIFICATIONS,
  transactions: MOCK_TRANSACTIONS,
  activity: MOCK_ACTIVITY,
  toasts: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_ROLE": {
      const user = getDefaultUser(action.role);
      return { ...state, currentRole: action.role, currentUser: user };
    }
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
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addToast: (toast: Omit<Toast, "id">) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  function addToast(toast: Omit<Toast, "id">) {
    const id = `toast-${Date.now()}`;
    dispatch({ type: "ADD_TOAST", toast: { ...toast, id } });
    setTimeout(() => dispatch({ type: "REMOVE_TOAST", id }), 4000);
  }

  return (
    <AppContext.Provider value={{ state, dispatch, addToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
