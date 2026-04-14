import { defineComponent, ref, unref, mergeProps, useSSRContext, withCtx, createTextVNode } from "vue";
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { u as useRuntimeConfig, _ as _export_sfc, a as useI18n } from "../server.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import __nuxt_component_1 from "./Icon-3rf78mig.js";
import { _ as __nuxt_component_0$1 } from "./nuxt-link-D4Fap6vy.js";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/unctx@2.5.0/node_modules/unctx/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/h3@1.15.11/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/defu@6.1.7/node_modules/defu/dist/defu.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/cookie-es@2.0.1/node_modules/cookie-es/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs";
import "@vue/devtools-api";
import "@iconify/vue/dist/offline";
import "@iconify/vue";
import "./index-DzDKqNn2.js";
const useAppImage = () => {
  const config = useRuntimeConfig();
  const resolveImageUrl = (path, type = "general") => {
    if (!path) {
      if (type === "avatar") return "/images/default-avatar.png";
      return "/images/placeholder.png";
    }
    if (path.startsWith("http")) return path;
    const apiBase = config.public.apiBase || "http://localhost:3001/api/v1";
    const base = apiBase.replace("/api/v1", "");
    if (type === "avatar") return `${base}/uploads/avatars/${path}`;
    if (type === "product") return `${base}/uploads/products/${path}`;
    if (type === "banner") return `${base}/uploads/banners/${path}`;
    return `${base}/uploads/${path}`;
  };
  return { resolveImageUrl };
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "HomeBanner",
  __ssrInlineRender: true,
  props: {
    ecosystem: {}
  },
  setup(__props) {
    const { resolveImageUrl } = useAppImage();
    const banners = ref([]);
    const currentIndex = ref(0);
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(banners).length > 0) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "home-banner-slider relative w-full overflow-hidden group/slider bg-dark-950 rounded-[2.5rem] shadow-2xl" }, _attrs))} data-v-465239ac><div class="banner-track flex transition-transform duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1)" style="${ssrRenderStyle({ transform: `translateX(-${unref(currentIndex) * 100}%)` })}" data-v-465239ac><!--[-->`);
        ssrRenderList(unref(banners), (banner, index) => {
          _push(`<div class="banner-slide flex-shrink-0 w-full relative h-[400px] lg:h-[500px] cursor-pointer" data-v-465239ac><img${ssrRenderAttr("src", unref(resolveImageUrl)(banner.imageUrl, "banner"))} class="w-full h-full object-cover transition-transform duration-[8000ms] ease-out" style="${ssrRenderStyle({ transform: unref(currentIndex) === index ? "scale(1.1)" : "scale(1.0)" })}" data-v-465239ac><div class="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-dark-950/20 to-transparent" data-v-465239ac></div><div class="absolute inset-0 bg-gradient-to-r from-dark-950/40 via-transparent to-transparent" data-v-465239ac></div><div class="absolute inset-0 flex items-center px-10 lg:px-20" data-v-465239ac><div class="${ssrRenderClass([unref(currentIndex) === index ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0", "max-w-2xl transform transition-all duration-1000"])}" data-v-465239ac><span class="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-600 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6" data-v-465239ac>${ssrInterpolate(banner.subtitle || "Öne Çıkan")}</span><h2 class="text-4xl lg:text-7xl font-display font-black text-white italic leading-none mb-6 tracking-tighter shadow-sm" data-v-465239ac>${ssrInterpolate(banner.title)}</h2><p class="text-gray-300 text-sm lg:text-lg font-medium max-w-lg mb-8 line-clamp-2" data-v-465239ac>${ssrInterpolate(banner.description)}</p><button class="px-10 py-4 bg-white text-dark-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-500 hover:text-white transition-all duration-300 shadow-xl active:scale-95" data-v-465239ac> Hemen Keşfet </button></div></div></div>`);
        });
        _push(`<!--]--></div>`);
        if (unref(banners).length > 1) {
          _push(`<div class="absolute bottom-10 left-10 lg:left-20 flex space-x-3 z-10" data-v-465239ac><!--[-->`);
          ssrRenderList(unref(banners), (_, index) => {
            _push(`<button class="${ssrRenderClass([index === unref(currentIndex) ? "w-12 bg-white" : "w-3 bg-white/20 hover:bg-white/40", "h-1.5 rounded-full transition-all duration-500"])}" data-v-465239ac></button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/HomeBanner.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-465239ac"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const stats = [
      { label: "Aktif Üye", value: "1.2K+" },
      { label: "Takas Havuzu", value: "450+" },
      { label: "Güvenli Takas", value: "%100" },
      { label: "Yapay Zeka", value: "Pro" }
    ];
    const features = [
      { label: "Hızlı İşlem", title: "Acil Takas", icon: "heroicons:bolt" },
      { label: "Kurumsal", title: "Ticari Partner", icon: "heroicons:building-office-2" },
      { label: "Güvenlik", title: "Escrow Ödeme", icon: "heroicons:shield-check" },
      { label: "Analiz", title: "Akıllı Eşleşme", icon: "heroicons:presentation-chart-line" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LayoutHomeBanner = __nuxt_component_0;
      const _component_Icon = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full space-y-12 pb-20" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_LayoutHomeBanner, { ecosystem: "BAZARX" }, null, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-6"><!--[-->`);
      ssrRenderList(features, (feat, index) => {
        _push(`<div class="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative"><div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div><div class="relative z-10"><div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors duration-500">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: feat.icon,
          class: "w-7 h-7 text-primary-600 group-hover:text-white transition-colors duration-500"
        }, null, _parent));
        _push(`</div><h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">${ssrInterpolate(feat.label)}</h3><p class="text-lg font-display font-black text-dark-950 italic leading-none">${ssrInterpolate(feat.title)}</p></div></div>`);
      });
      _push(`<!--]--></div><div class="bg-dark-950 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl"><div class="absolute inset-0 bg-mesh opacity-10"></div><div class="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-12"><!--[-->`);
      ssrRenderList(stats, (stat, index) => {
        _push(`<div class="text-center lg:text-left"><div class="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-4">${ssrInterpolate(stat.label)}</div><div class="text-5xl lg:text-6xl font-display font-black text-white italic tracking-tighter">${ssrInterpolate(stat.value)}</div></div>`);
      });
      _push(`<!--]--></div></div><div class="space-y-8"><div class="flex items-center justify-between px-2"><h2 class="text-3xl font-display font-black text-dark-950 italic tracking-tighter">Yeni Fırsatlar</h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/products",
        class: "text-xs font-black text-primary-600 uppercase tracking-widest hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Tümünü Gör`);
          } else {
            return [
              createTextVNode("Tümünü Gör")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"><!--[-->`);
      ssrRenderList(5, (i) => {
        _push(`<div class="bg-gray-50 rounded-[2rem] h-[350px] animate-pulse"></div>`);
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-cKUDpFyE.js.map
