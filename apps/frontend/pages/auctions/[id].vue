<template>
  <div class="min-h-screen bg-background font-body-md text-on-background pb-20">
    <main class="max-w-screen-2xl mx-auto px-6 py-8">
      <div v-if="loading" class="flex justify-center items-center h-96">
        <div class="w-12 h-12 border-4 border-surface-variant border-t-md3-primary rounded-full animate-spin" />
      </div>

      <div v-else-if="auction" class="space-y-6">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs font-label-caps text-outline mb-6">
          <NuxtLink class="hover:text-md3-primary" to="/">MARKET</NuxtLink>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          <NuxtLink class="hover:text-md3-primary" to="/auctions">CANLI TEKLİFLER</NuxtLink>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          <span class="text-md3-primary font-bold uppercase">{{ auction.title }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Left: Main Gallery & Info -->
          <div class="lg:col-span-8 space-y-6">
            <!-- Gallery Card -->
            <div class="bg-white rounded-xl overflow-hidden ambient-shadow relative group">
              <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <span class="bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-secondary/20">
                  <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">verified</span>
                  EKSPERTİZ RAPORU
                </span>
              </div>
              
              <div class="aspect-[4/3] bg-slate-50 flex items-center justify-center relative cursor-zoom-in overflow-hidden">
                <img 
                  :src="selectedImage || auction.Product?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000'" 
                  class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  alt="Auction Image" 
                />
                <div class="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="material-symbols-outlined text-md3-primary">zoom_in</span>
                </div>
              </div>

              <!-- Thumbnails -->
              <div v-if="auction.listing?.catalogProduct?.media?.length" class="grid grid-cols-4 gap-2 p-4 border-t border-slate-100">
                <div 
                  v-for="(img, idx) in auction.listing.catalogProduct.media" 
                  :key="idx"
                  class="aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-pointer transition-all border-2"
                  :class="selectedImage === img.url ? 'border-md3-primary' : 'border-transparent hover:border-md3-primary/40'"
                  @click="selectedImage = img.url"
                >
                  <img :src="img.url" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <!-- Tabs Section -->
            <div class="bg-white rounded-xl ambient-shadow overflow-hidden">
              <div class="flex border-b border-slate-100">
                <button 
                  v-for="tab in ['Ürün Özellikleri', 'Teklif Geçmişi', 'Satıcı Bilgileri', 'Teslimat & İade']" 
                  :key="tab"
                  @click="activeTab = tab"
                  class="px-6 py-4 text-sm transition-all border-b-2"
                  :class="activeTab === tab ? 'font-bold text-md3-primary border-md3-primary' : 'font-medium text-outline hover:text-md3-primary border-transparent'"
                >
                  {{ tab }}
                </button>
              </div>
              <div class="p-8 space-y-6">
                <div v-if="activeTab === 'Ürün Özellikleri'" class="animate-fade-in">
                  <h2 class="text-title-sm text-md3-primary mb-4">{{ auction.title }}</h2>
                  <p class="text-on-surface-variant leading-relaxed mb-6">
                    {{ auction.description || 'BazarX ayrıcalığıyla sunulan bu özel seri, havacılık sınıfı titanyum gövdesi ve safir kristal camı ile dayanıklılığı zarafetle buluşturuyor.' }}
                  </p>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                    <div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant/10">
                      <span class="text-[10px] font-bold text-outline uppercase block mb-1">Materyal</span>
                      <span class="text-sm font-semibold text-md3-primary">Grade 5 Titanyum</span>
                    </div>
                    <div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant/10">
                      <span class="text-[10px] font-bold text-outline uppercase block mb-1">Batarya</span>
                      <span class="text-sm font-semibold text-md3-primary">96 Saat Kullanım</span>
                    </div>
                    <div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant/10">
                      <span class="text-[10px] font-bold text-outline uppercase block mb-1">Su Direnci</span>
                      <span class="text-sm font-semibold text-md3-primary">100 Metre (10 ATM)</span>
                    </div>
                  </div>
                </div>

                <div v-if="activeTab === 'Teklif Geçmişi'" class="space-y-4 animate-fade-in">
                  <div v-for="(bid, idx) in bids" :key="idx" class="flex items-center justify-between p-4 rounded-xl border border-surface-container">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-black text-md3-primary">
                        {{ bid.userName?.charAt(0) }}
                      </div>
                      <div>
                        <p class="text-sm font-bold text-md3-primary">{{ bid.userName }}</p>
                        <p class="text-[10px] text-outline">{{ new Date(bid.createdAt).toLocaleString() }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-lg font-black text-md3-primary">{{ formatPrice(bid.amount) }}</p>
                      <span v-if="idx === 0" class="text-[9px] font-black text-secondary uppercase">LİDER</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Bidding Card & Sidebar -->
          <div class="lg:col-span-4 space-y-6">
            <!-- Bidding Card -->
            <div class="bg-white rounded-xl ambient-shadow overflow-hidden border border-slate-100 lg:sticky lg:top-24">
              <div class="bg-primary-container p-6 text-white relative">
                <div class="flex justify-between items-center mb-4">
                  <div class="flex items-center gap-2 bg-error px-3 py-1 rounded-full animate-pulse shadow-lg shadow-error/20">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span class="text-[10px] font-black">CANLI</span>
                  </div>
                  <div class="text-xs font-medium text-primary-fixed">LOT #{{ auction.id }}</div>
                </div>
                <div class="space-y-1">
                  <span class="text-[10px] font-black uppercase tracking-widest opacity-80">Kalan Süre</span>
                  <div class="text-3xl font-black tracking-tight tabular-nums">{{ countdown.H }}:{{ countdown.M }}:{{ countdown.S }}</div>
                </div>
              </div>

              <div class="p-6 space-y-6">
                <div class="flex justify-between items-end">
                  <div class="space-y-1">
                    <span class="text-xs font-bold text-outline uppercase">Mevcut Teklif</span>
                    <div class="text-4xl font-black text-md3-primary">{{ formatPrice(auction.currentPrice || auction.startPrice) }}</div>
                  </div>
                  <div class="text-right">
                    <span 
                      class="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase"
                      :class="isHighestBidder ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'"
                    >
                      {{ isHighestBidder ? 'LİDER SİZSİNİZ' : 'LİDER DEĞİLSİNİZ' }}
                    </span>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-md3-primary">₺</span>
                    <input
                      v-model="bidAmount"
                      class="w-full pl-8 pr-4 py-4 border-2 border-slate-100 rounded-xl focus:border-md3-primary focus:ring-0 font-bold text-xl text-md3-primary outline-none transition-all"
                      type="number"
                    />
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <button 
                      v-for="inc in [500, 1000, 2500]" :key="inc"
                      @click="bidAmount = (auction.currentPrice || auction.startPrice) + inc"
                      class="py-2 rounded-lg border border-slate-200 text-xs font-bold text-md3-primary hover:bg-slate-50 transition-colors"
                    >
                      +{{ inc }}
                    </button>
                  </div>
                  <button 
                    @click="handlePlaceBid(bidAmount)"
                    :disabled="bidding"
                    class="w-full bg-md3-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span v-if="!bidding">Hemen Teklif Ver</span>
                    <span v-else class="flex items-center justify-center gap-2">
                      <span class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      YÜKLENİYOR
                    </span>
                  </button>
                </div>

                <div class="flex items-center gap-4 py-4 border-t border-slate-100">
                  <div class="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center font-black text-md3-primary border border-surface-variant">
                    4.9
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-bold text-md3-primary">{{ auction.vendor?.name || 'TechElite' }}</div>
                    <div class="text-[10px] text-outline font-medium">BazarX Onaylı Satıcı</div>
                  </div>
                  <span class="material-symbols-outlined text-on-tertiary-container" style="font-variation-settings: 'FILL' 1;">stars</span>
                </div>
              </div>
            </div>

            <!-- Rules Box -->
            <div class="bg-tertiary-fixed text-on-tertiary-fixed p-6 rounded-xl ambient-shadow space-y-4">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-2xl">gavel</span>
                <h3 class="font-bold uppercase tracking-tight">Açık Artırma Kuralları</h3>
              </div>
              <ul class="text-sm space-y-3 opacity-90 font-medium">
                <li class="flex gap-2">
                  <span class="material-symbols-outlined text-sm mt-0.5">check_circle</span>
                  <span>Tekliflerin geri alınması mümkün değildir.</span>
                </li>
                <li class="flex gap-2">
                  <span class="material-symbols-outlined text-sm mt-0.5">check_circle</span>
                  <span>Son 10 saniye içinde gelen teklifler süreyi 30 saniye uzatır.</span>
                </li>
                <li class="flex gap-2 text-md3-secondary font-bold">
                  <span class="material-symbols-outlined text-sm mt-0.5">verified_user</span>
                  <span>BazarX %100 Orijinallik Garantisi kapsamındadır.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Related Auctions -->
        <section class="mt-16 space-y-8">
          <div class="flex justify-between items-center">
            <h2 class="text-headline-md text-md3-primary font-black uppercase italic tracking-tighter">Benzer Açık Artırmalar</h2>
            <NuxtLink class="text-md3-primary font-bold text-sm flex items-center gap-1 hover:underline" to="/auctions">
              Tümünü Gör <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </NuxtLink>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="i in 4" :key="i" class="bg-white rounded-xl ambient-shadow overflow-hidden group hover:-translate-y-2 transition-all">
              <div class="aspect-video relative overflow-hidden bg-surface-container">
                <img src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1000" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div class="absolute top-2 right-2 bg-error text-white text-[8px] font-black px-2 py-0.5 rounded-full">CANLI</div>
              </div>
              <div class="p-4 space-y-3">
                <h4 class="font-bold text-md3-primary truncate uppercase italic">Lüks Klasik Seri v{{ i }}</h4>
                <div class="flex justify-between items-center pt-2 border-t border-slate-50">
                  <span class="text-[10px] text-outline font-bold uppercase">Son Teklif</span>
                  <span class="text-lg font-black text-md3-primary">{{ formatPrice(12400 + (i * 1000)) }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
const {
  auction, bids, loading, bidding, countdown,
  isHighestBidder, handlePlaceBid, formatPrice
} = useAuctionDetail()

const bidAmount = ref(0)
const selectedImage = ref('')
const activeTab = ref('Ürün Özellikleri')

onMounted(() => {
  if (auction.value) {
    bidAmount.value = (auction.value.currentPrice || auction.value.startPrice) + 500
    selectedImage.value = auction.value.Product?.image || ''
  }
})

watch(auction, (newVal) => {
  if (newVal && !bidAmount.value) {
    bidAmount.value = (newVal.currentPrice || newVal.startPrice) + 500
    selectedImage.value = newVal.Product?.image || ''
  }
}, { immediate: true })

definePageMeta({ layout: 'default' })
useHead({ title: 'AÇIK ARTIRMA // BAZARX' })
</script>

<style>
.ambient-shadow {
  box-shadow: 0 20px 25px -5px rgba(26, 58, 92, 0.05), 0 8px 10px -6px rgba(26, 58, 92, 0.05);
}

.font-headline-md { font-weight: 600; }
.font-label-caps { font-weight: 700; text-transform: uppercase; }

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>