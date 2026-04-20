<template>
  <div class="bg-white rounded-2xl shadow-md p-6 border border-purple-100 h-full">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-black text-gray-900 flex items-center gap-2">
        <span>🚀</span> BazarX XP Hesaplarım
      </h2>
      <div class="flex items-center gap-2">
        <span
          class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border"
          :class="tierConfig.color"
        >
          {{ tierConfig.icon }} {{ tierConfig.label }}
        </span>
      </div>
    </div>

    <!-- XP Split Info -->
    <div class="mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100/50">
      <p class="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">XP Dağılım Kuralı</p>
      <div class="flex items-center gap-2 text-[10px] font-medium text-gray-500">
        <span class="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">%50 Komisyon</span>
        <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">%25 Reklam</span>
        <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">%25 Servis</span>
      </div>
      <p class="text-[10px] text-gray-400 mt-1">Komisyon XP'nin en fazla %50'si komisyon ödemesinde kullanılabilir</p>
    </div>

    <div class="space-y-4">
      <div 
        v-for="acc in xpAccounts" 
        :key="acc.label"
        :class="['flex justify-between items-center p-3 rounded-xl', acc.bg]"
      >
        <div>
          <p :class="['text-[10px] font-black uppercase tracking-widest', acc.textColor]">{{ acc.label }}</p>
          <p :class="['text-xs', acc.subTextColor]">{{ acc.desc }}</p>
        </div>
        <div :class="['text-xl font-black', acc.textColor]">
          {{ formatPrice(acc.balance || 0) }}
        </div>
      </div>
    </div>

    <!-- Tier ROI Info -->
    <div class="mt-4 p-3 bg-gray-50 rounded-xl">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Komisyon Oranı (Barter)</p>
          <p class="text-xs text-gray-400">{{ tierConfig.label }} tier'ına göre</p>
        </div>
        <div class="text-lg font-black text-gray-700">%{{ tierConfig.commission }}</div>
      </div>
      <div class="flex justify-between items-center mt-2">
        <div>
          <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">XP Kazanım (ROI)</p>
        </div>
        <div class="text-lg font-black text-green-600">%{{ tierConfig.roi }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  commission: Object,
  ad: Object,
  service: Object,
  tierConfig: Object,
  formatPrice: Function
})

const xpAccounts = computed(() => [
  { 
    label: 'İndirim Paneli', 
    desc: 'Komisyon ödemelerinde kullanılır', 
    balance: props.commission?.availableBalance,
    bg: 'bg-indigo-50', 
    textColor: 'text-indigo-700', 
    subTextColor: 'text-indigo-400' 
  },
  { 
    label: 'Reklam Bakiyesi', 
    desc: 'Ürün öne çıkarma ve reklamlar', 
    balance: props.ad?.availableBalance,
    bg: 'bg-purple-50', 
    textColor: 'text-purple-700', 
    subTextColor: 'text-purple-400' 
  },
  { 
    label: 'Sistem Giderleri', 
    desc: 'Kargo, kırtasiye vb. servisler', 
    balance: props.service?.availableBalance,
    bg: 'bg-blue-50', 
    textColor: 'text-blue-700', 
    subTextColor: 'text-blue-400' 
  }
])
</script>
