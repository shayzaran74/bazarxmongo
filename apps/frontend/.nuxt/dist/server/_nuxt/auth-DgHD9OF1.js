import { d as defineNuxtRouteMiddleware, n as navigateTo } from "../server.mjs";
import { u as useAuthStore } from "./auth-7qcbGVv_.js";
import "vue";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/unctx@2.5.0/node_modules/unctx/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/h3@1.15.11/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/defu@6.1.7/node_modules/defu/dist/defu.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/cookie-es@2.0.1/node_modules/cookie-es/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs";
import "@vue/devtools-api";
import "vue/server-renderer";
const auth = defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) {
    if (to.path !== "/auth/login" && to.path !== "/auth/register") {
      return navigateTo("/auth/login");
    }
  }
});
export {
  auth as default
};
//# sourceMappingURL=auth-DgHD9OF1.js.map
