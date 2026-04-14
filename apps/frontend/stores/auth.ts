// apps/frontend/stores/auth.ts

import { defineStore } from 'pinia';
import type { RegisterUserInput, LoginUserInput } from '@barterborsa/shared-types';

interface UserState {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface LoginResponse {
  user: UserState;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: UserState | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Kimlik doğrulama işlemlerini merkezi olarak yöneten Store.
 */
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    // SSR uyumlu cookie okuma
    const userCookie = useCookie<UserState | null>('user');
    const hasToken = !!useCookie('access_token').value;

    return {
      user: userCookie.value || null,
      isAuthenticated: hasToken,
      loading: false,
      error: null,
    };
  },

  actions: {
    /** 
     * Kullanıcı girişi (E-posta + Şifre) 
     */
    async login(input: LoginUserInput) {
      this.loading = true;
      this.error = null;
      const { $api } = useApi();
      
      const accessToken = useCookie('access_token', { maxAge: 60 * 15 }); // 15 dakika
      const refreshToken = useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 7 }); // 7 gün
      const userCookie = useCookie<UserState | null>('user', { maxAge: 60 * 60 * 24 * 7 });

      try {
        const response = await $api<LoginResponse>('auth/login', {
          method: 'POST',
          body: input,
        });

        if (response.success) {
          const { user, accessToken: access, refreshToken: refresh } = response.data;
          
          // State güncelleme
          this.user = user;
          this.isAuthenticated = true;
          
          // Cookie set etme
          accessToken.value = access;
          refreshToken.value = refresh;
          userCookie.value = user;

          return true;
        }
        return false;
      } catch (err: unknown) {
        const error = err as { data?: { message?: string } };
        this.error = error.data?.message || 'Giriş yapılamadı.';
        return false;
      } finally {
        this.loading = false;
      }
    },

    /** 
     * Yeni kullanıcı kaydı 
     */
    async register(input: RegisterUserInput) {
      this.loading = true;
      this.error = null;
      const { $api } = useApi();

      try {
        const response = await $api<{ id: string }>('auth/register', {
          method: 'POST',
          body: input,
        });
        
        if (response.success) {
          // Kayıt sonrası otomatik login yaptırılabilir veya login sayfasına yönlendirilebilir.
          return true;
        }
        return false;
      } catch (err: unknown) {
        const error = err as { data?: { message?: string } };
        this.error = error.data?.message || 'Kayıt başarısız.';
        return false;
      } finally {
        this.loading = false;
      }
    },

    /** 
     * Çıkış işlemi ve temizlik 
     */
    logout() {
      this.user = null;
      this.isAuthenticated = false;
      
      // Çerezleri temizle
      useCookie('access_token').value = null;
      useCookie('refresh_token').value = null;
      useCookie('user').value = null;

      navigateTo('/auth/login');
    }
  }
});
