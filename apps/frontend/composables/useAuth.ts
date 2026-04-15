// apps/frontend/composables/useAuth.ts

import { storeToRefs } from 'pinia';

/**
 * UI bileşenlerinde auth durumunu ve işlemlerini kolayca kullanmak için composable.
 */
export const useAuth = () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  const { user, isAuthenticated, loading, error } = storeToRefs(authStore);

  const isLoggedIn = computed(() => isAuthenticated.value && !!user.value);
  const userRole = computed(() => user.value?.role || 'GUEST');
  
  const isAdmin = computed(() => user.value?.role === 'ADMIN' || user.value?.role === 'SUPER_ADMIN');
  const isVendor = computed(() => user.value?.role === 'VENDOR');

  const fullName = computed(() => {
    if (!user.value) return '';
    return `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim();
  });

  const avatarUrl = computed(() => {
    // Backend'den gelen avatar yolunu çöz
    const avatar = user.value?.avatar;
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    
    const apiBase = config.public.apiBase;
    if (!apiBase) return avatar;
    return `${apiBase}/uploads/avatars/${avatar}`;
  });

  return {
    user,
    isAuthenticated,
    isLoggedIn,
    userRole,
    isAdmin,
    isVendor,
    fullName,
    avatarUrl,
    loading,
    error,
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout
  };
};
