<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-12 font-sans italic"
  >
    <div
      class="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
      @click="$emit('close')"
    />
    <div
      class="relative bg-slate-900 w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-[3rem] border border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col"
    >
      <!-- Header -->
      <div class="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
        <div>
          <h3 class="text-3xl font-black text-slate-100 uppercase tracking-tightest">
            {{ modelValue.id ? 'MAKALE DÜZENLE' : 'YENİ MAKALE PROTOKOLÜ' }}
          </h3>
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 opacity-60">YARDIM MERKEZİ VERİ GİRİŞ PANELİ</p>
        </div>
        <button
          class="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all text-3xl font-light"
          @click="$emit('close')"
        >
          &times;
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-12 space-y-12">
        <!-- Main Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div class="space-y-4">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">MAKALE BAŞLIĞI</label>
            <input
              v-model="modelValue.title"
              type="text"
              class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-lg font-black uppercase tracking-tight outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-200"
              placeholder="MAKALENİN TAM BAŞLIĞINI GİRİN"
            >
          </div>
          <div class="space-y-4">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">KATEGORİ ATAMASI</label>
            <select
              v-model="modelValue.categoryId"
              class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-400 appearance-none"
            >
              <option value="">KATEGORİ SEÇİN</option>
              <option
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name.toUpperCase() }}
              </option>
            </select>
          </div>
        </div>

        <!-- Meta Data -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 bg-slate-950/30 p-10 rounded-[2.5rem] border border-slate-800/50">
          <div class="space-y-4">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">HEDEF KİTLE</label>
            <select
              v-model="modelValue.targetRole"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-400"
            >
              <option value="ALL">HERKES</option>
              <option value="BUYER">ALICILAR</option>
              <option value="SELLER">SATICILAR</option>
              <option value="BARTERER">TAKASÇILAR</option>
            </select>
          </div>
          <div class="space-y-4">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">MAKALE DURUMU</label>
            <select
              v-model="modelValue.status"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-400"
            >
              <option value="DRAFT">TASLAK</option>
              <option value="PUBLISHED">YAYINLANDI</option>
              <option value="ARCHIVED">ARŞİVLENDİ</option>
            </select>
          </div>
          <div class="space-y-4">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SIRALAMA</label>
            <input
              v-model.number="modelValue.order"
              type="number"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-200"
            >
          </div>
          <div class="flex items-center gap-4 pt-8">
            <div
              class="w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer"
              :class="modelValue.isPopular ? 'bg-blue-600 border-blue-500' : 'bg-slate-950 border-slate-800'"
              @click="modelValue.isPopular = !modelValue.isPopular"
            >
              <span v-if="modelValue.isPopular" class="text-white text-xs">✓</span>
            </div>
            <label class="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-pointer" @click="modelValue.isPopular = !modelValue.isPopular">POPÜLER İÇERİK</label>
          </div>
        </div>

        <!-- Excerpt -->
        <div class="space-y-4">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">KISA ÖZET (EXCERPT)</label>
          <textarea
            v-model="modelValue.excerpt"
            rows="2"
            class="w-full bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-6 text-sm font-bold tracking-tight outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-400 placeholder:text-slate-800"
            placeholder="MAKALE HAKKINDA KISA BİR BİLGİ GİRİN..."
          />
        </div>

        <!-- Content -->
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">MAKALE ANA İÇERİĞİ</label>
            <span class="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">RT-EDITOR AKTİF</span>
          </div>
          <div class="bg-slate-950 rounded-[2.5rem] border border-slate-800 p-2 overflow-hidden ring-1 ring-slate-800">
            <textarea
              v-model="modelValue.content"
              rows="15"
              class="w-full bg-transparent border-0 px-6 py-4 text-sm tracking-wide outline-none focus:ring-0 text-slate-300 placeholder:text-slate-700"
              placeholder="MAKALENİN TAM İÇERİĞİNİ BURAYA YAZIN VEYA HTML OLARAK YAPIŞTIRIN..."
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-10 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-end gap-6 sticky bottom-0">
        <button
          class="px-10 py-5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          @click="$emit('close')"
        >
          İşlemi İptal Et
        </button>
        <button
          class="px-14 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-[0_15px_40px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95"
          @click="$emit('save')"
        >
          MAKALEYİ SİSTEME KAYDET
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  categories: any[]
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue', 'close', 'save'])
</script>

<style scoped>
/* Rich Editor custom styles if needed */
:deep(.ql-container) {
  min-height: 400px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
}
</style>
