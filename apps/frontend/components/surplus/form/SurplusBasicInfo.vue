<template>
  <div class="space-y-6">
    <h3 class="text-xs font-black text-primary-600 uppercase tracking-[0.2em] flex items-center">
      <span class="w-8 h-px bg-primary-600 mr-3" />
      Temel Bilgiler
    </h3>

    <!-- Title -->
    <div class="space-y-2">
      <label class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">İLAN BAŞLIĞI *</label>
      <input
        v-model="modelValue.title"
        type="text"
        class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all"
        placeholder="Örn: 500 KG Polipropilen Granül"
        required
      >
    </div>

    <!-- Category Selection -->
    <div class="space-y-4">
      <label class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">KATEGORİ *</label>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          :value="selectedMain"
          class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm"
          @change="$emit('update:selectedMain', $event.target.value); $emit('main-change')"
        >
          <option value="">Ana Kategori Seçin</option>
          <option v-for="cat in mainCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>

        <select
          v-if="sub1List.length"
          :value="selectedSub1"
          class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm"
          @change="$emit('update:selectedSub1', $event.target.value); $emit('sub1-change')"
        >
          <option value="">Alt Kategori Seçin</option>
          <option v-for="cat in sub1List" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      
      <div v-if="selectedSub1 && sub2List.length" class="mt-4">
        <select
          :value="selectedSub2"
          class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm"
          @change="$emit('update:selectedSub2', $event.target.value); $emit('sub2-change')"
        >
          <option value="">Detay Kategori Seçin</option>
          <option v-for="cat in sub2List" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
    </div>

    <!-- Price & Quantity -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <label class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">MİKTAR *</label>
        <div class="relative">
          <input
            v-model.number="modelValue.quantity"
            type="number"
            class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-primary-500/10 transition-all"
            placeholder="0"
          >
          <select
            v-model="modelValue.unit"
            class="absolute right-2 top-1/2 -translate-y-1/2 bg-white border border-gray-100 rounded-xl text-[10px] font-black px-3 py-1.5 uppercase tracking-widest focus:ring-0 shadow-sm"
          >
            <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
          </select>
        </div>
      </div>
      <div class="space-y-2">
        <label class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">BİRİM FİYAT (₺)</label>
        <div class="relative">
          <input
            v-model.number="modelValue.unitPrice"
            type="number"
            step="0.01"
            class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-primary-500/10 transition-all"
            placeholder="0.00"
          >
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">TL</span>
        </div>
      </div>
    </div>

    <!-- Price Advisor Widget -->
    <div v-if="advisorData || advisorLoading" class="animate-in fade-in slide-in-from-top-2">
      <div class="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-4 relative overflow-hidden">
        <div v-if="advisorLoading" class="flex items-center space-x-3 text-indigo-600">
          <ArrowPathIcon class="h-4 w-4 animate-spin" />
          <span class="text-[10px] font-black uppercase tracking-widest">Piyasa Fiyatları Analiz Ediliyor...</span>
        </div>
        <div v-else-if="advisorData" class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">📊 Piyasa Endeksi ({{ advisorData.source }})</span>
            <span class="text-[9px] font-bold text-gray-400">ORT: {{ formatCurrency(advisorData.marketAvg) }}</span>
          </div>
          <div 
            class="p-3 rounded-xl border text-[11px] font-bold flex items-start space-x-2"
            :class="getComparisonClass(advisorData.comparison?.level)"
          >
            <ExclamationTriangleIcon v-if="['HIGH', 'CRITICAL'].includes(advisorData.comparison?.level)" class="h-4 w-4 shrink-0" />
            <SparklesIcon v-else class="h-4 w-4 shrink-0" />
            <span>{{ advisorData.comparison?.message }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <label class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">AÇIKLAMA</label>
      <textarea
        v-model="modelValue.description"
        rows="4"
        class="w-full bg-gray-50 border-gray-200 rounded-[2rem] px-6 py-5 text-sm font-medium focus:ring-4 focus:ring-primary-500/10 transition-all resize-none"
        placeholder="Ürün durumu, özellikleri ve takas şartları hakkında bilgi verin..."
      />
    </div>
  </div>
</template>

<script setup>
import { ArrowPathIcon, ExclamationTriangleIcon, SparklesIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: Object,
  mainCategories: Array,
  sub1List: Array,
  sub2List: Array,
  selectedMain: String,
  selectedSub1: String,
  selectedSub2: String,
  advisorData: Object,
  advisorLoading: Boolean,
  units: Array
})

defineEmits(['update:modelValue', 'update:selectedMain', 'update:selectedSub1', 'update:selectedSub2', 'main-change', 'sub1-change', 'sub2-change'])

const formatCurrency = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val)

const getComparisonClass = (level) => {
  if (level === 'GOOD') return 'bg-white text-green-600 border-green-100'
  if (level === 'HIGH') return 'bg-white text-amber-600 border-amber-100'
  if (level === 'CRITICAL') return 'bg-white text-red-600 border-red-100'
  return 'bg-white text-gray-600 border-gray-100'
}
</script>
