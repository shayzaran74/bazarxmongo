import __nuxt_component_1 from './Icon-D5PWnCnx.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link--0y99Gne.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
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
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "premium",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full flex flex-col items-center justify-center py-20 px-6 text-center" }, _attrs))}><div class="w-24 h-24 bg-primary-50 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:sparkles",
        class: "w-12 h-12 text-primary-600"
      }, null, _parent));
      _push(`</div><h1 class="text-4xl lg:text-5xl font-display font-black text-dark-950 italic mb-6"> \xC7ok Yak\u0131nda </h1><p class="text-gray-500 text-lg max-w-md mx-auto mb-10 leading-relaxed"> Sizlere daha iyi bir deneyim sunmak i\xE7in bu sayfa \xFCzerinde \xE7al\u0131\u015Fmalar\u0131m\u0131z devam ediyor. \xC7ok yak\u0131nda buraday\u0131z! </p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "h-14 px-8 bg-dark-950 text-white rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-xs hover:bg-primary-600 transition-all duration-300"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` ANA SAYFAYA D\xD6N `);
          } else {
            return [
              createTextVNode(" ANA SAYFAYA D\xD6N ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/premium.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=premium-mmzCnHbo.mjs.map
