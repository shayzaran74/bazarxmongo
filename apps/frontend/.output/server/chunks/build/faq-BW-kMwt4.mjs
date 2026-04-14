import __nuxt_component_1 from './Icon-3rf78mig.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-D4Fap6vy.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import '@iconify/vue/dist/offline';
import '@iconify/vue';
import './index-DzDKqNn2.mjs';
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
  __name: "faq",
  __ssrInlineRender: true,
  setup(__props) {
    const categories = ["Genel", "G\xFCvenlik", "\xD6demeler", "Takas S\xFCreci"];
    const faqs = [
      {
        q: "BazarX tam olarak nas\u0131l \xE7al\u0131\u015F\u0131r?",
        a: "BazarX, i\u015Fletmelerin ve bireylerin at\u0131l kapasitelerini veya \xFCr\xFCnlerini, nakit kullanmadan takas etmelerini sa\u011Flayan geli\u015Fmi\u015F bir platformdur. Platformumuzda hem do\u011Frudan \xFCr\xFCn-\xFCr\xFCn takas\u0131 hem de BazarX Puan\u0131 ile \xE7oklu takas yap\u0131labilir."
      },
      { q: "Escrow (G\xFCvenli \xD6deme) sistemi nedir?", a: "Geli\u015Fmi\u015F g\xFCvenlik altyap\u0131m\u0131z ile t\xFCm i\u015Flemler kontrol alt\u0131ndad\u0131r." },
      { q: "\xDCyelik \xFCcretleri nelerdir?", a: "Standart \xFCyelik \xFCcretsizdir, profesyonel sat\u0131c\u0131lar i\xE7in Premium paketlerimiz mevcuttur." },
      { q: "\xDCr\xFCn iade s\xFCreci nas\u0131l i\u015Fler?", a: "\u0130ade politikam\u0131z tamamen kurumsal standartlara uygun olarak d\xFCzenlenmi\u015Ftir." }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-4xl mx-auto py-12 px-4 space-y-16" }, _attrs))}><div class="text-center space-y-4"><h1 class="text-6xl font-display font-black text-dark-950 italic tracking-tighter leading-none">Yard\u0131m &amp; SSS</h1><p class="text-xl text-gray-500 font-medium max-w-2xl mx-auto"> BazarX hakk\u0131nda en \xE7ok sorulan sorular\u0131n cevaplar\u0131n\u0131 burada bulabilirsiniz. </p></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4"><!--[-->`);
      ssrRenderList(categories, (cat) => {
        _push(`<button class="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm">${ssrInterpolate(cat)}</button>`);
      });
      _push(`<!--]--></div><div class="space-y-4"><!--[-->`);
      ssrRenderList(faqs, (item, index) => {
        _push(`<div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"><button class="w-full px-8 py-6 text-left flex items-center justify-between group"><span class="text-lg font-display font-black text-dark-950 italic tracking-tight">${ssrInterpolate(item.q)}</span><div class="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:chevron-down",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</div></button>`);
        if (index === 0) {
          _push(`<div class="px-8 pb-8 text-gray-400 font-medium text-sm leading-relaxed">${ssrInterpolate(item.a)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div><div class="bg-dark-950 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl"><div class="absolute inset-0 bg-mesh opacity-10"></div><div class="relative z-10 space-y-6"><h2 class="text-3xl font-display font-black text-white italic tracking-tighter">Hala Cevap Bulamad\u0131n\u0131z m\u0131?</h2><p class="text-gray-400 font-medium max-w-sm mx-auto">Destek ekibimiz 7/24 yan\u0131n\u0131zda. Bize diledi\u011Finiz zaman ula\u015Fabilirsiniz.</p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/contact",
        class: "inline-block px-10 py-5 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Destek Talebi Olu\u015Ftur `);
          } else {
            return [
              createTextVNode(" Destek Talebi Olu\u015Ftur ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/faq.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=faq-BW-kMwt4.mjs.map
