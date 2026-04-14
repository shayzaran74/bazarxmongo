// apps/frontend/stores/auth.ts

import { defineStore } from 'pinia';
import type { RegisterUserInput, LoginUserInput } from '@barterborsa/shared-types';

interface WalletState {
  balance: number;
}

interface UserState {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  Wallet?: WalletState;
}

interface AuthState {
  user: UserState | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  actions: {
    /** Kullanıcı kaydı */
    async register(input: RegisterUserInput) {
      this.loading = true;
      this.error = null;
      const { $api } = useApi();
      try {
        const response = await $api<UserState>('auth/register', {
          method: 'POST',
          body: input,
        });
        
        if (response.success) {
          this.user = response.data;
          this.isAuthenticated = true;
          return true;
        }
        return false;
      } catch (err: any) {
        this.error = err.data?.message || 'Kayıt sırasında hata oluştu.';
        return false;
      } finally {
        this.loading = false;
      }
    },

    /** Kullanıcı girişi */
    async login(input: LoginUserInput) {
      this.loading = true;
      this.error = null;
      const { $api } = useApi();
      try {
        const response = await $api<UserState>('auth/login', {
          method: 'POST',
          body: input,
        });

        if (response.success) {
          this.user = response.data;
          this.isAuthenticated = true;
          return true;
        }
        return false;
      } catch (err: any) {
        this.error = err.data?.message || 'Giriş sırasında hata oluştu.';
        return false;
      } finally {
        this.loading = false;
      }
    },

    /** Çıkış işlemi */
    logout() {
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;
      navigateTo('/auth/login');
    }
  }
});
