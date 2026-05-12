<script setup lang="ts">
import { ClockIcon, FireIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'

interface Props {
  ingredients: string[]
  preparationTime: number
  calories: number
}

defineProps<Props>()
const emit = defineEmits(['update:ingredients', 'update:preparationTime', 'update:calories'])
</script>

<template>
  <section
    id="restaurant-attributes"
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
  >
    <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-orange-50/50">
      <div class="flex items-center space-x-3">
        <div class="bg-orange-100 p-2 rounded-lg">
          <ClipboardDocumentListIcon class="h-5 w-5 text-orange-600" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">
          3b. Restoran Özel Özellikleri
        </h3>
      </div>
      <span class="text-[10px] font-black tracking-widest text-orange-500 uppercase">Menü Detayları</span>
    </div>
    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
            <ClockIcon class="h-4 w-4 inline mr-1" />
            Hazırlama Süresi (dk)
          </label>
          <div class="relative">
            <input
              :value="preparationTime"
              type="number"
              class="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="15"
              @input="e => emit('update:preparationTime', Number((e.target as HTMLInputElement).value))"
            >
            <span class="absolute right-3 top-3.5 text-[10px] font-bold text-blue-400">DK</span>
          </div>
        </div>
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
            <FireIcon class="h-4 w-4 inline mr-1" />
            Kalori
          </label>
          <div class="relative">
            <input
              :value="calories"
              type="number"
              class="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500"
              placeholder="450"
              @input="e => emit('update:calories', Number((e.target as HTMLInputElement).value))"
            >
            <span class="absolute right-3 top-3.5 text-[10px] font-bold text-orange-400">KCAL</span>
          </div>
        </div>
        <div class="md:col-span-1">
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Malzemeler</label>
          <div class="space-y-1.5 max-h-24 overflow-y-auto">
            <div
              v-for="(ing, idx) in ingredients"
              :key="idx"
              class="flex items-center gap-2"
            >
              <span class="w-6 h-6 bg-orange-100 text-orange-600 text-[10px] font-black rounded-full flex items-center justify-center">{{ idx + 1 }}</span>
              <input
                :value="ing"
                type="text"
                class="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                placeholder="Malzeme adı"
                @input="e => {
                  const newIngredients = [...ingredients]
                  newIngredients[idx] = (e.target as HTMLInputElement).value
                  emit('update:ingredients', newIngredients)
                }"
              >
            </div>
            <button
              type="button"
              class="w-full py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors"
              @click="emit('update:ingredients', [...ingredients, ''])"
            >
              + Malzeme Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>