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
  availableTiers: PricingTier[];
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
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
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId
          );
          if (existingIndex > -1) {
            // Update selected duration and price if already exists
            const updated = [...state.items];
            updated[existingIndex] = newItem;
            return { items: updated };
          }
          return { items: [...state.items, newItem] };
        });
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
        return get().items.reduce((sum, item) => sum + item.selectedPrice, 0);
      },
      getTotalItems: () => {
        return get().items.length;
      },
    }),
    {
      name: "rimbagear_cart_storage",
    }
  )
);
