<template>
  <div class="space-y-8 animate-fade-in-up">
    <!-- Bank Information -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-gray-100">
      <div class="md:col-span-2">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Banka Adı *</label>
        <input
          :value="modelValue.bankName"
          type="text"
          required
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold outline-none"
          placeholder="Örn: Ziraat Bankası"
          @input="$emit('update:modelValue', { ...modelValue, bankName: ($event.target as HTMLInputElement).value })"
        >
      </div>
      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Hesap Sahibi *</label>
        <input
          :value="modelValue.bankAccountName"
          type="text"
          required
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold outline-none"
          placeholder="Ad Soyad / Şirket Adı"
          @input="$emit('update:modelValue', { ...modelValue, bankAccountName: ($event.target as HTMLInputElement).value })"
        >
      </div>
      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">IBAN *</label>
        <input
          :value="modelValue.bankIban"
          type="text"
          required
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-mono outline-none"
          placeholder="TR00 0000 0000 0000 0000 0000 00"
          @input="$emit('update:modelValue', { ...modelValue, bankIban: ($event.target as HTMLInputElement).value })"
        >
      </div>
    </div>

    <!-- Category Selection -->
    <div>
      <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight mb-4 italic">Sektör Kategorileri *</h3>
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <label
          v-for="category in categories"
          :key="category.id"
          class="relative flex items-center p-4 border-2 rounded-2xl transition-all cursor-pointer group"
          :class="[
            modelValue.categories.includes(category.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-50 bg-white hover:border-gray-100'
          ]"
          data-testid="category-checkbox"
        >
          <input
            type="checkbox"
            :value="category.id"
            :checked="modelValue.categories.includes(category.id)"
            class="hidden"
            @change="toggleCategory(category.id)"
          >
          <div class="flex flex-col">
            <span class="text-[10px] font-black text-gray-900 uppercase tracking-tight">{{ category.name }}</span>
            <span v-if="modelValue.categories.includes(category.id)" class="text-[8px] text-primary-600 font-bold mt-0.5">SEÇİLDİ</span>
          </div>
          <div
            class="absolute top-2 right-2 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
            :class="[modelValue.categories.includes(category.id) ? 'bg-primary-600 border-primary-600' : 'border-gray-200']"
          >
            <span v-if="modelValue.categories.includes(category.id)" class="text-[8px] text-white font-black">✓</span>
          </div>
        </label>
      </div>
    </div>

    <!-- Restaurant-Specific Fields -->
    <div v-if="modelValue.vendorType === 'RESTAURANT'" class="space-y-6 pt-6 border-t border-gray-100">
      <div class="flex items-center gap-2 pb-4">
        <CakeIcon class="w-5 h-5 text-primary-500" />
        <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">Restoran Bilgileri</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mutfak Tipi *</label>
          <select
            :value="modelValue.cuisineType"
            required
            class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold outline-none"
            @change="$emit('update:modelValue', { ...modelValue, cuisineType: ($event.target as HTMLSelectElement).value })"
          >
            <option value="">Seçin</option>
            <option value="pizza">Pizza</option>
            <option value="burger">Burger</option>
            <option value="kebab">Kebap</option>
            <option value="doner">Döner</option>
            <option value="chinese">Çin Mutfağı</option>
            <option value="indian">Hint Mutfağı</option>
            <option value="thai">Tay Mutfağı</option>
            <option value="seafood">Deniz Ürünleri</option>
            <option value="cafe">Kafe</option>
            <option value="dessert">Tatlı</option>
            <option value="other">Diğer</option>
          </select>
        </div>

        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Teslimat Yarıçapı (km)</label>
          <input
            :value="modelValue.deliveryRadius"
            type="number"
            min="1"
            max="50"
            class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold outline-none"
            placeholder="Örn: 5"
            @input="$emit('update:modelValue', { ...modelValue, deliveryRadius: parseFloat(($event.target as HTMLInputElement).value) || null })"
          >
        </div>

        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Min. Sipariş Tutarı (TL)</label>
          <input
            :value="modelValue.minOrderAmount"
            type="number"
            min="0"
            step="0.01"
            class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold outline-none"
            placeholder="Örn: 100"
            @input="$emit('update:modelValue', { ...modelValue, minOrderAmount: parseFloat(($event.target as HTMLInputElement).value) || null })"
          >
        </div>

        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Ortalama Hazırlık Süresi (dk)</label>
          <input
            :value="modelValue.avgPrepTimeMinutes"
            type="number"
            min="5"
            max="120"
            class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold outline-none"
            placeholder="Örn: 25"
            @input="$emit('update:modelValue', { ...modelValue, avgPrepTimeMinutes: parseInt(($event.target as HTMLInputElement).value) || null })"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CakeIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  modelValue: any
  categories: any[]
}>()

const emit = defineEmits(['update:modelValue'])

const toggleCategory = (id: string) => {
  const next = [...props.modelValue.categories]
  const index = next.indexOf(id)
  if (index > -1) next.splice(index, 1)
  else next.push(id)
  emit('update:modelValue', { ...props.modelValue, categories: next })
}
</script>
