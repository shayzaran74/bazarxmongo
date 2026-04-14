import { _ as __nuxt_component_0 } from './nuxt-link--0y99Gne.mjs';
import __nuxt_component_1 from './Icon-D5PWnCnx.mjs';
import { defineComponent, ref, reactive, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderComponent, ssrRenderDynamicModel, ssrIncludeBooleanAttr, ssrLooseContain } from 'vue/server-renderer';
import { u as useAuth } from './useAuth-B2S6qmav.mjs';
import { b as useRouter } from './server.mjs';
import '@iconify/vue/dist/offline';
import '@iconify/vue';
import './index-ngzQdfrm.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    useRouter();
    const showPassword = ref(false);
    const loading = ref(false);
    const form = reactive({
      email: "",
      password: "",
      acceptTerms: false
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_Icon = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><form class="space-y-5"><div class="space-y-2 group"><label for="email" class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-primary-600 transition-colors">${ssrInterpolate(_ctx.$t("auth.email"))}</label><div class="relative"><input id="email"${ssrRenderAttr("value", unref(form).email)} type="email" required class="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none" placeholder="merhaba@bazarx.com"></div></div><div class="space-y-2 group"><div class="flex items-center justify-between px-1"><label for="password" class="text-[11px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-primary-600 transition-colors">${ssrInterpolate(_ctx.$t("auth.password"))}</label>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/auth/forgot-password",
        class: "text-[11px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("auth.forgotPassword"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("auth.forgotPassword")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="relative"><input id="password"${ssrRenderDynamicModel(unref(showPassword) ? "text" : "password", unref(form).password, null)}${ssrRenderAttr("type", unref(showPassword) ? "text" : "password")} required class="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none pr-12" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"><button type="button" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors">`);
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
      _push(`</button></div></div><div class="flex items-start px-1 py-1"><input id="acceptTerms"${ssrIncludeBooleanAttr(Array.isArray(unref(form).acceptTerms) ? ssrLooseContain(unref(form).acceptTerms, null) : unref(form).acceptTerms) ? " checked" : ""} type="checkbox" required class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"><label for="acceptTerms" class="ml-3 block text-[11px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed cursor-pointer hover:text-gray-700 transition-colors">${ssrInterpolate(_ctx.$t("auth.acceptTerms"))}</label></div><button type="submit"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="w-full h-15 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] shadow-[0_10px_25px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(99,102,241,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3 overflow-hidden group relative">`);
      if (unref(loading)) {
        _push(`<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="relative z-10 font-display">${ssrInterpolate(unref(loading) ? _ctx.$t("auth.loggingIn") : _ctx.$t("auth.login"))}</span><div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div></button></form><div class="relative py-4"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-100"></div></div><div class="relative flex justify-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] bg-transparent"><span class="bg-white/50 backdrop-blur px-4 py-1 rounded-full border border-gray-50">${ssrInterpolate(_ctx.$t("auth.or"))}</span></div></div><button type="button" class="w-full flex items-center justify-center gap-4 bg-white/50 backdrop-blur-sm border-2 border-gray-100 h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-600 hover:bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-300"><svg class="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path></svg> ${ssrInterpolate(_ctx.$t("auth.continueWithGoogle"))}</button><div class="text-center mt-8"><p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">${ssrInterpolate(_ctx.$t("auth.noAccount"))} `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/auth/register",
        class: "text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline ml-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("auth.registerNow"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("auth.registerNow")), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/auth/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-BAwpZyaz.mjs.map
