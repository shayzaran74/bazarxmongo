<script setup lang="ts">
import { MegaphoneIcon, PlusIcon, ArrowLeftIcon, ArrowRightIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import SideAdColumn from '~/components/admin/settings/SideAdColumn.vue'
import SideAdFormModal from '~/components/admin/settings/SideAdFormModal.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useHead({ title: 'Yan Reklam Yönetimi - BazarX Admin' })

const { 
  loading, saving, localLeftAds, localRightAds, currentEcosystem,
  fetchAds, deleteAd, handleDragEnd 
} = useAdminSideAds()

const { $api } = useApi()
const { $toast } = useNuxtApp()

const modalOpen = ref(false)
const editingAd = ref<any | null>(null)

const handleEdit = (ad: any) => {
  editingAd.value = ad
  modalOpen.value = true
}

const handleAdd = () => {
  editingAd.value = null
  modalOpen.value = true
}

const handleSave = async (formData: any) => {
  try {
    const url = editingAd.value ? `/api/v1/admin/side-ads/${editingAd.value.id}` : '/api/v1/admin/side-ads'
    const method = editingAd.value ? 'PUT' : 'POST'
    await $api(url, { method, body: formData })
    $toast.success('Reklam kaydedildi')
    await fetchAds()
    modalOpen.value = false
  } catch (e) {
    $toast.error('Hata oluştu')
  }
}

onMounted(() => fetchAds())
</script>

<template>
  <div class="space-y-10">
    <!-- Premium Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-50/50">
      <div class="flex items-center gap-6">
        <div class="w-16 h-16 rounded-[2.5rem] bg-gray-900 flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-primary-600/30 to-transparent transition-transform duration-700 group-hover:scale-150"></div>
          <MegaphoneIcon class="w-8 h-8 relative z-10" />
        </div>
        <div>
          <h1 class="text-3xl font-black text-gray-900 italic tracking-tighter uppercase leading-none mb-2">
            {{ currentEcosystem === 'GLOBAL' ? '' : currentEcosystem + ' ' }}Yan Reklamlar
          </h1>
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Görünürlük ve Kampanya Yönetimi</p>
        </div>
      </div>

      <button 
        v-if="localLeftAds.length + localRightAds.length < 20"
        class="bg-gray-900 hover:bg-black text-white px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-gray-200 transition-all flex items-center gap-3 active:scale-95"
        @click="handleAdd"
      >
        <PlusIcon class="w-5 h-5" /> REKLAM EKLE
      </button>
    </div>

    <!-- Capacity Warning -->
    <div v-if="localLeftAds.length >= 10 || localRightAds.length >= 10" class="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
      <div class="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
        <ExclamationTriangleIcon class="w-6 h-6" />
      </div>
      <div>
        <h4 class="text-xs font-black text-amber-900 uppercase tracking-widest leading-none mb-1">Kapasite Sınırı</h4>
        <p class="text-[10px] font-bold text-amber-800/60 uppercase tracking-widest">Bir sütun için maksimum 10 reklam kuralı uygulanmaktadır.</p>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
       <SideAdColumn 
         v-model="localLeftAds" 
         side="LEFT" 
         title="Fırsat Alanı (Sol)" 
         :loading="loading"
         @edit="handleEdit"
         @delete="deleteAd"
         @dragEnd="handleDragEnd"
       >
         <template #icon><ArrowLeftIcon class="h-5 w-5 mr-3 text-orange-500" /></template>
       </SideAdColumn>

       <SideAdColumn 
         v-model="localRightAds" 
         side="RIGHT" 
         title="Reklam Alanı (Sağ)" 
         :loading="loading"
         @edit="handleEdit"
         @delete="deleteAd"
         @dragEnd="handleDragEnd"
       >
         <template #icon><ArrowRightIcon class="h-5 w-5 mr-3 text-purple-500" /></template>
       </SideAdColumn>
    </div>

    <!-- Form Modal -->
    <SideAdFormModal 
      v-model="modalOpen" 
      :editing-ad="editingAd"
      :current-ecosystem="currentEcosystem"
      @save="handleSave"
    />
  </div>
</template>
