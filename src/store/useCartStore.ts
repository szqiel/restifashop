import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      isCheckoutOpen: false,
      setIsCheckoutOpen: (isCheckoutOpen) => set({ isCheckoutOpen }),
      addItem: (item) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (i) => i.variantId === item.variantId
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += item.quantity;
          set({ items: updatedItems });
        } else {
          set({ items: [...currentItems, item] });
        }
      },
      removeItem: (variantId) => {
        set({
          items: get().items.filter((i) => i.variantId !== variantId),
        });
      },
      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "cart-storage", // local storage key
    }
  )
);
