<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-3xl shadow-xl max-w-lg w-full overflow-hidden">
        <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditing ? 'Markayı Düzenle' : 'Yeni Marka Ekle' }}
          </h2>
          <button
            class="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-all"
            @click="$emit('close')"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <form class="p-8 space-y-6" @submit.prevent="$emit('save')">
          <div class="grid grid-cols-2 gap-6">
            <div class="col-span-2">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Marka Adı</label>
              <input
                :value="modelValue.name"
                type="text"
                required
                class="w-full px-5 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                placeholder="Örn: Apple"
                @input="$emit('update:modelValue', { ...modelValue, name: $event.target.value }); $emit('generate-slug')"
              >
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Slug</label>
              <input
                :value="modelValue.slug"
                type="text"
                required
                class="w-full px-5 py-3 border border-gray-200 rounded-2xl bg-gray-50 outline-none text-xs font-mono"
                placeholder="apple"
                @input="$emit('update:modelValue', { ...modelValue, slug: $event.target.value })"
              >
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Sıralama</label>
              <input
                :value="modelValue.order"
                type="number"
                class="w-full px-5 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                @input="$emit('update:modelValue', { ...modelValue, order: Number($event.target.value) })"
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="col-span-2">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Logo (Görsel veya URL)</label>
              <div class="flex gap-2">
                <input
                  :value="modelValue.image"
                  type="text"
                  class="flex-1 px-5 py-3 border border-gray-200 rounded-2xl outline-none text-xs"
                  placeholder="https://example.com/logo.png"
                  @input="$emit('update:modelValue', { ...modelValue, image: $event.target.value })"
                >
                <label class="cursor-pointer bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-200 px-4 rounded-2xl shadow-sm transition-all flex items-center justify-center">
                  <CloudArrowUpIcon class="h-6 w-6 text-blue-600" />
                  <input
                    type="file"
                    class="hidden"
                    accept="image/*"
                    @change="handleFileUpload"
                  >
                </label>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div v-if="modelValue.image" class="p-4 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
            <img :src="resolveImageUrl(modelValue.image)" class="w-20 h-20 object-contain rounded-2xl bg-white p-2 shadow-sm">
            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Logo Önizlemesi</p>
              <p class="text-xs text-gray-500 truncate">{{ modelValue.image }}</p>
            </div>
          </div>

          <div class="flex items-center gap-6">
            <div class="flex-1 flex items-center p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <input
                id="isPopularForm"
                :checked="modelValue.isPopular"
                type="checkbox"
                class="w-6 h-6 text-amber-600 rounded-lg cursor-pointer border-amber-200 focus:ring-amber-500"
                @change="$emit('update:modelValue', { ...modelValue, isPopular: $event.target.checked })"
              >
              <label for="isPopularForm" class="ml-4 text-sm font-bold text-amber-900 cursor-pointer">Popüler Marka</label>
            </div>
            
            <div class="flex-1">
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest text-center">Durum</label>
              <select
                :value="modelValue.status"
                class="w-full px-4 py-3 border border-gray-200 rounded-2xl text-xs font-bold outline-none cursor-pointer hover:bg-gray-50 transition-all text-center"
                @change="$emit('update:modelValue', { ...modelValue, status: $event.target.value })"
              >
                <option value="APPROVED">Onaylı</option>
                <option value="PENDING">Beklemede</option>
                <option value="REJECTED">Reddedildi</option>
              </select>
            </div>
          </div>

          <div class="pt-4 flex gap-4">
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 transition-all shadow-lg shadow-blue-200"
            >
              {{ saving ? 'Kaydediliyor...' : (isEditing ? 'Güncelle' : 'Marka Ekle') }}
            </button>
            <button
              type="button"
              class="px-8 py-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
              @click="$emit('close')"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: Boolean,
  isEditing: Boolean,
  modelValue: Object,
  saving: Boolean
})

const emit = defineEmits(['close', 'save', 'update:modelValue', 'generate-slug'])

const { resolveImageUrl } = useAppImage()
const { $api } = useApi()
const toast = useNuxtApp().$toast

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const data = new FormData()
  data.append('file', file)

  try {
    toast.info('Görsel yükleniyor...')
    const response = await $api('/api/upload?type=logo', {
      method: 'POST',
      body: data
    })

    if (response.success) {
      emit('update:modelValue', { ...props.modelValue, image: response.url })
      toast.success('Logo başarıyla yüklendi')
    }
  } catch (error) {
    toast.error('Görsel yüklenirken bir hata oluştu')
  }
}
</script>
