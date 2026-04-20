<template>
  <div class="min-h-screen bg-[#f8fafc] py-16 px-4 sm:px-6 lg:px-8 font-sans">
    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto italic">
      <div class="animate-pulse space-y-16">
        <div class="h-8 w-64 bg-neutral-200 rounded-full" />
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div class="lg:col-span-7 space-y-12">
            <div class="aspect-square bg-white rounded-[4rem] border border-neutral-100 shadow-sm" />
            <div class="h-80 bg-white rounded-[3rem] border border-neutral-100 shadow-sm" />
          </div>
          <div class="lg:col-span-5 space-y-12">
            <div class="h-16 w-3/4 bg-neutral-200 rounded-3xl" />
            <div class="h-96 bg-gray-900 rounded-[3.5rem]" />
            <div class="h-64 bg-white rounded-[3rem] border border-neutral-100 shadow-sm" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="item" class="max-w-7xl mx-auto space-y-20 italic">
      <!-- Breadcrumb & Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div class="space-y-6">
          <nav class="flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
            <NuxtLink to="/surplus" class="hover:text-indigo-600 transition-colors">TAKASLAR</NuxtLink>
            <span class="text-gray-300">/</span>
            <span class="text-gray-500">{{ item.category }}</span>
            <span class="text-gray-300">/</span>
            <span class="text-indigo-600 italic tracking-tighter">{{ item.title }}</span>
          </nav>
          
          <div class="flex flex-wrap items-center gap-6">
            <h1 class="text-5xl md:text-8xl font-black text-gray-900 tracking-tightest leading-[0.85] uppercase italic drop-shadow-sm">{{ item.title }}</h1>
            <div class="flex items-center gap-3">
              <span class="px-6 py-2 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200/50">{{ item.category }}</span>
              <span class="px-6 py-2 rounded-2xl bg-white border border-neutral-100 text-gray-400 text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2">
                <MapPinIcon class="h-4 w-4 text-red-500" />
                {{ item.location || 'GLOBAL' }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-6 p-6 bg-white rounded-[3rem] border border-neutral-50 shadow-2xl shadow-black/[0.02] group hover:border-indigo-100 transition-all cursor-pointer">
          <div class="h-20 w-20 rounded-[1.5rem] bg-neutral-50 flex items-center justify-center p-3 border border-black/5 group-hover:bg-indigo-50 transition-all">
            <img v-if="item.company.logoUrl" :src="item.company.logoUrl" class="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all">
            <span v-else class="text-3xl font-black text-gray-400 group-hover:text-indigo-600 uppercase">{{ item.company.name.charAt(0) }}</span>
          </div>
          <div>
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1 italic">YAYINLAYAN KURUM</p>
            <p class="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-all uppercase leading-none">{{ item.company.name }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <!-- Main Content -->
        <div class="lg:col-span-7 space-y-16">
          <SurplusGallery :item="item" v-model:active-idx="activeImageIdx" />

          <div class="space-y-10">
            <div class="relative pl-8">
              <div class="absolute left-0 top-0 bottom-0 w-2 bg-indigo-600 rounded-full shadow-2xl shadow-indigo-200" />
              <h2 class="text-4xl font-black text-gray-900 uppercase tracking-tightest italic">ORİJİNAL AÇIKLAMA</h2>
            </div>
            <div class="bg-white rounded-[4rem] p-12 border border-neutral-50 shadow-2xl shadow-black/[0.01] relative overflow-hidden group">
              <div class="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <SparklesIcon class="h-48 w-48 text-indigo-600" />
              </div>
              <p class="text-gray-500 font-black leading-relaxed italic text-xl whitespace-pre-wrap relative z-10 tracking-tight">{{ item.description || 'DETAYLI SPEKTRUM ANALİZİ EKLENMEDİ.' }}</p>
            </div>
          </div>

          <SurplusTechnicalSpecs :item="item" />
        </div>

        <!-- Sidebar Actions -->
        <div class="lg:col-span-5 space-y-10 lg:sticky lg:top-24">
          <SurplusPricing :item="item" :available-quantity="availableQuantity" :available-percent="availablePercent" />

          <div class="bg-white rounded-[4rem] p-10 border border-neutral-100 shadow-2xl shadow-black/[0.03] space-y-8">
            <div class="space-y-3">
              <h3 class="text-3xl font-black text-gray-900 uppercase tracking-tightest italic flex items-center">
                <ArrowsRightLeftIcon class="h-10 w-10 mr-4 text-indigo-600" />
                TAKAS PANELİ
              </h3>
              <p class="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1 leading-none italic">HIZLI VE GÜVENLİ TİCARİ TAKAS PROTOKOLÜ.</p>
            </div>

            <div class="space-y-4">
              <button class="group w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] p-8 flex flex-col items-center justify-center transition-all shadow-2xl shadow-indigo-200 relative overflow-hidden active:scale-95" @click="showTradeModal = true">
                <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span class="text-[9px] font-black uppercase tracking-[0.4em] mb-1 opacity-60 italic">MAKE AN OFFER</span>
                <span class="text-xl font-black uppercase tracking-widest">TAKAS TEKLİFİ GÖNDER</span>
              </button>

              <button :disabled="processingBarter" class="group w-full bg-gray-900 hover:bg-black text-white rounded-[2rem] p-8 flex flex-col items-center justify-center transition-all shadow-2xl shadow-gray-200 relative overflow-hidden active:scale-95 disabled:opacity-50" @click="buyWithBarter">
                <span class="text-[9px] font-black uppercase tracking-[0.4em] mb-1 opacity-30 italic">DIRECT PURCHASE</span>
                <div class="flex items-center space-x-4">
                  <BanknotesIcon class="h-7 w-7 text-indigo-500" />
                  <span class="text-xl font-black uppercase tracking-widest">BARTER İLE SATIN AL</span>
                </div>
              </button>
            </div>

            <div v-if="item.wantedCategories && item.wantedCategories.length > 0" class="pt-8 border-t border-neutral-50 space-y-4">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">İLGİLENİLEN KATEGORİLER</p>
              <div class="flex flex-wrap gap-3">
                <span v-for="cat in item.wantedCategories" :key="cat" class="px-5 py-2 rounded-xl bg-neutral-50 border border-neutral-100 text-[9px] font-black text-gray-500 uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all">{{ cat }}</span>
              </div>
            </div>
          </div>

          <!-- Process Map -->
          <div class="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-[4rem] p-12 border border-indigo-100/50 relative overflow-hidden group">
            <div class="absolute -right-12 -bottom-12 opacity-5 rotate-12 transition-transform group-hover:rotate-45 duration-700">
              <ArrowPathIcon class="h-56 w-56 text-indigo-900" />
            </div>
            <h4 class="text-2xl font-black text-indigo-900/80 mb-10 uppercase tracking-tightest italic">OPERASYONEL AKIŞ</h4>
            <div class="space-y-8 relative z-10">
              <div v-for="(step, idx) in ['İLANI İNCELEYİN VE TAKAS TEKLİFİ GÖNDERİN.', 'KARŞI TARAF TEKLİFİNİZİ DEĞERLENDİRİP ONAYLASIN.', 'EŞLEŞME SAĞLANDIĞINDA LOJİSTİK SÜRECİNİ BAŞLATIN.', 'TAKAS TAMAMLANDIĞINDA PLATFORM ÜZERİNDEN ONAY VERİN.']" :key="idx" class="flex gap-6 group/step">
                <div class="flex flex-col items-center pt-2">
                  <div class="w-3 h-3 rounded-full bg-indigo-600 ring-8 ring-indigo-100 group-hover/step:ring-[12px] transition-all" />
                  <div v-if="idx < 3" class="w-1 flex-1 bg-indigo-100/50 my-2 rounded-full" />
                </div>
                <div>
                  <p class="text-[9px] font-black text-indigo-900/30 uppercase tracking-[0.3em] mb-1 italic">ADIM {{ idx + 1 }}</p>
                  <p class="text-xs font-black text-indigo-950/80 uppercase leading-snug tracking-tight group-hover/step:translate-x-2 transition-transform">{{ step }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SurplusTradeChains :chains="chains" @start="startChainTrade" />
    </div>

    <!-- Trade Modal -->
    <TradeOfferModal v-if="showTradeModal" :item="item" @close="showTradeModal = false" @success="navigateTo('/my/surplus')" />
  </div>
</template>

<script setup>
import { MapPinIcon, ArrowsRightLeftIcon, SparklesIcon, ArrowPathIcon, BanknotesIcon } from '@heroicons/vue/24/outline'
import SurplusGallery from '~/components/surplus/detail/SurplusGallery.vue'
import SurplusPricing from '~/components/surplus/detail/SurplusPricing.vue'
import SurplusTechnicalSpecs from '~/components/surplus/detail/SurplusTechnicalSpecs.vue'
import SurplusTradeChains from '~/components/surplus/detail/SurplusTradeChains.vue'

definePageMeta({ layout: 'default' })
useHead({ title: 'SURPLUS DETAY // BAZARX' })

const {
  item, chains, loading, processingBarter, activeImageIdx, showTradeModal,
  availableQuantity, availablePercent, fetchItem, fetchChains, buyWithBarter, startChainTrade
} = useSurplusDetail()

onMounted(fetchItem)
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
