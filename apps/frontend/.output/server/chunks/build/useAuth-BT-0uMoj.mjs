import { s as storeToRefs, u as useRuntimeConfig } from './server.mjs';
import { u as useAuthStore } from './auth-7qcbGVv_.mjs';
import { computed } from 'vue';

const useAuth = () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  const { user, isAuthenticated, loading, error } = storeToRefs(authStore);
  const isLoggedIn = computed(() => isAuthenticated.value && !!user.value);
  const userRole = computed(() => {
    var _a;
    return ((_a = user.value) == null ? void 0 : _a.role) || "GUEST";
  });
  const isAdmin = computed(() => {
    var _a, _b;
    return ((_a = user.value) == null ? void 0 : _a.role) === "ADMIN" || ((_b = user.value) == null ? void 0 : _b.role) === "SUPER_ADMIN";
  });
  const isVendor = computed(() => {
    var _a;
    return ((_a = user.value) == null ? void 0 : _a.role) === "VENDOR";
  });
  const fullName = computed(() => {
    if (!user.value) return "";
    return `${user.value.firstName || ""} ${user.value.lastName || ""}`.trim();
  });
  const avatarUrl = computed(() => {
    var _a;
    const avatar = (_a = user.value) == null ? void 0 : _a.avatar;
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    const apiBase = config.public.apiBase || "http://localhost:3001";
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

export { useAuth as u };
//# sourceMappingURL=useAuth-BT-0uMoj.mjs.map
