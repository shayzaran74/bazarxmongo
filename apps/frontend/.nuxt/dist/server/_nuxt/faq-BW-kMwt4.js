import __nuxt_component_1 from "./Icon-3rf78mig.js";
import { _ as __nuxt_component_0 } from "./nuxt-link-D4Fap6vy.js";
import { defineComponent, mergeProps, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import "@iconify/vue/dist/offline";
import "@iconify/vue";
import "./index-DzDKqNn2.js";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "../server.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/unctx@2.5.0/node_modules/unctx/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/h3@1.15.11/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/defu@6.1.7/node_modules/defu/dist/defu.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/cookie-es@2.0.1/node_modules/cookie-es/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs";
import "@vue/devtools-api";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "faq",
  __ssrInlineRender: true,
  setup(__props) {
    const categories = ["Genel", "Güvenlik", "Ödemeler", "Takas Süreci"];
    const faqs = [
      {
        q: "BazarX tam olarak nasıl çalışır?",
        a: "BazarX, işletmelerin ve bireylerin atıl kapasitelerini veya ürünlerini, nakit kullanmadan takas etmelerini sağlayan gelişmiş bir platformdur. Platformumuzda hem doğrudan ürün-ürün takası hem de BazarX Puanı ile çoklu takas yapılabilir."
      },
      { q: "Escrow (Güvenli Ödeme) sistemi nedir?", a: "Gelişmiş güvenlik altyapımız ile tüm işlemler kontrol altındadır." },
      { q: "Üyelik ücretleri nelerdir?", a: "Standart üyelik ücretsizdir, profesyonel satıcılar için Premium paketlerimiz mevcuttur." },
      { q: "Ürün iade süreci nasıl işler?", a: "İade politikamız tamamen kurumsal standartlara uygun olarak düzenlenmiştir." }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-4xl mx-auto py-12 px-4 space-y-16" }, _attrs))}><div class="text-center space-y-4"><h1 class="text-6xl font-display font-black text-dark-950 italic tracking-tighter leading-none">Yardım &amp; SSS</h1><p class="text-xl text-gray-500 font-medium max-w-2xl mx-auto"> BazarX hakkında en çok sorulan soruların cevaplarını burada bulabilirsiniz. </p></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4"><!--[-->`);
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
      _push(`<!--]--></div><div class="bg-dark-950 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl"><div class="absolute inset-0 bg-mesh opacity-10"></div><div class="relative z-10 space-y-6"><h2 class="text-3xl font-display font-black text-white italic tracking-tighter">Hala Cevap Bulamadınız mı?</h2><p class="text-gray-400 font-medium max-w-sm mx-auto">Destek ekibimiz 7/24 yanınızda. Bize dilediğiniz zaman ulaşabilirsiniz.</p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/contact",
        class: "inline-block px-10 py-5 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Destek Talebi Oluştur `);
          } else {
            return [
              createTextVNode(" Destek Talebi Oluştur ")
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
export {
  _sfc_main as default
};
//# sourceMappingURL=faq-BW-kMwt4.js.map
