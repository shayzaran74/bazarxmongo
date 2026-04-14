import __nuxt_component_1 from './Icon-3rf78mig.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-D4Fap6vy.mjs';
import { defineComponent, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { u as useAuth } from './useAuth-BT-0uMoj.mjs';
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
import './auth-7qcbGVv_.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "profile",
  __ssrInlineRender: true,
  setup(__props) {
    var _a, _b;
    const { user, fullName, avatarUrl, userRole } = useAuth();
    const formatPrice = (price) => {
      return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(price);
    };
    const stats = [
      { label: "C\xFCzdan Bakiyesi", value: formatPrice(((_b = (_a = user.value) == null ? void 0 : _a.Wallet) == null ? void 0 : _b.balance) || 0), icon: "heroicons:wallet" },
      { label: "Aktif Teklifler", value: "0", icon: "heroicons:arrows-right-left" },
      { label: "Tamamlanan Takaslar", value: "0", icon: "heroicons:check-badge" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      var _a2, _b2, _c;
      const _component_Icon = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-4xl mx-auto space-y-8" }, _attrs))}><div class="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 shadow-sm relative overflow-hidden"><div class="absolute top-0 right-0 p-8"><div class="px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest">${ssrInterpolate(unref(userRole))} Hesab\u0131 </div></div><div class="flex flex-col md:flex-row items-center gap-8 relative z-10"><div class="w-32 h-32 bg-dark-950 rounded-[2rem] flex items-center justify-center text-4xl font-display font-black text-white shadow-2xl border-4 border-white overflow-hidden">`);
      if (unref(avatarUrl)) {
        _push(`<img${ssrRenderAttr("src", unref(avatarUrl))} class="w-full h-full object-cover">`);
      } else {
        _push(`<span>${ssrInterpolate(((_b2 = (_a2 = unref(user)) == null ? void 0 : _a2.name) == null ? void 0 : _b2.charAt(0).toUpperCase()) || "U")}</span>`);
      }
      _push(`</div><div class="text-center md:text-left space-y-2"><h1 class="text-4xl font-display font-black text-dark-950 italic tracking-tighter">${ssrInterpolate(unref(fullName) || "Kullan\u0131c\u0131")}</h1><p class="text-gray-400 font-medium">${ssrInterpolate((_c = unref(user)) == null ? void 0 : _c.email)}</p><div class="flex items-center justify-center md:justify-start gap-4 pt-4"><button class="px-6 py-3 bg-dark-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg active:scale-95"> Profili D\xFCzenle </button><button class="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"> \xC7\u0131k\u0131\u015F Yap </button></div></div></div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-6"><!--[-->`);
      ssrRenderList(stats, (stat) => {
        _push(`<div class="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm group hover:shadow-xl transition-all"><div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: stat.icon,
          class: "w-6 h-6"
        }, null, _parent));
        _push(`</div><p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">${ssrInterpolate(stat.label)}</p><p class="text-2xl font-display font-black text-dark-950 italic">${ssrInterpolate(stat.value)}</p></div>`);
      });
      _push(`<!--]--></div><div class="bg-gray-50 rounded-[3rem] p-12 lg:p-20 text-center border-2 border-dashed border-gray-200"><div class="max-w-sm mx-auto space-y-6">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:rectangle-stack",
        class: "w-16 h-16 text-gray-300 mx-auto"
      }, null, _parent));
      _push(`<h2 class="text-2xl font-display font-black text-dark-950 italic tracking-tighter">Hen\xFCz Bir Aktivite Yok</h2><p class="text-gray-400 text-sm font-medium">Yapt\u0131\u011F\u0131n\u0131z i\u015Flemler, teklifler ve favorileriniz burada g\xF6r\xFCnecek.</p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/products",
        class: "inline-block px-8 py-4 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Al\u0131\u015Fveri\u015Fe Ba\u015Fla `);
          } else {
            return [
              createTextVNode(" Al\u0131\u015Fveri\u015Fe Ba\u015Fla ")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/profile.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=profile-CipWm9pc.mjs.map
