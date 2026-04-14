import { _ as __nuxt_component_0 } from "./nuxt-link-D4Fap6vy.js";
import { defineComponent, mergeProps, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderSlot, ssrRenderComponent } from "vue/server-renderer";
import { u as useAuth } from "./useAuth-BT-0uMoj.js";
import { _ as _export_sfc } from "../server.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/defu@6.1.7/node_modules/defu/dist/defu.mjs";
import "./auth-7qcbGVv_.js";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/unctx@2.5.0/node_modules/unctx/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/h3@1.15.11/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/cookie-es@2.0.1/node_modules/cookie-es/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs";
import "@vue/devtools-api";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "auth",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center bg-mesh px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans" }, _attrs))} data-v-a72da476><div class="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" data-v-a72da476><div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/20 blur-[120px] rounded-full animate-float" data-v-a72da476></div><div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-500/10 blur-[120px] rounded-full animate-float" style="${ssrRenderStyle({ "animation-delay": "-3s" })}" data-v-a72da476></div></div><div class="max-w-md w-full space-y-8 relative z-10 transition-all duration-500 animate-slide-up" data-v-a72da476><div class="text-center" data-v-a72da476><div class="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-soft mb-6 hover:scale-105 transition-transform duration-300" data-v-a72da476><span class="text-3xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 italic" data-v-a72da476> BAZARX </span></div><h2 class="text-3xl font-display font-black tracking-tight text-dark-900 group whitespace-nowrap" data-v-a72da476> Ticari Takas Platformu </h2><p class="mt-2 text-sm font-medium text-gray-500" data-v-a72da476> Geleceğin ticaretine hoş geldiniz. </p></div><div class="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] transition-shadow duration-500" data-v-a72da476>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div><footer class="text-center space-y-4" data-v-a72da476><div class="flex items-center justify-center space-x-6 text-xs font-bold text-gray-400 uppercase tracking-widest" data-v-a72da476>`);
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
        to: "/legal/terms",
        class: "hover:text-primary-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Şartlar`);
          } else {
            return [
              createTextVNode("Şartlar")
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
      _push(`</div><p class="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]" data-v-a72da476> © 2024 BAZARX. ALL RIGHTS RESERVED. </p></footer></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/auth.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const auth = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a72da476"]]);
export {
  auth as default
};
//# sourceMappingURL=auth-dClVTFqy.js.map
