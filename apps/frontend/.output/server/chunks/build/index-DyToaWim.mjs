import { _ as __nuxt_component_0 } from './nuxt-link-DMH8QtB-.mjs';
import __nuxt_component_1 from './Icon-D7oPKiLh.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { u as useI18n } from './server.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const stats = [
      { label: t("hero.statActiveMembers"), value: "1.2K+" },
      { label: t("hero.statTradeOpportunity"), value: "450+" },
      { label: t("hero.statSafeBarter"), value: "%100" },
      { label: t("hero.statSmartMatching"), value: "AI Ready" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_Icon = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full py-8" }, _attrs))}><div class="relative rounded-[3rem] overflow-hidden bg-dark-950 p-12 lg:p-20 shadow-2xl mb-12 group transition-all duration-700 hover:shadow-primary-500/10"><div class="absolute inset-0 bg-mesh opacity-20"></div><div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-600/20 to-transparent pointer-events-none"></div><div class="relative z-10 max-w-2xl"><span class="inline-block px-4 py-1.5 rounded-full bg-primary-600 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6 animate-pulse">${ssrInterpolate(_ctx.$t("hero.badge"))}</span><h1 class="text-5xl lg:text-7xl font-display font-black text-white italic leading-tight mb-8">${ssrInterpolate(_ctx.$t("hero.titlePart1"))} <br><span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">${ssrInterpolate(_ctx.$t("hero.titlePart2"))}</span></h1><p class="text-gray-400 text-lg sm:text-xl font-medium leading-relaxed mb-10 max-w-xl">${ssrInterpolate(_ctx.$t("hero.description"))}</p><div class="flex flex-wrap gap-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/products",
        class: "h-16 px-10 bg-white text-dark-950 rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-xs hover:bg-primary-500 hover:text-white transition-all duration-300 shadow-xl active:scale-95"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("hero.ctaStart"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("hero.ctaStart")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/barter",
        class: "h-16 px-10 border-2 border-white/10 text-white rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all duration-300 active:scale-95"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("hero.ctaPool"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("hero.ctaPool")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="absolute right-20 bottom-20 hidden lg:block animate-float"><div class="w-40 h-40 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 flex items-center justify-center rotate-12">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:shopping-cart",
        class: "w-20 h-20 text-white opacity-20"
      }, null, _parent));
      _push(`</div></div></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"><!--[-->`);
      ssrRenderList(stats, (stat, index) => {
        _push(`<div class="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"><div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">${ssrInterpolate(stat.label)}</div><div class="text-3xl font-display font-black text-dark-950 italic">${ssrInterpolate(stat.value)}</div></div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DyToaWim.mjs.map
