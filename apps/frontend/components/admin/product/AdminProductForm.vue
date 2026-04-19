<template>
  <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
    <div class="flex justify-between items-center mb-6 border-b pb-4">
      <div>
        <h2 class="text-xl font-black uppercase text-gray-900">
          {{ editingId ? 'Ürün Düzenle' : 'Yeni Ürün Ekle' }}
        </h2>
        <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
          {{ editingId ? 'Mevcut bir ürünü güncelliyorsunuz' : 'Sisteme yeni bir ürün kaydediyorsunuz' }}
        </p>
      </div>
      <button
        class="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        @click="$emit('cancel')"
      >
        ✕
      </button>
    </div>

    <form
      class="space-y-8"
      @submit.prevent="$emit('submit')"
    >
      <!-- Temel Bilgiler Section -->
      <section class="border-b border-gray-100 pb-8">
        <h3 class="text-xs font-black text-primary-600 uppercase tracking-widest mb-6 flex items-center">
          <span class="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center mr-2">1</span>
          📋 Temel Bilgiler
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Barkod -->
          <div>
            <label class="block text-[11px] font-black text-gray-500 uppercase mb-1.5 ml-1">Barkod *</label>
            <div class="flex gap-2">
              <input
                v-model="form.barcode"
                type="text"
                placeholder="Ticari-1234567890"
                :disabled="!!editingId"
                class="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium disabled:opacity-50"
              >
            </div>
          </div>

          <!-- Model Kodu -->
          <div>
            <label class="block text-[11px] font-black text-gray-500 uppercase mb-1.5 ml-1">Model Kodu</label>
            <div class="flex gap-2">
              <input
                v-model="form.modelCode"
                type="text"
                placeholder="MK-001"
                :disabled="!!editingId"
                class="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium disabled:opacity-50"
              >
            </div>
          </div>

          <!-- Ürün Adı -->
          <div class="md:col-span-2">
            <label class="block text-[11px] font-black text-gray-500 uppercase mb-1.5 ml-1">Ürün Adı *</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Premium Yastık 50x70"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-bold"
            >
          </div>

          <!-- Trendyol ID & SKU -->
          <div class="grid grid-cols-2 gap-4 md:col-span-2">
            <div>
              <label class="block text-[11px] font-black text-gray-500 uppercase mb-1.5 ml-1">Trendyol Ürün ID</label>
              <input
                v-model="form.trendyolProductId"
                type="text"
                placeholder="12345678"
                :disabled="!!editingId"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium disabled:opacity-50"
              >
            </div>
            <div>
              <label class="block text-[11px] font-black text-gray-500 uppercase mb-1.5 ml-1">SKU</label>
              <input
                v-model="form.sku"
                type="text"
                placeholder="SKU-001"
                :disabled="!!editingId"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium disabled:opacity-50"
              >
            </div>
          </div>

          <!-- Marka & Kategori -->
          <div>
            <label class="block text-[11px] font-black text-gray-500 uppercase mb-1.5 ml-1">Marka</label>
            <select
              v-model="form.brandId"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium"
            >
              <option value="">
                Marka Seçin (Opsiyonel)
              </option>
              <option
                v-for="b in brands"
                :key="b.id"
                :value="b.id"
              >
                {{ b.name }}
              </option>
            </select>
          </div>

          <!-- Kategori Selector (Simplified for the Page to handle cascading) -->
          <div class="md:row-span-1">
            <label class="block text-[11px] font-black text-gray-500 uppercase mb-1.5 ml-1">Kategori Seçimi *</label>
            <div class="grid grid-cols-1 gap-2">
              <slot name="category-selector" />
            </div>
          </div>
          
          <!-- Açıklama -->
          <div class="md:col-span-2">
            <label class="block text-[11px] font-black text-gray-500 uppercase mb-1.5 ml-1">Açıklama</label>
            <textarea
              v-model="form.description"
              rows="4"
              placeholder="Ürün hakkında detaylı bilgi..."
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium"
            />
          </div>
        </div>
      </section>

      <!-- Fiyat ve Stok Section -->
      <section class="border-b border-gray-100 pb-8">
        <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center">
          <span class="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-2">2</span>
          💰 Fiyat ve Stok Bilgileri
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-[11px] font-black text-gray-500 uppercase mb-1.5 ml-1">Satış Fiyatı * (₺)</label>
            <input
              v-model.number="form.price"
              type="number"
              step="0.01"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-bold"
            >
          </div>
          <div>
            <label class="block text-[11px] font-black text-gray-500 uppercase mb-1.5 ml-1">Piyasa Fiyatı (₺)</label>
            <input
              v-model.number="form.marketPrice"
              type="number"
              step="0.01"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium"
            >
          </div>
          <div>
            <label class="block text-[11px] font-black text-gray-500 uppercase mb-1.5 ml-1">KDV Oranı (%)</label>
            <select
              v-model.number="form.vatRate"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium"
            >
              <option value="0">
                %0
              </option>
              <option value="1">
                %1
              </option>
              <option value="8">
                %8
              </option>
              <option value="18">
                %18
              </option>
              <option value="20">
                %20
              </option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-black text-gray-500 uppercase mb-1.5 ml-1">Stok Adedi *</label>
            <input
              v-model.number="form.stock"
              type="number"
              min="0"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-bold"
            >
          </div>
          <div>
            <label class="block text-[11px] font-black text-gray-500 uppercase mb-1.5 ml-1">Uyarı Eşiği</label>
            <input
              v-model.number="form.lowStockThreshold"
              type="number"
              min="0"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium"
            >
          </div>
          <div>
            <label class="block text-[11px] font-black text-gray-500 uppercase mb-1.5 ml-1">Stok Kodu</label>
            <input
              v-model="form.stockCode"
              type="text"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium"
            >
          </div>
        </div>
      </section>

      <!-- Görseller Section -->
      <section class="border-b border-gray-100 pb-8">
        <h3 class="text-xs font-black text-emerald-600 uppercase tracking-widest mb-6 flex items-center">
          <span class="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center mr-2">3</span>
          🖼️ Ürün Görselleri
        </h3>
        <slot name="image-upload" />
      </section>

      <!-- Variations Section -->
      <section class="border-b border-gray-100 pb-8">
        <slot name="variants" />
      </section>

      <!-- Submit Footer -->
      <div class="flex gap-4 pt-4">
        <button
          type="submit"
          :disabled="loading"
          class="flex-[2] bg-primary-600 text-white py-4 px-6 rounded-2xl hover:bg-primary-700 disabled:bg-gray-400 transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/30"
        >
          {{ loading ? 'İşleniyor...' : (editingId ? 'DEĞİŞİKLİKLERİ KAYDET' : 'ÜRÜNÜ SİSTEME EKLE') }}
        </button>
        <button
          type="button"
          class="flex-1 bg-gray-100 text-gray-600 py-4 px-6 rounded-2xl hover:bg-gray-200 transition-all font-black uppercase tracking-widest text-xs"
          @click="$emit('cancel')"
        >
          İPTAL
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
const form = defineModel('form', { type: Object, required: true })

defineProps({
  brands: {
    type: Array,
    default: () => []
  },
  editingId: {
    type: [String, Number, null],
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['submit', 'cancel'])
</script>
