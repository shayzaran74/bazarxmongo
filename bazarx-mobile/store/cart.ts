import { create } from 'zustand';

export interface CartItem {
  id: string;
  title: string;
  price: number; // For calculation purposes, storing as number
  priceFormatted: string;
  quantity: number;
  vendor: string;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addToCart: (newItem) => {
    set((state) => {
      const existingItem = state.items.find(item => item.id === newItem.id);
      if (existingItem) {
        return {
          items: state.items.map(item => 
            item.id === newItem.id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return { items: [...state.items, { ...newItem, quantity: 1 }] };
    });
  },
  
  removeFromCart: (id) => {
    set((state) => ({
      items: state.items.filter(item => item.id !== id)
    }));
  },
  
  updateQuantity: (id, delta) => {
    set((state) => ({
      items: state.items.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    }));
  },
  
  clearCart: () => set({ items: [] }),
  
  getTotal: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));
