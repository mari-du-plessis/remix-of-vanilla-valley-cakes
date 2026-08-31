import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  EMPTY_CART_CONTACT,
  type CartContact,
  type CartItem,
  type CartItemConfig,
} from "./types";

/**
 * The customer's order basket.
 *
 * One order can hold a custom cake, cupcakes and any number of fixed-price
 * products at once, and it survives a page reload so browsing the products
 * section never loses a half-built cake. Nothing is written to the database
 * until the customer sends the enquiry — at which point the whole cart becomes
 * a single order with one order item per cart line.
 */

const STORAGE_KEY = "vv.cart.v1";

type CartState = { items: CartItem[]; contact: CartContact };

type CartApi = CartState & {
  addItem: (item: Omit<CartItem, "id" | "createdAt">) => string;
  updateItem: (id: string, patch: Partial<Omit<CartItem, "id" | "createdAt">>) => void;
  updateConfig: (id: string, config: CartItemConfig) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  setContact: (patch: Partial<CartContact>) => void;
  itemCount: number;
  getItem: (id: string | null | undefined) => CartItem | undefined;
};

const CartContext = createContext<CartApi | null>(null);

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `cart-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function readStored(): CartState {
  if (typeof window === "undefined") return { items: [], contact: EMPTY_CART_CONTACT };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], contact: EMPTY_CART_CONTACT };
    const parsed = JSON.parse(raw) as Partial<CartState>;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      contact: { ...EMPTY_CART_CONTACT, ...(parsed.contact ?? {}) },
    };
  } catch {
    return { items: [], contact: EMPTY_CART_CONTACT };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  /* Server render starts empty; the stored cart is adopted after hydration so
     the markup matches on both sides. */
  const [state, setState] = useState<CartState>({ items: [], contact: EMPTY_CART_CONTACT });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStored());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* A full or blocked storage quota must never break ordering. */
    }
  }, [state, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "id" | "createdAt">) => {
    const id = newId();
    setState((s) => ({
      ...s,
      items: [...s.items, { ...item, id, createdAt: new Date().toISOString() }],
    }));
    return id;
  }, []);

  /** Every mutation replaces only the addressed item, so edits never bleed. */
  const updateItem = useCallback(
    (id: string, patch: Partial<Omit<CartItem, "id" | "createdAt">>) =>
      setState((s) => ({
        ...s,
        items: s.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      })),
    [],
  );

  const updateConfig = useCallback(
    (id: string, config: CartItemConfig) =>
      setState((s) => ({
        ...s,
        items: s.items.map((item) => (item.id === id ? { ...item, config } : item)),
      })),
    [],
  );

  const setQuantity = useCallback(
    (id: string, quantity: number) =>
      setState((s) => ({
        ...s,
        items: s.items.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, Math.round(quantity) || 1) } : item,
        ),
      })),
    [],
  );

  const removeItem = useCallback(
    (id: string) => setState((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) })),
    [],
  );

  const clear = useCallback(
    () => setState((s) => ({ items: [], contact: s.contact })),
    [],
  );

  const setContact = useCallback(
    (patch: Partial<CartContact>) =>
      setState((s) => ({ ...s, contact: { ...s.contact, ...patch } })),
    [],
  );

  const getItem = useCallback(
    (id: string | null | undefined) => (id ? state.items.find((i) => i.id === id) : undefined),
    [state.items],
  );

  const value = useMemo<CartApi>(
    () => ({
      ...state,
      addItem,
      updateItem,
      updateConfig,
      setQuantity,
      removeItem,
      clear,
      setContact,
      getItem,
      itemCount: state.items.reduce((n, i) => n + i.quantity, 0),
    }),
    [state, addItem, updateItem, updateConfig, setQuantity, removeItem, clear, setContact, getItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
