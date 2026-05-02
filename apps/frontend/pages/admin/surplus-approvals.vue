<template>
  <div class="py-8">
    <h1 class="text-3xl font-black text-gray-900 uppercase tracking-tightest mb-8">
      İLAN ONAY PANELİ
    </h1>

    <div class="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin h-8 w-8 border-4 border-gray-200 border-t-primary-600 rounded-full mx-auto mb-4" />
        <p class="text-xs font-black text-gray-400 uppercase tracking-widest">Yükleniyor...</p>
      </div>

      <div v-else-if="items.length === 0" class="p-12 text-center">
        <p class="text-gray-500 font-bold">Onay bekleyen ilan bulunmuyor.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Görsel</th>
              <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Başlık</th>
              <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Firma</th>
              <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Miktar</th>
              <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">İşlem</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="item in items"
              :key="item.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-6 py-4">
                <img
                  :src="item.images && item.images[0] ? item.images[0] : '/placeholder.jpg'"
                  class="w-12 h-12 rounded-lg object-cover bg-gray-100"
                >
              </td>
              <td class="px-6 py-4">
                <div class="font-bold text-gray-900 text-sm">{{ item.title }}</div>
                <div class="text-xs text-gray-500">{{ item.category }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="font-bold text-gray-900 text-xs">{{ item.company?.name ?? '—' }}</div>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-600">
                {{ item.quantity }} {{ item.unit }}
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button
                    class="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-200 transition-colors"
                    @click="selectedItem = item"
                  >
                    İncele
                  </button>
                  <button
                    :disabled="processing === item.id"
                    class="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-green-200 transition-colors disabled:opacity-50"
                    @click="approveItem(item.id)"
                  >
                    {{ processing === item.id ? '...' : 'Onayla' }}
                  </button>
                  <button
                    :disabled="processing === item.id"
                    class="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-100 transition-colors disabled:opacity-50"
                    @click="rejectItem(item.id)"
                  >
                    Reddet
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detay Modal -->
    <div v-if="selectedItem" class="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/80 backdrop-blur-md" @click="selectedItem = null" />
      <div class="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div class="p-8 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-2xl font-black text-gray-900 uppercase italic">İLAN DETAYLARI</h2>
          <button class="p-2 hover:bg-gray-100 rounded-xl" @click="selectedItem = null">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="p-8 overflow-y-auto space-y-8">
          <div class="grid grid-cols-2 gap-4">
            <img
              v-for="img in selectedItem.images"
              :key="img"
              :src="img"
              class="aspect-square rounded-2xl object-cover border"
            >
          </div>
          <div class="space-y-4">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">BAŞLIK</p>
              <p class="text-xl font-black text-gray-900">{{ selectedItem.title }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">MİKTAR</p>
                <p class="text-sm font-bold">{{ selectedItem.quantity }} {{ selectedItem.unit }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">KONUM</p>
                <p class="text-sm font-bold">{{ selectedItem.location ?? '—' }}</p>
              </div>
            </div>
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">AÇIKLAMA</p>
              <p class="text-sm text-gray-600">{{ selectedItem.description ?? '—' }}</p>
            </div>
            <div v-if="selectedItem.wantedCategories?.length" class="space-y-2">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">ARANAN KATEGORİLER</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="cat in selectedItem.wantedCategories"
                  :key="cat"
                  class="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-black"
                >{{ cat }}</span>
              </div>
            </div>
            <div v-if="selectedItem.technicalSpecs" class="space-y-2">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">TEKNİK ÖZELLİKLER</p>
              <div class="bg-gray-50 rounded-2xl p-4 space-y-2">
                <div
                  v-for="(val, key) in selectedItem.technicalSpecs"
                  :key="key"
                  class="flex justify-between text-xs"
                >
                  <span class="font-black text-gray-400 uppercase">{{ key }}</span>
                  <span class="font-bold text-gray-900">{{ val }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-8 bg-gray-50 border-t flex gap-4">
          <button
            class="flex-1 bg-green-600 text-white rounded-2xl py-4 font-black uppercase text-xs"
            @click="approveItem(selectedItem.id); selectedItem = null"
          >
            ONAYLA
          </button>
          <button
            class="flex-1 bg-red-600 text-white rounded-2xl py-4 font-black uppercase text-xs"
            @click="rejectItem(selectedItem.id); selectedItem = null"
          >
            REDDET
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import type { SurplusItem } from '~/types/surplus'

definePageMeta({
  layout:     'admin',
  middleware: ['admin'],
})

const { $api } = useApi()
const items       = ref<SurplusItem[]>([])
const loading     = ref(true)
const processing  = ref<string | null>(null)
const selectedItem = ref<SurplusItem | null>(null)

const fetchPendingItems = async (): Promise<void> => {
  loading.value  = true
  items.value    = []
  try {
    const response = await $api<{ success: boolean; items?: SurplusItem[]; data?: SurplusItem[] }>(
      '/api/v1/surplus',
      { query: { status: 'PENDING_APPROVAL' } },
    )
    if (response.success) {
      items.value = response.items ?? response.data ?? []
    }
  } finally {
    loading.value = false
  }
}

const approveItem = async (id: string): Promise<void> => {
  if (!confirm('Bu ilanı onaylamak istediğinize emin misiniz?')) return
  processing.value = id
  try {
    const response = await $api<{ success: boolean }>(`/api/v1/surplus/${id}/status`, {
      method: 'PATCH',
      body:   { status: 'ACTIVE' },
    })
    if (response.success) {
      useNuxtApp().$toast.success('İlan onaylandı.')
      items.value = items.value.filter(i => i.id !== id)
    }
  } catch {
    useNuxtApp().$toast.error('İşlem başarısız.')
  } finally {
    processing.value = null
  }
}

const rejectItem = async (id: string): Promise<void> => {
  const reason = prompt('Red gerekçesi girin:')
  if (!reason?.trim()) return
  processing.value = id
  try {
    const response = await $api<{ success: boolean }>(`/api/v1/surplus/${id}/reject`, {
      method: 'POST',
      body:   { reason },
    })
    if (response.success) {
      useNuxtApp().$toast.info('İlan reddedildi.')
      items.value = items.value.filter(i => i.id !== id)
    }
  } catch {
    useNuxtApp().$toast.error('İşlem başarısız.')
  } finally {
    processing.value = null
  }
}

onMounted(fetchPendingItems)
</script>
