import __nuxt_component_1 from './Icon-D5PWnCnx.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "kvkk",
  __ssrInlineRender: true,
  setup(__props) {
    const dataCategories = [
      { title: "Kimlik Bilgileri", items: "Ad, Soyad, T.C. Kimlik No (Do\u011Frulama ama\xE7l\u0131)" },
      { title: "\u0130leti\u015Fim Bilgileri", items: "E-posta adresi, Telefon numaras\u0131, Teslimat adresi" },
      { title: "\u0130\u015Flem Bilgileri", items: "Sipari\u015F ge\xE7mi\u015Fi, Takas teklifleri, \xD6deme kay\u0131tlar\u0131" },
      { title: "Teknik Veriler", items: "IP adresi, Cihaz bilgileri, \xC7erez kay\u0131tlar\u0131" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-4xl mx-auto py-12 px-4 space-y-12" }, _attrs))}><div class="space-y-4"><div class="inline-block px-4 py-2 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest"> Hukuki Metinler </div><h1 class="text-6xl font-display font-black text-dark-950 italic tracking-tighter leading-none">KVKK Ayd\u0131nlatma Metni</h1><p class="text-gray-400 font-bold uppercase tracking-widest text-[11px]">Son G\xFCncelleme: 14 Nisan 2026</p></div><div class="bg-white rounded-[3rem] p-8 lg:p-20 border border-gray-100 shadow-sm relative overflow-hidden"><div class="prose prose-gray max-w-none"><h2 class="text-2xl font-display font-black text-dark-950 italic tracking-tighter mb-8 underline decoration-primary-500/30 underline-offset-8">1. Veri Sorumlusu</h2><p class="text-gray-500 font-medium leading-loose mb-12"> BazarX (bu metinde &quot;Platform&quot; olarak an\u0131lacakt\u0131r) b\xFCnyesinde i\u015Flenen verileriniz, 6698 say\u0131l\u0131 Ki\u015Fisel Verilerin Korunmas\u0131 Kanunu (&quot;Kanun&quot;) kapsam\u0131nda g\xFCvenle saklanmaktad\u0131r. Bu ayd\u0131nlatma metni, verilerinizin hangi ama\xE7larla i\u015Flendi\u011Fini ve haklar\u0131n\u0131z\u0131 a\xE7\u0131klamaktad\u0131r. </p><h2 class="text-2xl font-display font-black text-dark-950 italic tracking-tighter mb-8 underline decoration-primary-500/30 underline-offset-8">2. \u0130\u015Flenen Verileriniz</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"><!--[-->`);
      ssrRenderList(dataCategories, (cat) => {
        _push(`<div class="p-6 bg-gray-50 rounded-2xl border border-gray-100"><h3 class="text-xs font-black text-dark-950 uppercase tracking-widest mb-3">${ssrInterpolate(cat.title)}</h3><p class="text-sm text-gray-400 font-medium">${ssrInterpolate(cat.items)}</p></div>`);
      });
      _push(`<!--]--></div><h2 class="text-2xl font-display font-black text-dark-950 italic tracking-tighter mb-8 underline decoration-primary-500/30 underline-offset-8">3. \u0130\u015Fleme Ama\xE7lar\u0131</h2><ul class="list-none space-y-4 text-gray-500 font-medium mb-12"><!--[-->`);
      ssrRenderList(4, (i) => {
        _push(`<li class="flex items-start gap-4"><div class="w-6 h-6 bg-primary-50 rounded-lg flex items-center justify-center shrink-0 mt-1">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:check",
          class: "w-4 h-4 text-primary-600"
        }, null, _parent));
        _push(`</div><span>Hizmet kalitesinin art\u0131r\u0131lmas\u0131 ve kullan\u0131c\u0131 deneyiminin ki\u015Fiselle\u015Ftirilmesi amac\u0131yla veri analizi yap\u0131lmas\u0131.</span></li>`);
      });
      _push(`<!--]--></ul><div class="bg-primary-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:shield-check",
        class: "absolute -right-4 -bottom-4 w-48 h-48 text-white/10"
      }, null, _parent));
      _push(`<h3 class="text-xl font-display font-black italic tracking-tight mb-4 relative z-10">Gizlili\u011Finiz Bizim \u0130\xE7in \xD6nemli</h3><p class="text-white/80 font-medium text-sm leading-relaxed relative z-10"> Verileriniz \xFC\xE7\xFCnc\xFC taraflarla ticaret amac\u0131yla asla payla\u015F\u0131lmaz. Ki\u015Fisel verilerinizin korunmas\u0131 i\xE7in u\xE7tan uca \u015Fifreleme ve bankac\u0131l\u0131k seviyesinde g\xFCvenlik altyap\u0131s\u0131 kullan\u0131yoruz. </p></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/legal/kvkk.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=kvkk-Do6mw6uI.mjs.map
