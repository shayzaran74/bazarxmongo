<template>
  <div class="space-y-12 italic">
    <!-- Main Product Card -->
    <div class="bg-white rounded-[4rem] shadow-2xl shadow-black/[0.02] overflow-hidden border border-neutral-100 group">
      <div class="p-10 lg:p-16">
        <div class="flex flex-col lg:flex-row gap-16 items-start">
          <div v-if="auction?.Product" class="w-full lg:w-2/5 aspect-square rounded-[3rem] overflow-hidden shadow-2xl relative">
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 pointer-events-none" />
            <img :src="resolveImageUrl(auction.Product.image)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]">
            <div class="absolute bottom-6 left-6 z-20">
              <span class="text-white font-black text-2xl uppercase tracking-tightest leading-none drop-shadow-lg">{{ auction.Product.name }}</span>
            </div>
          </div>
          
          <div class="flex-1 space-y-10">
            <div class="space-y-4">
              <h2 class="text-4xl font-black text-gray-900 leading-none tracking-tightest italic">ÜRÜN ÖZELLİKLERİ</h2>
              <p class="text-xl text-gray-500 font-black leading-relaxed tracking-tight">{{ auction?.description || auction?.Product?.description }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-neutral-50 p-8 rounded-[2.5rem] border border-neutral-100 shadow-inner group/stat hover:bg-white hover:shadow-2xl transition-all">
                <span class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">BAŞLANGIÇ FİYATI</span>
                <span class="text-3xl font-black text-gray-900 tracking-tighter">{{ formatPrice(auction?.startingPrice) }}</span>
              </div>
              <div class="bg-neutral-50 p-8 rounded-[2.5rem] border border-neutral-100 shadow-inner group/stat hover:bg-white hover:shadow-2xl transition-all">
                <span class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">MİNİMUM ARTIŞ</span>
                <span class="text-3xl font-black text-emerald-600 tracking-tighter">+{{ formatPrice(auction?.minBidIncrement) }}</span>
              </div>
              <div v-if="auction?.participationDeposit > 0" class="col-span-1 md:col-span-2 bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100/50 shadow-inner group/stat hover:bg-white hover:shadow-indigo-100 transition-all">
                <span class="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 italic">KATILIM DEPOZİTOSU (BLOKE)</span>
                <span class="text-3xl font-black text-indigo-600 tracking-tighter">{{ formatPrice(auction?.participationDeposit) }}</span>
                <p class="text-[9px] text-indigo-400 mt-4 font-black uppercase tracking-widest leading-none italic opacity-70">* BU TUTAR CÜZDANINIZDA BLOKE EDİLECEK VE İŞLEM SONUNDA İADE EDİLECEKTİR.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div v-for="f in [{l:'GÜVENLİ TEKLİF', s:'SSL KORUMALI', i:ShieldCheckIcon, c:'bg-blue-50 text-blue-600'}, {l:'GERÇEK ZAMANLI', s:'ANLIK GÜNCELLEME', i:ClockIcon, c:'bg-amber-50 text-amber-600'}, {l:'CÜZDAN ÖDEME', s:'HIZLI & KOLAY', i:BoltIcon, c:'bg-green-50 text-green-600'}]" :key="f.l" class="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-xl shadow-black/[0.01] flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
        <div :class="f.c" class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
          <component :is="f.i" class="w-8 h-8" />
        </div>
        <div>
          <span class="block font-black text-gray-900 text-[11px] uppercase tracking-widest leading-none mb-1.5">{{ f.l }}</span>
          <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none opacity-60">{{ f.s }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ShieldCheckIcon, ClockIcon, BoltIcon } from '@heroicons/vue/24/outline'

defineProps({ auction: Object })
const { resolveImageUrl } = useAppImage()
const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(p || 0)
</script>
