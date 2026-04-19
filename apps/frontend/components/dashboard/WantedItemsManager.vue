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

      <!-- Filters for Admin -->
      <div
        v-if="isAdmin"
        class="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200"
      >
        <button
          :class="[currentFilter === 'PENDING' ? 'bg-white shadow-md text-orange-600' : 'text-gray-500 hover:text-gray-700']"
          class="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
          @click="currentFilter = 'PENDING'"
        >
          Onay Bekleyen
        </button>
        <button
          :class="[currentFilter === 'APPROVED' ? 'bg-white shadow-md text-green-600' : 'text-gray-500 hover:text-gray-700']"
          class="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
          @click="currentFilter = 'APPROVED'"
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

    <!-- content -->
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
        Bu filtrede gösterilecek istek yok.
      </p>
    </div>

    <div
      v-else
      class="overflow-x-auto"
    >
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="py-4 pl-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Tarih
            </th>
            <th class="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Kategori
            </th>
            <th class="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Açıklama
            </th>
            <th class="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Bütçe
            </th>
            <th class="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Durum
            </th>
            <th class="py-4 pr-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="item in items"
            :key="item.id"
            class="group hover:bg-gray-50/50 transition-colors"
          >
            <td class="py-4 pl-4 text-xs font-bold text-gray-500 whitespace-nowrap">
              {{ new Date(item.createdAt).toLocaleDateString('tr-TR') }}
            </td>
            <td class="py-4">
              <span
                class="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest rounded-full"
              >
                {{ item.category?.name || 'Genel' }}
              </span>
            </td>
            <td class="py-4 max-w-xs">
              <p
                class="text-sm font-medium text-gray-900 line-clamp-2"
                :title="item.description"
              >
                {{ item.description }}
              </p>
              <div class="flex flex-wrap gap-1 mt-1">
                <span
                  v-for="(k, i) in (item.keywords || []).slice(0, 3)"
                  :key="i"
                  class="text-[10px] text-gray-400"
                >#{{ k }}</span>
              </div>
            </td>
            <td class="py-4 text-sm font-bold text-gray-700 whitespace-nowrap">
              {{ formatPrice(item.minPrice) }} - {{ formatPrice(item.maxPrice) }}
            </td>
            <td class="py-4">
              <span
                v-if="item.status === 'APPROVED'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 border border-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-green-500" /> Onaylı
              </span>
              <span
                v-else-if="item.status === 'PENDING'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Bekliyor
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-red-500" /> Red
              </span>
            </td>
            <td class="py-4 pr-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <!-- Admin Actions -->
                <template v-if="isAdmin">
                  <button
                    v-if="item.status === 'PENDING' || item.status === 'REJECTED'"
                    class="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                    title="Onayla"
                    @click="updateStatus(item.id, 'APPROVED')"
                  >
                    <CheckCircleIcon class="w-5 h-5" />
                  </button>
                  <button
                    v-if="item.status === 'PENDING' || item.status === 'APPROVED'"
                    class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    title="Reddet"
                    @click="updateStatus(item.id, 'REJECTED')"
                  >
                    <XCircleIcon class="w-5 h-5" />
                  </button>
                </template>

                <!-- User Actions (Edit/Delete) -->
                <template v-if="!isAdmin">
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

                <button
                  v-if="isAdmin"
                  class="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                  @click="deleteItem(item.id)"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import {
    PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
    title: { type: String, default: 'İstek Takibi' },
    subtitle: { type: String, default: 'Oluşturduğunuz alım/satım taleplerini buradan yönetebilirsiniz.' },
    isAdmin: { type: Boolean, default: false },
    apiEndpoint: { type: String, default: '/api/wanted-items/me' }
})

defineEmits(['edit'])

const config = useRuntimeConfig()
const authStore = useAuthStore()
const items = ref([])
const loading = ref(false)
const currentFilter = ref('PENDING')

const formatPrice = (p) => {
    if (!p) return '?'
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(p)
}

const fetchData = async () => {
    loading.value = true
    try {
        const params = props.isAdmin ? { status: currentFilter.value } : {}
        const res = await $fetch(props.apiEndpoint, {
            baseURL: config.public.apiBase,
            headers: { Authorization: `Bearer ${authStore.token}` },
            params
        })
        if (res.success) {
            items.value = res.data
        }
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const deleteItem = async (id) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    try {
        const endpoint = props.isAdmin ? `/api/admin/wanted-items/${id}` : `/api/wanted-items/${id}`
        await $fetch(endpoint, {
            method: 'DELETE',
            baseURL: config.public.apiBase,
            headers: { Authorization: `Bearer ${authStore.token}` }
        })
        useNuxtApp().$toast?.success('Silindi')
        fetchData()
    } catch (e) {
        useNuxtApp().$toast?.error('Hata oluştu')
    }
}

const updateStatus = async (id, status) => {
    try {
        await $fetch(`/api/admin/wanted-items/${id}/status`, {
            method: 'PATCH',
            baseURL: config.public.apiBase,
            headers: { Authorization: `Bearer ${authStore.token}` },
            body: { status }
        })
        useNuxtApp().$toast?.success('Durum güncellendi')
        fetchData()
    } catch (e) {
        useNuxtApp().$toast?.error('Hata oluştu')
    }
}

watch(currentFilter, () => {
    if (props.isAdmin) fetchData()
})

onMounted(() => {
    fetchData()
})
</script>
