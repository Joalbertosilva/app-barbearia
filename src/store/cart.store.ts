import { create } from "zustand";

export type CartProduct = {
  id: number;
  name: string;
  description?: string | null;
  price_cents: number;
  stock_qty: number;
  sku?: string | null;
  image_url?: string | null;
  is_active?: boolean;
};

export type CartItem = {
  product: CartProduct;
  quantity: number;
};

type FulfillmentType = "pickup" | "delivery" | null;
type PaymentMethod = "pix" | "credit_card" | "debit_card" | "cash" | null;

type CartState = {
  items: CartItem[];
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  notes: string;

  addItem: (product: CartProduct) => void;
  removeItem: (productId: number) => void;
  increaseQty: (productId: number) => void;
  decreaseQty: (productId: number) => void;
  clearCart: () => void;

  setFulfillmentType: (type: FulfillmentType) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNotes: (notes: string) => void;

  subtotalCents: () => number;
  itemsCount: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  fulfillmentType: null,
  paymentMethod: null,
  notes: "",

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? {
                  ...i,
                  quantity: Math.min(i.quantity + 1, i.product.stock_qty),
                }
              : i
          ),
        };
      }

      return {
        items: [...state.items, { product, quantity: 1 }],
      };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),

  increaseQty: (productId) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId
          ? {
              ...i,
              quantity: Math.min(i.quantity + 1, i.product.stock_qty),
            }
          : i
      ),
    })),

  decreaseQty: (productId) =>
    set((state) => ({
      items: state.items
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0),
    })),

  clearCart: () =>
    set({
      items: [],
      fulfillmentType: null,
      paymentMethod: null,
      notes: "",
    }),

  setFulfillmentType: (type) => set({ fulfillmentType: type }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setNotes: (notes) => set({ notes }),

  subtotalCents: () =>
    get().items.reduce(
      (acc, item) => acc + item.product.price_cents * item.quantity,
      0
    ),

  itemsCount: () =>
    get().items.reduce((acc, item) => acc + item.quantity, 0),
}));