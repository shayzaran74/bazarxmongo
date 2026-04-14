import __nuxt_component_1 from "./Icon-3rf78mig.js";
import { _ as __nuxt_component_0 } from "./nuxt-link-D4Fap6vy.js";
import { defineComponent, ref, reactive, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderDynamicModel, ssrIncludeBooleanAttr, ssrLooseContain } from "vue/server-renderer";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import { u as useAuth } from "./useAuth-BT-0uMoj.js";
import { u as useAuthStore } from "./auth-7qcbGVv_.js";
import { b as useRouter } from "../server.mjs";
import "@iconify/vue/dist/offline";
import "@iconify/vue";
import "./index-DzDKqNn2.js";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/defu@6.1.7/node_modules/defu/dist/defu.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/unctx@2.5.0/node_modules/unctx/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/h3@1.15.11/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/cookie-es@2.0.1/node_modules/cookie-es/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs";
import "@vue/devtools-api";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "register",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    const authStore = useAuthStore();
    useRouter();
    const showPassword = ref(false);
    const loading = ref(false);
    const form = reactive({
      email: "",
      name: "",
      password: "",
      acceptTerms: false,
      kvkkConsent: false
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      if (unref(authStore).error) {
        _push(`<div class="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-start gap-3 animate-shake">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:exclamation-circle",
          class: "w-5 h-5 text-red-500 shrink-0 mt-0.5"
        }, null, _parent));
        _push(`<div class="text-xs font-bold text-red-600 uppercase tracking-tight">${ssrInterpolate(unref(authStore).error)}</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<form class="space-y-4"><div class="space-y-2 group"><label for="name" class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-primary-600 transition-colors">${ssrInterpolate(_ctx.$t("auth.fullName"))}</label><div class="relative"><input id="name"${ssrRenderAttr("value", unref(form).name)} type="text" required class="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"${ssrRenderAttr("placeholder", _ctx.$t("auth.fullName"))}></div></div><div class="space-y-2 group"><label for="email" class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-primary-600 transition-colors">${ssrInterpolate(_ctx.$t("auth.email"))}</label><div class="relative"><input id="email"${ssrRenderAttr("value", unref(form).email)} type="email" required class="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none" placeholder="merhaba@bazarx.com"></div></div><div class="space-y-2 group"><label for="password" class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-primary-600 transition-colors">${ssrInterpolate(_ctx.$t("auth.password"))}</label><div class="relative"><input id="password"${ssrRenderDynamicModel(unref(showPassword) ? "text" : "password", unref(form).password, null)}${ssrRenderAttr("type", unref(showPassword) ? "text" : "password")} required class="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none pr-12" placeholder="••••••••"><button type="button" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors">`);
      if (unref(showPassword)) {
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:eye-slash",
          class: "w-5 h-5"
        }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:eye",
          class: "w-5 h-5"
        }, null, _parent));
      }
      _push(`</button></div></div><div class="space-y-3 pt-2"><div class="flex items-start px-1"><input id="acceptTerms"${ssrIncludeBooleanAttr(Array.isArray(unref(form).acceptTerms) ? ssrLooseContain(unref(form).acceptTerms, null) : unref(form).acceptTerms) ? " checked" : ""} type="checkbox" required class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"><label for="acceptTerms" class="ml-3 block text-[11px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed cursor-pointer">${ssrInterpolate(_ctx.$t("auth.acceptTerms"))}</label></div><div class="flex items-start px-1"><input id="kvkkConsent"${ssrIncludeBooleanAttr(Array.isArray(unref(form).kvkkConsent) ? ssrLooseContain(unref(form).kvkkConsent, null) : unref(form).kvkkConsent) ? " checked" : ""} type="checkbox" required class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"><label for="kvkkConsent" class="ml-3 block text-[11px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed cursor-pointer">${ssrInterpolate(_ctx.$t("auth.kvkkConsent"))}</label></div></div><button type="submit"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="w-full h-15 bg-primary-600 text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] shadow-xl hover:bg-primary-700 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 mt-6">`);
      if (unref(loading)) {
        _push(`<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="relative z-10 font-display">${ssrInterpolate(unref(loading) ? _ctx.$t("auth.creatingAccount") : _ctx.$t("auth.registerBtn"))}</span></button></form><div class="text-center mt-6"><p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">${ssrInterpolate(_ctx.$t("auth.alreadyHaveAccount"))} `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/auth/login",
        class: "text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline ml-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("auth.loginNow"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("auth.loginNow")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/auth/register.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=register-DBfXrnhk.js.map
