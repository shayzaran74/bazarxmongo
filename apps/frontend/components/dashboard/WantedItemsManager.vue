<template>
  <div class="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900 flex items-center gap-3">
          <span class="text-3xl">📋</span>
          {{ title }}
        </h2>
        <p class="text-gray-500 text-sm mt-1">
          {{ subtitle }}
        </p>
      </div>

      <!-- Admin filtreleri -->
      <div
        v-if="isAdmin"
        class="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200"
      >
        <button
          :class="[currentFilter === 'PENDING_APPROVAL' ? 'bg-white shadow-md text-orange-600' : 'text-gray-500 hover:text-gray-700']"
          class="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
          @click="currentFilter = 'PENDING_APPROVAL'"
        >
          Onay Bekleyen
        </button>
        <button
          :class="[currentFilter === 'ACTIVE' ? 'bg-white shadow-md text-green-600' : 'text-gray-500 hover:text-gray-700']"
          class="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
          @click="currentFilter = 'ACTIVE'"
        >
          Onaylanan
        </button>
        <button
          :class="[currentFilter === 'REJECTED' ? 'bg-white shadow-md text-red-600' : 'text-gray-500 hover:text-gray-700']"
          class="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
          @click="currentFilter = 'REJECTED'"
        >
          Reddedilen
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="flex justify-center py-12"
    >
      <div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>

    <div
      v-else-if="items.length === 0"
      class="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200"
    >
      <div class="text-4xl mb-3">
        📭
      </div>
      <h3 class="text-lg font-bold text-gray-900">
        Kayıt Bulunamadı
      </h3>
      <p class="text-gray-500 text-sm">
        Bu filtrede gösterilecek ilan yok.
      </p>
    </div>

    <div
      v-else
      class="overflow-x-auto"
    >
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="py-4 pl-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Görsel</th>
            <th class="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tarih</th>
            <th class="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategori</th>
            <th class="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Açıklama</th>
            <th class="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bütçe</th>
            <th class="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Durum</th>
            <th class="py-4 pr-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="item in items"
            :key="item.id"
            class="group hover:bg-gray-50/50 transition-colors"
          >
            <td class="py-4 pl-4">
              <div class="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-100">
                <img
                  v-if="item.images && item.images.length > 0"
                  :src="item.images[0]"
                  class="h-full w-full object-cover"
                >
                <div v-else class="h-full w-full flex items-center justify-center text-[10px] text-gray-400">
                  Resim Yok
                </div>
              </div>
            </td>
            <td class="py-4 text-xs font-bold text-gray-500 whitespace-nowrap">
              {{ new Date(item.createdAt).toLocaleDateString('tr-TR') }}
            </td>
            <td class="py-4">
              <span class="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                {{ item.category || 'Genel' }}
              </span>
            </td>
            <td class="py-4 max-w-xs">
              <p class="text-sm font-medium text-gray-900 line-clamp-2" :title="item.description">
                {{ item.title || item.description }}
              </p>
            </td>
            <td class="py-4 text-sm font-bold text-gray-700 whitespace-nowrap">
              {{ formatPrice(item.unitPrice) }}
            </td>
            <td class="py-4">
              <span
                v-if="item.status === 'ACTIVE'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 border border-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-green-500" /> Yayında
              </span>
              <span
                v-else-if="item.status === 'PENDING_APPROVAL'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Onay Bekliyor
              </span>
              <span
                v-else-if="item.status === 'REJECTED'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-red-500" /> Reddedildi
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest"
              >
                {{ item.status }}
              </span>
            </td>
            <td class="py-4 pr-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <template v-if="isAdmin">
                  <button
                    v-if="item.status === 'PENDING_APPROVAL'"
                    class="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                    title="Onayla"
                    @click="approveItem(item.id)"
                  >
                    <CheckCircleIcon class="w-5 h-5" />
                  </button>
                  <button
                    v-if="item.status === 'PENDING_APPROVAL' || item.status === 'ACTIVE'"
                    class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    title="Reddet"
                    @click="rejectItem(item.id)"
                  >
                    <XCircleIcon class="w-5 h-5" />
                  </button>
                  <button
                    class="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                    @click="deleteItem(item.id)"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </template>

                <template v-else>
                  <button
                    class="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    title="Düzenle"
                    @click="$emit('edit', item)"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    class="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Sil"
                    @click="deleteItem(item.id)"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import type { SurplusItem } from '~/types/surplus'

const props = withDefaults(defineProps<{
  title?:       string
  subtitle?:    string
  isAdmin?:     boolean
  apiEndpoint?: string
}>(), {
  title:       'İstek Takibi',
  subtitle:    'Oluşturduğunuz alım/satım taleplerini buradan yönetebilirsiniz.',
  isAdmin:     false,
  apiEndpoint: '/api/v1/surplus',
})

defineEmits<{ edit: [item: SurplusItem] }>()

const { $api } = useApi()
const items         = ref<SurplusItem[]>([])
const loading       = ref(false)
const currentFilter = ref<string>('PENDING_APPROVAL')

const formatPrice = (p: string | number | null | undefined): string => {
  if (!p) return '?'
  return new Intl.NumberFormat('tr-TR', {
    style:                 'currency',
    currency:              'TRY',
    maximumFractionDigits: 0,
  }).format(Number(p))
}

const fetchData = async (): Promise<void> => {
  loading.value = true
  try {
    const query = props.isAdmin ? { status: currentFilter.value } : {}
    const res = await $api<{ success: boolean; items?: SurplusItem[]; data?: SurplusItem[] }>(
      props.apiEndpoint ?? '/api/v1/surplus',
      { query },
    )
    if (res.success) {
      items.value = res.items ?? res.data ?? []
    }
  } finally {
    loading.value = false
  }
}

const approveItem = async (id: string): Promise<void> => {
  try {
    await $api(`/api/v1/surplus/${id}/status`, {
      method: 'PATCH',
      body:   { status: 'ACTIVE' },
    })
    useNuxtApp().$toast?.success('İlan onaylandı')
    await fetchData()
  } catch {
    useNuxtApp().$toast?.error('Hata oluştu')
  }
}

const rejectItem = async (id: string): Promise<void> => {
  const reason = prompt('Red gerekçesi girin:')
  if (!reason?.trim()) return
  try {
    await $api(`/api/v1/surplus/${id}/reject`, {
      method: 'POST',
      body:   { reason },
    })
    useNuxtApp().$toast?.success('İlan reddedildi')
    await fetchData()
  } catch {
    useNuxtApp().$toast?.error('Hata oluştu')
  }
}

const deleteItem = async (id: string): Promise<void> => {
  if (!confirm('Silmek istediğinize emin misiniz?')) return
  try {
    await $api(`/api/v1/surplus/${id}`, { method: 'DELETE' })
    useNuxtApp().$toast?.success('Silindi')
    await fetchData()
  } catch {
    useNuxtApp().$toast?.error('Hata oluştu')
  }
}

watch(currentFilter, () => {
  if (props.isAdmin) fetchData()
})

onMounted(fetchData)
</script>
