import { m as defineStore, l as useCookie, n as navigateTo, u as useRuntimeConfig } from './server.mjs';

const useApi = () => {
  const config = useRuntimeConfig();
  const accessToken = useCookie("access_token");
  const $api = async (path, options = {}) => {
    const apiBase = config.public.apiBase || "http://localhost:3001/api";
    const headers = {
      ...options.headers || {}
    };
    if (accessToken.value) {
      headers["Authorization"] = `Bearer ${accessToken.value}`;
    }
    try {
      return await $fetch(path, {
        baseURL: apiBase,
        ...options,
        headers
      });
    } catch (err) {
      throw err;
    }
  };
  return { $api };
};
const useAuthStore = defineStore("auth", {
  state: () => {
    const userCookie = useCookie("user");
    const hasToken = !!useCookie("access_token").value;
    return {
      user: userCookie.value || null,
      isAuthenticated: hasToken,
      loading: false,
      error: null
    };
  },
  actions: {
    /** 
     * Kullanıcı girişi (E-posta + Şifre) 
     */
    async login(input) {
      var _a;
      this.loading = true;
      this.error = null;
      const { $api } = useApi();
      const accessToken = useCookie("access_token", { maxAge: 60 * 15 });
      const refreshToken = useCookie("refresh_token", { maxAge: 60 * 60 * 24 * 7 });
      const userCookie = useCookie("user", { maxAge: 60 * 60 * 24 * 7 });
      try {
        const response = await $api("auth/login", {
          method: "POST",
          body: input
        });
        if (response.success) {
          const { user, accessToken: access, refreshToken: refresh } = response.data;
          this.user = user;
          this.isAuthenticated = true;
          accessToken.value = access;
          refreshToken.value = refresh;
          userCookie.value = user;
          return true;
        }
        return false;
      } catch (err) {
        const error = err;
        this.error = ((_a = error.data) == null ? void 0 : _a.message) || "Giri\u015F yap\u0131lamad\u0131.";
        return false;
      } finally {
        this.loading = false;
      }
    },
    /** 
     * Yeni kullanıcı kaydı 
     */
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
          return true;
        }
        return false;
      } catch (err) {
        const error = err;
        this.error = ((_a = error.data) == null ? void 0 : _a.message) || "Kay\u0131t ba\u015Far\u0131s\u0131z.";
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
      useCookie("access_token").value = null;
      useCookie("refresh_token").value = null;
      useCookie("user").value = null;
      navigateTo("/auth/login");
    }
  }
});

export { useAuthStore as u };
//# sourceMappingURL=auth-7qcbGVv_.mjs.map
