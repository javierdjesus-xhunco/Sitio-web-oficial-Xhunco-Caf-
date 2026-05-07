"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

/* =========================
   TYPES
========================= */

export type CartItem = {
  id: string;
  suministro_id?: string | null;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  categoria?: string;
  sku?: string;
};

type CartContextType = {
  carrito: Record<string, CartItem>;

  // acciones
  addItem: (item: Omit<CartItem, "cantidad">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;

  // UI
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;

  // estado
  isLoaded: boolean;

  // derivados
  items: CartItem[];
  totalItems: number;
  subtotal: number;
};

/* ========================= */

const CartContext = createContext<CartContextType | null>(null);

const LS_KEY = "xhunco_cart_v1";

const GUEST_KEY = "xhunco_guest_id";

function getGuestId() {
  if (typeof window === "undefined") return null;

  let id = localStorage.getItem(GUEST_KEY);

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_KEY, id);
  }

  return id;
}

/* ========================= */

export function CartProvider({ children }: { children: ReactNode }) {
  const [carrito, setCarrito] = useState<Record<string, CartItem>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

/* ===== LOAD ===== */
useEffect(() => {
  const loadCart = async () => {
    try {
      const local = localStorage.getItem(LS_KEY);
      if (local) {
        setCarrito(JSON.parse(local));
      }

    } catch (err) {
      console.error("Error cargando carrito:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  loadCart();
}, []);


  /* ===== SAVE ===== */
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(LS_KEY, JSON.stringify(carrito));
  }, [carrito, isLoaded]);



  /* ===== SYNC BACKEND ===== */

  /* =========================
     ACTIONS
  ========================= */

  const addItem = (item: Omit<CartItem, "cantidad">) => {
    const key = item.suministro_id || item.id;
    if (!key) return;

    setCarrito((prev) => {
      const existing = prev[key];

      return {
        ...prev,
        [key]: {
          ...item,
          id: key,
          cantidad: (existing?.cantidad || 0) + 1,
        },
      };
    });

    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setCarrito((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const updateQty = (id: string, qty: number) => {
    setCarrito((prev) => {
      const item = prev[id];
      if (!item) return prev;

      if (qty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }

      return {
        ...prev,
        [id]: {
          ...item,
          cantidad: qty,
        },
      };
    });
  };

  const clearCart = () => {
    setCarrito({});
  };

  /* =========================
     DERIVED STATE
  ========================= */

  const items = useMemo(() => Object.values(carrito), [carrito]);

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.cantidad, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + item.cantidad * item.precio,
        0
      ),
    [items]
  );

  /* ========================= */

  return (
    <CartContext.Provider
      value={{
        carrito,

        addItem,
        removeItem,
        updateQty,
        clearCart,

        isOpen,
        setIsOpen,

        isLoaded,

        items,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ========================= */

export const useCart = () => {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return ctx;
};