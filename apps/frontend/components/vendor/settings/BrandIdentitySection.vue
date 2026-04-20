<script setup lang="ts">
import { PhotoIcon, UserCircleIcon, LinkIcon, CloudArrowUpIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  form: any
}>()

const emit = defineEmits(['upload'])

const handleFile = (e: Event, type: string) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) emit('upload', file, type)
}
</script>

<template>
  <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-8 border-b border-gray-50 flex items-center justify-between">
      <h2 class="text-xl font-black text-gray-900 italic tracking-tighter uppercase">Marka Kimliği</h2>
      <div class="px-3 py-1 bg-gray-50 rounded-lg text-[8px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">Profil & Vitrin</div>
    </div>

    <div class="p-10 space-y-10">
      <!-- Image Previews -->
      <div class="space-y-6">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">MAĞAZA GÖRÜNÜM ÖNİZLEMESİ</label>
        <div class="relative group">
          <div class="h-56 w-full rounded-[2rem] overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 relative">
            <img v-if="form.coverImageUrl" :src="form.coverImageUrl" class="w-full h-full object-cover">
            <div v-else class="flex flex-col items-center justify-center h-full text-gray-300">
              <PhotoIcon class="h-10 w-10 mb-2 opacity-20" />
              <span class="text-[10px] font-black uppercase tracking-widest">Kapak görseli eklenmemiş</span>
            </div>
            
            <div class="absolute -bottom-6 left-10 h-28 w-28 rounded-[1.5rem] bg-white p-1 shadow-2xl border-4 border-white overflow-hidden group/logo">
              <img v-if="form.logoUrl" :src="form.logoUrl" class="w-full h-full object-contain rounded-xl">
              <div v-else class="h-full w-full flex items-center justify-center bg-gray-50 text-gray-200">
                <UserCircleIcon class="h-12 w-12" />
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-10">
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">LOGO (1:1)</label>
            <div class="flex gap-3">
              <input v-model="form.logoUrl" type="text" placeholder="Görsel URL..." class="flex-1 px-5 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none">
              <label class="cursor-pointer bg-gray-900 text-white p-4 rounded-2xl shadow-xl hover:bg-black transition-all">
                <CloudArrowUpIcon class="h-5 w-5" />
                <input type="file" class="hidden" accept="image/*" @change="handleFile($event, 'logo')">
              </label>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">KAPAK (4:1)</label>
            <div class="flex gap-3">
              <input v-model="form.coverImageUrl" type="text" placeholder="Görsel URL..." class="flex-1 px-5 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none">
              <label class="cursor-pointer bg-gray-900 text-white p-4 rounded-2xl shadow-xl hover:bg-black transition-all">
                <CloudArrowUpIcon class="h-5 w-5" />
                <input type="file" class="hidden" accept="image/*" @change="handleFile($event, 'banner')">
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">MAĞAZA ADI</label>
          <input v-model="form.businessName" type="text" class="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl text-sm font-black italic tracking-tighter focus:ring-4 focus:ring-primary-500/10 transition-all outline-none" required>
        </div>
        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">MAĞAZA AÇIKLAMASI (BIO)</label>
          <textarea v-model="form.description" rows="4" placeholder="Müşterilerinize hikayenizi anlatın..." class="w-full px-6 py-5 bg-gray-50 border-none rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none" />
        </div>
      </div>
    </div>
  </div>
</template>
