import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PricingTier {
  days: number;
  price: number;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  selectedDays: number;
  selectedPrice: number;
  quantity: number;
  availableTiers: PricingTier[];
}

export type AddCartItemInput = Omit<CartItem, "quantity"> & { quantity?: number };

interface CartStore {
  items: CartItem[];
  addItem: (item: AddCartItemInput) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  updateItemDuration: (productId: string, days: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const addQty = Math.max(1, newItem.quantity ?? 1);
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId
          );
          if (existingIndex > -1) {
            const updated = [...state.items];
            const existing = updated[existingIndex];
            updated[existingIndex] = {
              ...existing,
              ...newItem,
              quantity: (existing.quantity || 1) + addQty,
              selectedDays: newItem.selectedDays,
              selectedPrice: newItem.selectedPrice,
            };
            return { items: updated };
          }
          return { items: [...state.items, { ...newItem, quantity: addQty }] };
        });
      },
      updateItemQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },
      updateItemDuration: (productId, days) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId === productId) {
              const matchedTier = item.availableTiers.find((t) => t.days === days);
              if (matchedTier) {
                return {
                  ...item,
                  selectedDays: matchedTier.days,
                  selectedPrice: matchedTier.price,
                };
              }
            }
            return item;
          }),
        }));
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.selectedPrice * (item.quantity || 1),
          0
        );
      },
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      },
    }),
    {
      name: "rimbagear_cart_storage",
    }
  )
);
