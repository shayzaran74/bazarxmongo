<template>
  <div>
    <div class="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[3rem] p-10 mb-12 shadow-2xl">
      <div class="absolute inset-0 bg-black/10" />
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div class="absolute -bottom-20 -left-20 w-48 h-48 bg-pink-300/20 rounded-full blur-2xl" />

      <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div class="flex items-center gap-3 mb-3">
            <span class="p-3 bg-white/20 backdrop-blur-sm rounded-2xl text-3xl">🔍</span>
            <h1 class="text-4xl font-black text-white tracking-tight uppercase italic">
              İstek Listesi
            </h1>
          </div>
          <p class="text-white/80 text-sm font-medium max-w-lg">
            İstek Listesi
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <NuxtLink
            to="/"
            class="flex items-center justify-center gap-3 bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <PlusCircleIcon class="h-6 w-6" />
            <span>Ana Sayfaya Git</span>
          </NuxtLink>
        </div>
      </div>
    </div>
    <DashboardWantedItemsManager
      title="İstek Listesi"
      subtitle="Oluşturduğunuz alım ve satım taleplerini buradan düzenleyebilir veya kaldırabilirsiniz."
      @edit="openEditModal"
    />

    <!-- Edit Modal (Simplified) -->
    <TransitionRoot
      appear
      :show="isEditModalOpen"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-50"
        @close="closeEditModal"
      >
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-bold leading-6 text-gray-900 mb-4"
                >
                  İsteği Düzenle
                </DialogTitle>

                <form
                  class="space-y-4"
                  @submit.prevent="saveEdit"
                >
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea
                      v-model="editForm.description"
                      rows="3"
                      class="w-full rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Min
                        Bütçe</label>
                      <input
                        v-model="editForm.minPrice"
                        type="number"
                        class="w-full rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Max
                        Bütçe</label>
                      <input
                        v-model="editForm.maxPrice"
                        type="number"
                        class="w-full rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                      >
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tür</label>
                    <select
                      v-model="editForm.type"
                      class="w-full rounded-xl border-gray-200 text-sm"
                    >
                      <option value="PRODUCT">
                        Ürün
                      </option>
                      <option value="SERVICE">
                        Hizmet
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">İlan Tipi</label>
                    <select
                      v-model="editForm.listingType"
                      class="w-full rounded-xl border-gray-200 text-sm"
                    >
                      <option value="BUY">
                        Arıyorum (Alış)
                      </option>
                      <option value="SELL">
                        Sağlıyorum (Satış)
                      </option>
                    </select>
                  </div>


                  <div class="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                      @click="closeEditModal"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
                    >
                      Kaydet
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { useWantedItemService } from '~/services/api/WantedItemService'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

definePageMeta({
    layout: 'default'
})

const isEditModalOpen = ref(false)
const editForm = ref({})
const wantedItemService = useWantedItemService()

const openEditModal = (item) => {
    editForm.value = { ...item }
    isEditModalOpen.value = true
}

const closeEditModal = () => {
    isEditModalOpen.value = false
}

const saveEdit = async () => {
    try {
        const { id, description, minPrice, maxPrice, type, listingType } = editForm.value
        await wantedItemService.updateItem(String(id), { description, minPrice: Number(minPrice), maxPrice: Number(maxPrice), type, listingType })
        useNuxtApp().$toast?.success('Güncellendi')
        closeEditModal()
        // Here we might want to refresh the list in the child component. 
        // ideally reload page or use event bus/provide-inject. 
        // For now, reloading page or manual refresh is simplest.
        window.location.reload()
    } catch (e) {
        useNuxtApp().$toast?.error('Güncelleme hatası')
    }
}
</script>
