// apps/frontend/composables/useDocumentUrl.ts

import { ref, onUnmounted } from 'vue';
import { useApi } from './useApi';
import { useAuthStore } from '~/stores/auth';

export const useDocumentUrl = () => {
  const { $api } = useApi();
  const authStore = useAuthStore();

  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const url = ref<string | null>(null);

  // Yenileme zamanlayıcısını (timer) takip etmek için
  let refreshTimer: NodeJS.Timeout | null = null;

  const clearTimer = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  };

  /**
   * Satıcı veya admin için geçici imzalı (presigned) belge URL'ini çeker.
   * TTL süresinden 5 dakika önce otomatik yenileme (refresh) planlar.
   */
  const fetchSignedUrl = async (vendorId: string, documentId: string): Promise<string> => {
    loading.value = true;
    error.value = null;

    try {
      // Kullanıcı admin ise admin endpoint'ini, normal vendor ise kendi endpoint'ini çağır
      const endpoint = authStore.isAdmin
        ? `/api/v1/admin/vendors/documents/${documentId}/url`
        : `/api/v1/vendors/me/documents/${documentId}/url`;

      const response = await $api<{ url: string }>(endpoint);

      if (response && response.success && response.data?.url) {
        const signedUrl = response.data.url;
        url.value = signedUrl;

        // Admin imzalı URL'i 15 dakikadır (900sn). Normal vendor imzalı URL'i 60 dakikadır (3600sn).
        // 5 dakika (300.000 ms) güvenlik payı düşürülerek yenileme tetiklenir.
        const ttlMinutes = authStore.isAdmin ? 15 : 60;
        const refreshDelayMs = Math.max(0, (ttlMinutes - 5) * 60 * 1000); // 10 dk veya 55 dk sonra

        clearTimer();
        refreshTimer = setTimeout(() => {
          fetchSignedUrl(vendorId, documentId).catch((err) => {
            console.error('Failed to auto-refresh signed URL', err);
          });
        }, refreshDelayMs);

        return signedUrl;
      } else {
        throw new Error('İmzalı URL response içinde bulunamadı.');
      }
    } catch (err: any) {
      const errMsg = err.data?.message || err.message || 'Belge URL\'i alınırken bir hata oluştu.';
      error.value = errMsg;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Composable unmounted olduğunda zamanlayıcıyı temizle
  onUnmounted(() => {
    clearTimer();
  });

  return {
    fetchSignedUrl,
    loading,
    error,
    url,
  };
};
