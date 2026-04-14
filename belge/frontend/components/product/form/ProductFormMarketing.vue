<script setup lang="ts">
import { RocketLaunchIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import type { ProductFormState, MarketingFlag } from '~/types/product-form'

interface Props {
  badgeText: string
  badgeColor: string
  metaTitle: string
  metaDescription: string
  handle: string
  flags: MarketingFlag[]
}

defineProps<Props>()
const form = defineModel<ProductFormState>('form', { required: true })
const emit = defineEmits([
  'update:badgeText',
  'update:badgeColor',
  'update:metaTitle',
  'update:metaDescription',
  'update:handle'
])
</script>

<template>
  <section
    id="marketing"
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
  >
    <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
      <div class="flex items-center space-x-3">
        <div class="bg-orange-100 p-2 rounded-lg">
          <RocketLaunchIcon class="h-5 w-5 text-orange-600" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">
          8. Pazarlama ve Görünürlük
        </h3>
      </div>
    </div>
    <div class="p-6 space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider">Ürün Rozeti (Badge)</label>
          <div class="flex gap-4">
            <div class="flex-1 space-y-3">
              <input
                :value="badgeText"
                type="text"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                placeholder="Flaş Ürün, Yeni!"
                @input="e => emit('update:badgeText', (e.target as HTMLInputElement).value)"
              >
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in ['Yeni', 'Fırsat', '%50 İndirim']"
                  :key="tag"
                  type="button"
                  class="text-[10px] font-bold px-3 py-1 bg-white border border-gray-200 rounded-full hover:border-blue-500 hover:text-blue-500 transition-all"
                  @click="emit('update:badgeText', tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
            <div class="w-24">
              <input
                :value="badgeColor"
                type="color"
                class="w-full h-11 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer"
                @input="e => emit('update:badgeColor', (e.target as HTMLInputElement).value)"
              >
              <span class="text-[9px] text-gray-400 block mt-1 text-center font-bold">{{ badgeColor }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider">Tanıtım Alanları</label>
          <div class="grid grid-cols-2 gap-3">
            <label
              v-for="flag in flags"
              :key="flag.key"
              :class="['flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all', form[flag.key] ? flag.activeClass : 'bg-white border-gray-100 hover:bg-gray-50']"
            >
              <input
                v-model="form[flag.key]"
                type="checkbox"
                :class="['h-4 w-4 rounded', flag.checkClass]"
              >
              <span class="text-[11px] font-black uppercase tracking-tight">{{ flag.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="pt-8 border-t border-gray-50 space-y-6">
        <div class="flex items-center space-x-3 mb-2">
          <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
          <h4 class="text-sm font-black text-gray-700 uppercase tracking-widest">
            Arama Motoru Optimizasyonu (SEO)
          </h4>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Meta Başlık</label>
            <input
              :value="metaTitle"
              type="text"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              @input="e => emit('update:metaTitle', (e.target as HTMLInputElement).value)"
            >
          </div>
          <div>
            <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">URL Uzantısı (Handle)</label>
            <input
              :value="handle"
              type="text"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              @input="e => emit('update:handle', (e.target as HTMLInputElement).value)"
            >
          </div>
        </div>
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Meta Açıklama</label>
          <textarea
            :value="metaDescription"
            rows="2"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            @input="e => emit('update:metaDescription', (e.target as HTMLTextAreaElement).value)"
          />
        </div>
      </div>
    </div>
  </section>
</template>
