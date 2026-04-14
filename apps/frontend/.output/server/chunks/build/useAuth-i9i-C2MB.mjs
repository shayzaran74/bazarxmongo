import { s as storeToRefs, k as defineStore, u as useRuntimeConfig, n as navigateTo } from './server.mjs';
import { computed } from 'vue';

const useApi = () => {
  const config = useRuntimeConfig();
  const $api = async (path, options = {}) => {
    try {
      const normalizedPath = path.startsWith("/") ? path.substring(1) : path;
      const response = await $fetch(normalizedPath, {
        baseURL: config.public.apiBase || "http://localhost:3001/api/v1",
        ...options
      });
      return response;
    } catch (error) {
      console.error(`[API Error] ${path}:`, error.data || error.message);
      throw error;
    }
  };
  return { $api };
};
const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),
  actions: {
    /** Kullanıcı kaydı */
    async register(input) {
      var _a;
      this.loading = true;
      this.error = null;
      const { $api } = useApi();
      try {
        const response = await $api("auth/register", {
          method: "POST",
          body: input
        });
        if (response.success) {
          this.user = response.data;
          this.isAuthenticated = true;
          return true;
        }
        return false;
      } catch (err) {
        this.error = ((_a = err.data) == null ? void 0 : _a.message) || "Kay\u0131t s\u0131ras\u0131nda hata olu\u015Ftu.";
        return false;
      } finally {
        this.loading = false;
      }
    },
    /** Kullanıcı girişi */
    async login(input) {
      var _a;
      this.loading = true;
      this.error = null;
      const { $api } = useApi();
      try {
        const response = await $api("auth/login", {
          method: "POST",
          body: input
        });
        if (response.success) {
          this.user = response.data;
          this.isAuthenticated = true;
          return true;
        }
        return false;
      } catch (err) {
        this.error = ((_a = err.data) == null ? void 0 : _a.message) || "Giri\u015F s\u0131ras\u0131nda hata olu\u015Ftu.";
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
      navigateTo("/auth/login");
    }
  }
});
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

export { useAuthStore as a, useAuth as u };
//# sourceMappingURL=useAuth-i9i-C2MB.mjs.map
