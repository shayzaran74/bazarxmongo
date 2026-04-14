// apps/frontend/stores/cart.ts

import { defineStore } from 'pinia';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    loading: false,
  }),

  getters: {
    itemCount: (state): number => state.items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: (state): number => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
  },

  actions: {
    addItem(item: CartItem) {
      const existingItem = this.items.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        this.items.push(item);
      }
    },

    removeItem(id: string) {
      this.items = this.items.filter(item => item.id !== id);
    },

    clearCart() {
      this.items = [];
    }
  }
});
