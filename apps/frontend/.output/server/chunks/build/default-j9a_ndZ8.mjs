import { _ as __nuxt_component_0 } from './nuxt-link-DMH8QtB-.mjs';
import __nuxt_component_1 from './Icon-D7oPKiLh.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { u as useAuth } from './useAuth-DagvERMQ.mjs';
import { _ as _export_sfc } from './server.mjs';
import '@iconify/vue/dist/offline';
import '@iconify/vue';
import './index-DOKAIoyc.mjs';
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
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const { isLoggedIn, user } = useAuth();
    const formatPrice = (price) => {
      return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(price);
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_Icon = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-mesh pb-20 lg:pb-0 relative font-sans selection:bg-primary-500 selection:text-white" }, _attrs))} data-v-c542dfee><div class="sticky top-0 z-[500] transition-all duration-500 w-full" data-v-c542dfee><div class="bg-dark-950 text-gray-400 py-1.5 hidden lg:block border-b border-white/5" data-v-c542dfee><div class="max-w-8xl mx-auto px-6 flex justify-between items-center text-[10px] font-black tracking-widest uppercase italic" data-v-c542dfee><div class="flex items-center space-x-1 bg-black/50 p-0.5 rounded-full border border-white/5" data-v-c542dfee><button class="px-5 py-1.5 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-soft" data-v-c542dfee> \u{1F6D2} BAZARX </button><button class="px-5 py-1.5 rounded-full hover:text-white transition-colors" data-v-c542dfee> \u{1F3ED} Ticari Takas </button><button class="px-5 py-1.5 rounded-full hover:text-white transition-colors" data-v-c542dfee> \u{1F4BC} Barter Borsa </button></div><div class="flex items-center space-x-6" data-v-c542dfee>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/premium",
        class: "text-accent-500 hover:text-accent-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`PREMIUM 2026`);
          } else {
            return [
              createTextVNode("PREMIUM 2026")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="w-px h-3 bg-white/10" data-v-c542dfee></div><div class="flex items-center space-x-4" data-v-c542dfee><span data-v-c542dfee>TR</span>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:chevron-down",
        class: "w-3 h-3"
      }, null, _parent));
      _push(`</div></div></div></div><header class="w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300" data-v-c542dfee><div class="max-w-8xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between gap-8" data-v-c542dfee>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex items-center group"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="w-12 h-12 bg-dark-950 rounded-2xl flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 overflow-hidden relative" data-v-c542dfee${_scopeId}><span class="text-xl font-display font-black text-white italic" data-v-c542dfee${_scopeId}>BX</span><div class="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent" data-v-c542dfee${_scopeId}></div></div><div class="ml-4 flex flex-col justify-center" data-v-c542dfee${_scopeId}><span class="font-display font-black text-2xl tracking-tighter text-dark-950 leading-none mb-1" data-v-c542dfee${_scopeId}>BAZARX</span><span class="text-[8px] font-black text-primary-600 uppercase tracking-[0.3em] leading-none" data-v-c542dfee${_scopeId}>Pazar\u0131n Gelece\u011Fi</span></div>`);
          } else {
            return [
              createVNode("div", { class: "w-12 h-12 bg-dark-950 rounded-2xl flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 overflow-hidden relative" }, [
                createVNode("span", { class: "text-xl font-display font-black text-white italic" }, "BX"),
                createVNode("div", { class: "absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent" })
              ]),
              createVNode("div", { class: "ml-4 flex flex-col justify-center" }, [
                createVNode("span", { class: "font-display font-black text-2xl tracking-tighter text-dark-950 leading-none mb-1" }, "BAZARX"),
                createVNode("span", { class: "text-[8px] font-black text-primary-600 uppercase tracking-[0.3em] leading-none" }, "Pazar\u0131n Gelece\u011Fi")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="hidden lg:flex flex-1 max-w-xl group" data-v-c542dfee><div class="relative w-full" data-v-c542dfee><input type="text" class="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:bg-white focus:border-primary-500/50 transition-all outline-none"${ssrRenderAttr("placeholder", _ctx.$t("nav.searchPlaceholder"))} data-v-c542dfee><div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" data-v-c542dfee>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:magnifying-glass",
        class: "w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors"
      }, null, _parent));
      _push(`</div></div></div><div class="flex items-center space-x-4" data-v-c542dfee><div class="relative group" data-v-c542dfee>`);
      if (unref(isLoggedIn)) {
        _push(`<button class="flex items-center space-x-3 p-1 pr-4 bg-gray-50 border border-gray-100 rounded-full hover:bg-white hover:shadow-lg transition-all" data-v-c542dfee><div class="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center font-black text-primary-700 text-xs border border-white" data-v-c542dfee>${ssrInterpolate(((_b = (_a = unref(user)) == null ? void 0 : _a.name) == null ? void 0 : _b.charAt(0).toUpperCase()) || "U")}</div><div class="text-left hidden xl:block leading-none" data-v-c542dfee><p class="text-[11px] font-black text-dark-950" data-v-c542dfee>${ssrInterpolate(((_c = unref(user)) == null ? void 0 : _c.name) || "Kullan\u0131c\u0131")}</p><p class="text-[9px] font-bold text-gray-400 tracking-tighter" data-v-c542dfee>${ssrInterpolate(formatPrice(((_e = (_d = unref(user)) == null ? void 0 : _d.Wallet) == null ? void 0 : _e.balance) || 0))}</p></div></button>`);
      } else {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/auth/login",
          class: "flex items-center space-x-2 px-6 py-3 bg-dark-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Icon, {
                name: "heroicons:user",
                class: "w-4 h-4"
              }, null, _parent2, _scopeId));
              _push2(`<span data-v-c542dfee${_scopeId}>${ssrInterpolate(_ctx.$t("common.login"))}</span>`);
            } else {
              return [
                createVNode(_component_Icon, {
                  name: "heroicons:user",
                  class: "w-4 h-4"
                }),
                createVNode("span", null, toDisplayString(_ctx.$t("common.login")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      if (unref(isLoggedIn)) {
        _push(`<div class="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl p-2 border border-gray-50 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300" data-v-c542dfee>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/profile",
          class: "flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Icon, {
                name: "heroicons:user-circle",
                class: "w-5 h-5 text-gray-400"
              }, null, _parent2, _scopeId));
              _push2(`<span class="text-xs font-black text-gray-600 tracking-tight" data-v-c542dfee${_scopeId}>Profilim</span>`);
            } else {
              return [
                createVNode(_component_Icon, {
                  name: "heroicons:user-circle",
                  class: "w-5 h-5 text-gray-400"
                }),
                createVNode("span", { class: "text-xs font-black text-gray-600 tracking-tight" }, "Profilim")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<button class="flex items-center space-x-3 p-3 w-full hover:bg-red-50 text-red-600 rounded-2xl transition-colors" data-v-c542dfee>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:arrow-left-on-rectangle",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`<span class="text-xs font-black tracking-tight" data-v-c542dfee>G\xFCvenli \xC7\u0131k\u0131\u015F</span></button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/cart",
        class: "relative w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-primary-700 hover:-translate-y-1 transition-all duration-300"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Icon, {
              name: "heroicons:shopping-cart",
              class: "w-6 h-6"
            }, null, _parent2, _scopeId));
            _push2(`<span class="absolute -top-1.5 -right-1.5 w-6 h-6 bg-accent-500 text-dark-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-md" data-v-c542dfee${_scopeId}>0</span>`);
          } else {
            return [
              createVNode(_component_Icon, {
                name: "heroicons:shopping-cart",
                class: "w-6 h-6"
              }),
              createVNode("span", { class: "absolute -top-1.5 -right-1.5 w-6 h-6 bg-accent-500 text-dark-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-md" }, "0")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></header></div><main class="max-w-8xl mx-auto px-4 lg:px-8 py-10 relative z-10" data-v-c542dfee>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><footer class="max-w-8xl mx-auto px-8 py-20 border-t border-gray-100 bg-white/20 backdrop-blur" data-v-c542dfee><div class="flex flex-col lg:flex-row justify-between items-center gap-10" data-v-c542dfee><div class="flex flex-col items-center lg:items-start text-center lg:text-left" data-v-c542dfee><span class="text-3xl font-display font-black text-dark-950 italic mb-2 tracking-tighter" data-v-c542dfee>BAZARX</span><p class="text-xs font-medium text-gray-400 max-w-xs" data-v-c542dfee>${ssrInterpolate(_ctx.$t("ecosystem.bazarxSubtitle"))}</p></div><div class="flex gap-8 text-[11px] font-black text-gray-400 uppercase tracking-widest" data-v-c542dfee>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/legal/terms",
        class: "hover:text-primary-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u015Eartlar`);
          } else {
            return [
              createTextVNode("\u015Eartlar")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/legal/privacy",
        class: "hover:text-primary-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Gizlilik`);
          } else {
            return [
              createTextVNode("Gizlilik")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/help",
        class: "hover:text-primary-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Destek`);
          } else {
            return [
              createTextVNode("Destek")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c542dfee"]]);

export { _default as default };
//# sourceMappingURL=default-j9a_ndZ8.mjs.map
