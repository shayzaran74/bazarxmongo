import __nuxt_component_1 from './Icon-3rf78mig.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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
  __name: "contact",
  __ssrInlineRender: true,
  setup(__props) {
    const contactDetails = [
      { label: "E-Posta", value: "destek@bazarx.com", icon: "heroicons:envelope" },
      { label: "Telefon", value: "+90 212 555 0101", icon: "heroicons:phone" },
      { label: "Adres", value: "Maslak Plaza, \u0130stanbul", icon: "heroicons:map-pin" },
      { label: "\xC7al\u0131\u015Fma Saatleri", value: "Pzt - Cmt, 09:00 - 18:00", icon: "heroicons:clock" }
    ];
    const socialIcons = ["uil:facebook-f", "uil:instagram", "uil:linkedin-alt"];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-6xl mx-auto py-12 px-4" }, _attrs))}><div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"><div class="space-y-12"><div class="space-y-4"><h1 class="text-6xl font-display font-black text-dark-950 italic tracking-tighter leading-none">Bize Ula\u015F\u0131n</h1><p class="text-xl text-gray-500 font-medium leading-relaxed"> Sorular\u0131n\u0131z, i\u015F birli\u011Fi talepleriniz veya teknik destek i\xE7in ekibimiz size yard\u0131mc\u0131 olmaya haz\u0131r. </p></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-8"><!--[-->`);
      ssrRenderList(contactDetails, (item) => {
        _push(`<div class="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group"><div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: item.icon,
          class: "w-6 h-6 text-primary-600 group-hover:text-white transition-colors"
        }, null, _parent));
        _push(`</div><h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">${ssrInterpolate(item.label)}</h3><p class="text-lg font-display font-black text-dark-950 italic">${ssrInterpolate(item.value)}</p></div>`);
      });
      _push(`<!--]--></div><div class="pt-8"><div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Sosyal Medya</div><div class="flex gap-4"><!--[-->`);
      ssrRenderList(3, (i) => {
        _push(`<a href="#" class="w-14 h-14 bg-dark-950 rounded-2xl flex items-center justify-center text-white hover:bg-primary-600 hover:-translate-y-1 transition-all shadow-lg shadow-dark-950/20">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: socialIcons[i - 1],
          class: "w-6 h-6"
        }, null, _parent));
        _push(`</a>`);
      });
      _push(`<!--]--></div></div></div><div class="bg-white rounded-[3rem] p-8 lg:p-12 border border-gray-100 shadow-2xl relative overflow-hidden"><div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent pointer-events-none"></div><form class="space-y-6 relative z-10"><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="space-y-2"><label class="text-[10px] font-black text-dark-950 uppercase tracking-widest ml-1">Ad Soyad</label><input type="text" placeholder="John Doe" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:bg-white focus:border-primary-500/30 transition-all shadow-sm"></div><div class="space-y-2"><label class="text-[10px] font-black text-dark-950 uppercase tracking-widest ml-1">E-Posta</label><input type="email" placeholder="john@bazarx.com" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:bg-white focus:border-primary-500/30 transition-all shadow-sm"></div></div><div class="space-y-2"><label class="text-[10px] font-black text-dark-950 uppercase tracking-widest ml-1">Konu</label><input type="text" placeholder="Nas\u0131l yard\u0131mc\u0131 olabiliriz?" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:bg-white focus:border-primary-500/30 transition-all shadow-sm"></div><div class="space-y-2"><label class="text-[10px] font-black text-dark-950 uppercase tracking-widest ml-1">Mesaj\u0131n\u0131z</label><textarea rows="4" placeholder="Mesaj\u0131n\u0131z\u0131 buraya yaz\u0131n..." class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:bg-white focus:border-primary-500/30 transition-all shadow-sm resize-none"></textarea></div><button class="w-full py-5 bg-dark-950 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-primary-600 transition-all shadow-2xl shadow-dark-950/20 active:scale-95"> Mesaj\u0131 G\xF6nder </button></form></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/contact.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=contact-L2Rq869j.mjs.map
