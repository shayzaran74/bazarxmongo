import { s as storeToRefs, e as defineStore, n as navigateTo, d as useRuntimeConfig } from './server.mjs';
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
      const { $api } = useApi();
      try {
        const response = await $api("auth/register", {
          method: "POST",
          body: input
        });
        if (response.success) {
          this.user = response.data;
          this.isAuthenticated = true;
        }
      } catch (err) {
        this.error = ((_a = err.data) == null ? void 0 : _a.message) || "Kay\u0131t s\u0131ras\u0131nda hata olu\u015Ftu.";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    /** Kullanıcı girişi */
    async login(input) {
      var _a;
      this.loading = true;
      const { $api } = useApi();
      try {
        const response = await $api("auth/login", {
          method: "POST",
          body: input
        });
        if (response.success) {
          this.user = response.data;
          this.isAuthenticated = true;
        }
      } catch (err) {
        this.error = ((_a = err.data) == null ? void 0 : _a.message) || "Giri\u015F s\u0131ras\u0131nda hata olu\u015Ftu.";
        throw err;
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
  const { user, isAuthenticated, loading, error } = storeToRefs(authStore);
  const isLoggedIn = computed(() => isAuthenticated.value && !!user.value);
  const userRole = computed(() => {
    var _a;
    return ((_a = user.value) == null ? void 0 : _a.role) || "GUEST";
  });
  return {
    user,
    isAuthenticated,
    isLoggedIn,
    userRole,
    loading,
    error,
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout
  };
};

export { useAuth as u };
//# sourceMappingURL=useAuth-DagvERMQ.mjs.map
