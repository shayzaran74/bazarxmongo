import __nuxt_component_1 from "./Icon-3rf78mig.js";
import { defineComponent, mergeProps, useSSRContext } from "vue";
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
  __name: "kvkk",
  __ssrInlineRender: true,
  setup(__props) {
    const dataCategories = [
      { title: "Kimlik Bilgileri", items: "Ad, Soyad, T.C. Kimlik No (Doğrulama amaçlı)" },
      { title: "İletişim Bilgileri", items: "E-posta adresi, Telefon numarası, Teslimat adresi" },
      { title: "İşlem Bilgileri", items: "Sipariş geçmişi, Takas teklifleri, Ödeme kayıtları" },
      { title: "Teknik Veriler", items: "IP adresi, Cihaz bilgileri, Çerez kayıtları" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-4xl mx-auto py-12 px-4 space-y-12" }, _attrs))}><div class="space-y-4"><div class="inline-block px-4 py-2 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest"> Hukuki Metinler </div><h1 class="text-6xl font-display font-black text-dark-950 italic tracking-tighter leading-none">KVKK Aydınlatma Metni</h1><p class="text-gray-400 font-bold uppercase tracking-widest text-[11px]">Son Güncelleme: 14 Nisan 2026</p></div><div class="bg-white rounded-[3rem] p-8 lg:p-20 border border-gray-100 shadow-sm relative overflow-hidden"><div class="prose prose-gray max-w-none"><h2 class="text-2xl font-display font-black text-dark-950 italic tracking-tighter mb-8 underline decoration-primary-500/30 underline-offset-8">1. Veri Sorumlusu</h2><p class="text-gray-500 font-medium leading-loose mb-12"> BazarX (bu metinde &quot;Platform&quot; olarak anılacaktır) bünyesinde işlenen verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;Kanun&quot;) kapsamında güvenle saklanmaktadır. Bu aydınlatma metni, verilerinizin hangi amaçlarla işlendiğini ve haklarınızı açıklamaktadır. </p><h2 class="text-2xl font-display font-black text-dark-950 italic tracking-tighter mb-8 underline decoration-primary-500/30 underline-offset-8">2. İşlenen Verileriniz</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"><!--[-->`);
      ssrRenderList(dataCategories, (cat) => {
        _push(`<div class="p-6 bg-gray-50 rounded-2xl border border-gray-100"><h3 class="text-xs font-black text-dark-950 uppercase tracking-widest mb-3">${ssrInterpolate(cat.title)}</h3><p class="text-sm text-gray-400 font-medium">${ssrInterpolate(cat.items)}</p></div>`);
      });
      _push(`<!--]--></div><h2 class="text-2xl font-display font-black text-dark-950 italic tracking-tighter mb-8 underline decoration-primary-500/30 underline-offset-8">3. İşleme Amaçları</h2><ul class="list-none space-y-4 text-gray-500 font-medium mb-12"><!--[-->`);
      ssrRenderList(4, (i) => {
        _push(`<li class="flex items-start gap-4"><div class="w-6 h-6 bg-primary-50 rounded-lg flex items-center justify-center shrink-0 mt-1">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:check",
          class: "w-4 h-4 text-primary-600"
        }, null, _parent));
        _push(`</div><span>Hizmet kalitesinin artırılması ve kullanıcı deneyiminin kişiselleştirilmesi amacıyla veri analizi yapılması.</span></li>`);
      });
      _push(`<!--]--></ul><div class="bg-primary-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:shield-check",
        class: "absolute -right-4 -bottom-4 w-48 h-48 text-white/10"
      }, null, _parent));
      _push(`<h3 class="text-xl font-display font-black italic tracking-tight mb-4 relative z-10">Gizliliğiniz Bizim İçin Önemli</h3><p class="text-white/80 font-medium text-sm leading-relaxed relative z-10"> Verileriniz üçüncü taraflarla ticaret amacıyla asla paylaşılmaz. Kişisel verilerinizin korunması için uçtan uca şifreleme ve bankacılık seviyesinde güvenlik altyapısı kullanıyoruz. </p></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/legal/kvkk.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=kvkk-BxOQZK-o.js.map
