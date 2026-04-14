import { _ as __nuxt_component_0 } from "./nuxt-link-D4Fap6vy.js";
import __nuxt_component_1 from "./Icon-3rf78mig.js";
import { defineComponent, computed, mergeProps, withCtx, createVNode, createTextVNode, unref, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderSlot } from "vue/server-renderer";
import { u as useAuth } from "./useAuth-BT-0uMoj.js";
import { m as defineStore } from "../server.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/defu@6.1.7/node_modules/defu/dist/defu.mjs";
import "@iconify/vue/dist/offline";
import "@iconify/vue";
import "./index-DzDKqNn2.js";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/unctx@2.5.0/node_modules/unctx/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/h3@1.15.11/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/cookie-es@2.0.1/node_modules/cookie-es/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs";
import "/Users/macbook/Desktop/bazarx/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs";
import "@vue/devtools-api";
import "./auth-7qcbGVv_.js";
const useCartStore = defineStore("cart", {
  state: () => ({
    items: [],
    loading: false
  }),
  getters: {
    itemCount: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  },
  actions: {
    addItem(item) {
      const existingItem = this.items.find((i) => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        this.items.push(item);
      }
    },
    removeItem(id) {
      this.items = this.items.filter((item) => item.id !== id);
    },
    clearCart() {
      this.items = [];
    }
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const { isLoggedIn, fullName, avatarUrl, user, userRole, isAdmin, isVendor } = useAuth();
    const cartStore = useCartStore();
    const itemCount = computed(() => cartStore.itemCount || 0);
    const formatPrice = (price) => {
      return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(price);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_Icon = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "min-h-screen bg-mesh pb-20 lg:pb-0 relative font-sans selection:bg-primary-500 selection:text-white",
        style: { "overflow-x": "clip" }
      }, _attrs))}><div class="sticky top-0 z-[500] transition-all duration-500 w-full"><div class="bg-dark-950 text-gray-400 py-1.5 hidden lg:block border-b border-white/5"><div class="max-w-8xl mx-auto px-6 flex justify-between items-center text-[10px] font-black tracking-widest uppercase italic"><div class="flex items-center space-x-1 bg-black/50 p-0.5 rounded-full border border-white/5"><button class="px-5 py-1.5 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg"> 🛒 BAZARX </button><button class="px-5 py-1.5 rounded-full hover:text-white transition-colors"> 🏭 Ticari Takas </button><button class="px-5 py-1.5 rounded-full hover:text-white transition-colors"> 💼 Barter Borsa </button></div><div class="flex items-center space-x-6">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/premium",
        class: "text-accent-500 hover:text-accent-400 transition-colors flex items-center"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Icon, {
              name: "heroicons:sparkles",
              class: "w-3 h-3 mr-1"
            }, null, _parent2, _scopeId));
            _push2(` PREMIUM 2026 `);
          } else {
            return [
              createVNode(_component_Icon, {
                name: "heroicons:sparkles",
                class: "w-3 h-3 mr-1"
              }),
              createTextVNode(" PREMIUM 2026 ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="w-px h-3 bg-white/10"></div><div class="flex items-center space-x-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/help",
        class: "hover:text-white transition-colors uppercase tracking-widest"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Yardım`);
          } else {
            return [
              createTextVNode("Yardım")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/legal/terms",
        class: "hover:text-white transition-colors uppercase tracking-widest"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Kurumsal`);
          } else {
            return [
              createTextVNode("Kurumsal")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex items-center space-x-1 cursor-pointer hover:text-white transition-colors"><span>TR</span>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:chevron-down",
        class: "w-3 h-3"
      }, null, _parent));
      _push(`</div></div></div></div></div><header class="w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300"><div class="max-w-8xl mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between gap-8">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex items-center group"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="w-12 h-12 lg:w-14 lg:h-14 bg-dark-950 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 overflow-hidden relative"${_scopeId}><span class="text-xl lg:text-2xl font-display font-black text-white italic"${_scopeId}>BX</span><div class="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent"${_scopeId}></div></div><div class="ml-4 flex flex-col justify-center"${_scopeId}><span class="font-display font-black text-2xl lg:text-3xl tracking-tighter text-dark-950 leading-none mb-1"${_scopeId}>BAZARX</span><span class="text-[8px] font-black text-primary-600 uppercase tracking-[0.3em] leading-none"${_scopeId}>Pazarın Geleceği</span></div>`);
          } else {
            return [
              createVNode("div", { class: "w-12 h-12 lg:w-14 lg:h-14 bg-dark-950 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 overflow-hidden relative" }, [
                createVNode("span", { class: "text-xl lg:text-2xl font-display font-black text-white italic" }, "BX"),
                createVNode("div", { class: "absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent" })
              ]),
              createVNode("div", { class: "ml-4 flex flex-col justify-center" }, [
                createVNode("span", { class: "font-display font-black text-2xl lg:text-3xl tracking-tighter text-dark-950 leading-none mb-1" }, "BAZARX"),
                createVNode("span", { class: "text-[8px] font-black text-primary-600 uppercase tracking-[0.3em] leading-none" }, "Pazarın Geleceği")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="hidden lg:flex flex-1 max-w-xl group"><div class="relative w-full"><input type="text" class="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:bg-white focus:border-primary-500/30 transition-all outline-none shadow-sm group-hover:shadow-md"${ssrRenderAttr("placeholder", _ctx.$t("nav.searchPlaceholder"))}><div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:magnifying-glass",
        class: "w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors"
      }, null, _parent));
      _push(`</div><div class="absolute right-4 inset-y-0 flex items-center space-x-1"><kbd class="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-gray-400">⌘</kbd><kbd class="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-gray-400">K</kbd></div></div></div><div class="flex items-center space-x-3"><div class="relative group">`);
      if (unref(isLoggedIn)) {
        _push(`<button class="flex items-center space-x-3 p-1.5 pr-4 bg-gray-50 border border-gray-100 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300"><div class="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center font-black text-white text-xs border-2 border-white shadow-md overflow-hidden">`);
        if (unref(avatarUrl)) {
          _push(`<img${ssrRenderAttr("src", unref(avatarUrl))} class="w-full h-full object-cover">`);
        } else {
          _push(`<span>${ssrInterpolate(unref(fullName)?.charAt(0).toUpperCase() || "U")}</span>`);
        }
        _push(`</div><div class="text-left hidden xl:block leading-none"><p class="text-[11px] font-black text-dark-950 mb-1">${ssrInterpolate(unref(fullName))}</p><p class="text-[9px] font-bold text-primary-600 tracking-tighter uppercase">${ssrInterpolate(unref(isAdmin) ? "Admin" : unref(isVendor) ? "Satıcı" : unref(userRole))}</p></div></button>`);
      } else {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/auth/login",
          class: "flex items-center space-x-2 px-6 py-4 bg-dark-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg active:scale-95"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Icon, {
                name: "heroicons:user",
                class: "w-4 h-4"
              }, null, _parent2, _scopeId));
              _push2(`<span${_scopeId}>${ssrInterpolate(_ctx.$t("common.login"))}</span>`);
            } else {
              return [
                createVNode(_component_Icon, {
                  name: "heroicons:user",
                  class: "w-4 h-4"
                }),
                createVNode("span", null, toDisplayString(_ctx.$t("common.login")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      if (unref(isLoggedIn)) {
        _push(`<div class="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-2 border border-gray-100 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-500 z-[600]"><div class="p-3 bg-gray-50 rounded-2xl mb-2"><p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cüzdan Bakiyesi</p><p class="text-sm font-black text-dark-950 leading-none">${ssrInterpolate(formatPrice(unref(user)?.Wallet?.balance || 0))}</p></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/profile",
          class: "flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors group/item"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Icon, {
                name: "heroicons:user-circle",
                class: "w-5 h-5 text-gray-400 group-hover/item:text-primary-600"
              }, null, _parent2, _scopeId));
              _push2(`<span class="text-xs font-black text-gray-600 tracking-tight"${_scopeId}>Profilim</span>`);
            } else {
              return [
                createVNode(_component_Icon, {
                  name: "heroicons:user-circle",
                  class: "w-5 h-5 text-gray-400 group-hover/item:text-primary-600"
                }),
                createVNode("span", { class: "text-xs font-black text-gray-600 tracking-tight" }, "Profilim")
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(isAdmin)) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/admin",
            class: "flex items-center space-x-3 p-3 hover:bg-red-50 text-red-600 rounded-2xl transition-colors group/item"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_Icon, {
                  name: "heroicons:cog-6-tooth",
                  class: "w-5 h-5 text-red-400 group-hover/item:text-red-600"
                }, null, _parent2, _scopeId));
                _push2(`<span class="text-xs font-black tracking-tight uppercase"${_scopeId}>Yönetici Paneli</span>`);
              } else {
                return [
                  createVNode(_component_Icon, {
                    name: "heroicons:cog-6-tooth",
                    class: "w-5 h-5 text-red-400 group-hover/item:text-red-600"
                  }),
                  createVNode("span", { class: "text-xs font-black tracking-tight uppercase" }, "Yönetici Paneli")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="flex items-center space-x-3 p-3 w-full hover:bg-red-50 text-red-600 rounded-2xl transition-colors group/item">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:arrow-left-on-rectangle",
          class: "w-5 h-5 text-red-400 group-hover/item:text-red-600"
        }, null, _parent));
        _push(`<span class="text-xs font-black tracking-tight">Güvenli Çıkış</span></button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/cart",
        class: "relative group h-12 w-12 lg:h-14 lg:w-14 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-primary-700 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Icon, {
              name: "heroicons:shopping-cart",
              class: "w-6 h-6 z-10"
            }, null, _parent2, _scopeId));
            _push2(`<span class="absolute top-2 right-2 w-5 h-5 bg-white text-dark-950 text-[9px] font-black rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"${_scopeId}>${ssrInterpolate(unref(itemCount))}</span><div class="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"${_scopeId}></div>`);
          } else {
            return [
              createVNode(_component_Icon, {
                name: "heroicons:shopping-cart",
                class: "w-6 h-6 z-10"
              }),
              createVNode("span", { class: "absolute top-2 right-2 w-5 h-5 bg-white text-dark-950 text-[9px] font-black rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform" }, toDisplayString(unref(itemCount)), 1),
              createVNode("div", { class: "absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></header></div><main class="max-w-8xl mx-auto px-4 lg:px-8 py-8 relative z-10 min-h-[70vh]">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><footer class="bg-white border-t border-gray-100 pt-20 pb-10"><div class="max-w-8xl mx-auto px-8"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20"><div class="col-span-1 lg:col-span-1"><div class="flex items-center mb-6"><div class="w-10 h-10 bg-dark-950 rounded-xl flex items-center justify-center shadow-xl mr-3"><span class="text-lg font-display font-black text-white italic">BX</span></div><span class="font-display font-black text-2xl tracking-tighter text-dark-950 leading-none">BAZARX</span></div><p class="text-gray-400 text-sm font-medium leading-relaxed mb-8"> Türkiye&#39;nin en gelişmiş ticari takas ve barter platformu. İşletmeniz için yeni nesil ticaret deneyimi. </p><div class="flex space-x-4"><a href="#" class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all">`);
      _push(ssrRenderComponent(_component_Icon, { name: "uil:facebook-f" }, null, _parent));
      _push(`</a><a href="#" class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all">`);
      _push(ssrRenderComponent(_component_Icon, { name: "uil:instagram" }, null, _parent));
      _push(`</a><a href="#" class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all">`);
      _push(ssrRenderComponent(_component_Icon, { name: "uil:linkedin-alt" }, null, _parent));
      _push(`</a></div></div><div><h4 class="text-[10px] font-black text-dark-950 uppercase tracking-[0.2em] mb-8">Platform</h4><ul class="space-y-4"><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/products",
        class: "text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Ürünler`);
          } else {
            return [
              createTextVNode("Ürünler")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/barter",
        class: "text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Takas Havuzu`);
          } else {
            return [
              createTextVNode("Takas Havuzu")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/premium",
        class: "text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Premium`);
          } else {
            return [
              createTextVNode("Premium")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></div><div><h4 class="text-[10px] font-black text-dark-950 uppercase tracking-[0.2em] mb-8">Destek</h4><ul class="space-y-4"><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/help",
        class: "text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Yardım Merkezi`);
          } else {
            return [
              createTextVNode("Yardım Merkezi")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/contact",
        class: "text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`İletişim`);
          } else {
            return [
              createTextVNode("İletişim")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/faq",
        class: "text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Sıkça Sorulanlar`);
          } else {
            return [
              createTextVNode("Sıkça Sorulanlar")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></div><div><h4 class="text-[10px] font-black text-dark-950 uppercase tracking-[0.2em] mb-8">Hukuki</h4><ul class="space-y-4"><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/legal/privacy",
        class: "text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Gizlilik Politikası`);
          } else {
            return [
              createTextVNode("Gizlilik Politikası")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/legal/terms",
        class: "text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Kullanım Şartları`);
          } else {
            return [
              createTextVNode("Kullanım Şartları")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/legal/kvkk",
        class: "text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`KVKK Aydınlatma`);
          } else {
            return [
              createTextVNode("KVKK Aydınlatma")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></div></div><div class="pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6"><p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">© 2026 BAZARX. TÜM HAKLARI SAKLIDIR.</p><div class="flex items-center space-x-1 grayscale opacity-50"><div class="px-2 py-1 bg-gray-100 rounded text-[9px] font-bold">VISA</div><div class="px-2 py-1 bg-gray-100 rounded text-[9px] font-bold">MASTERCARD</div><div class="px-2 py-1 bg-gray-100 rounded text-[9px] font-bold">IYZICO</div></div></div></div></footer><nav class="lg:hidden fixed bottom-4 left-4 right-4 h-16 bg-dark-950/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 flex items-center justify-around px-2 z-[600]">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex flex-col items-center justify-center space-y-1 group",
        "active-class": "text-primary-400"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Icon, {
              name: "heroicons:home",
              class: "w-6 h-6"
            }, null, _parent2, _scopeId));
            _push2(`<span class="text-[8px] font-black uppercase tracking-widest"${_scopeId}>Ana Sayfa</span>`);
          } else {
            return [
              createVNode(_component_Icon, {
                name: "heroicons:home",
                class: "w-6 h-6"
              }),
              createVNode("span", { class: "text-[8px] font-black uppercase tracking-widest" }, "Ana Sayfa")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/products",
        class: "flex flex-col items-center justify-center space-y-1 group",
        "active-class": "text-primary-400"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Icon, {
              name: "heroicons:rectangle-group",
              class: "w-6 h-6"
            }, null, _parent2, _scopeId));
            _push2(`<span class="text-[8px] font-black uppercase tracking-widest"${_scopeId}>Ürünler</span>`);
          } else {
            return [
              createVNode(_component_Icon, {
                name: "heroicons:rectangle-group",
                class: "w-6 h-6"
              }),
              createVNode("span", { class: "text-[8px] font-black uppercase tracking-widest" }, "Ürünler")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/cart",
        class: "relative flex items-center justify-center -translate-y-8"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40 border-4 border-white"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "heroicons:shopping-cart",
              class: "w-7 h-7 text-white"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
            if (unref(itemCount) > 0) {
              _push2(`<span class="absolute -top-1 -right-1 w-6 h-6 bg-accent-500 text-dark-950 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white"${_scopeId}>${ssrInterpolate(unref(itemCount))}</span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", { class: "w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40 border-4 border-white" }, [
                createVNode(_component_Icon, {
                  name: "heroicons:shopping-cart",
                  class: "w-7 h-7 text-white"
                })
              ]),
              unref(itemCount) > 0 ? (openBlock(), createBlock("span", {
                key: 0,
                class: "absolute -top-1 -right-1 w-6 h-6 bg-accent-500 text-dark-950 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white"
              }, toDisplayString(unref(itemCount)), 1)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/barter",
        class: "flex flex-col items-center justify-center space-y-1 group",
        "active-class": "text-primary-400"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Icon, {
              name: "heroicons:arrows-right-left",
              class: "w-6 h-6"
            }, null, _parent2, _scopeId));
            _push2(`<span class="text-[8px] font-black uppercase tracking-widest"${_scopeId}>Takas</span>`);
          } else {
            return [
              createVNode(_component_Icon, {
                name: "heroicons:arrows-right-left",
                class: "w-6 h-6"
              }),
              createVNode("span", { class: "text-[8px] font-black uppercase tracking-widest" }, "Takas")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/profile",
        class: "flex flex-col items-center justify-center space-y-1 group",
        "active-class": "text-primary-400"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Icon, {
              name: "heroicons:user",
              class: "w-6 h-6"
            }, null, _parent2, _scopeId));
            _push2(`<span class="text-[8px] font-black uppercase tracking-widest"${_scopeId}>Profil</span>`);
          } else {
            return [
              createVNode(_component_Icon, {
                name: "heroicons:user",
                class: "w-6 h-6"
              }),
              createVNode("span", { class: "text-[8px] font-black uppercase tracking-widest" }, "Profil")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=default-iuPrpe9K.js.map
