<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          Hediye Kartları
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Hediye kartlarını oluşturun ve yönetin
        </p>
      </div>
      <a
        href="/admin/gift-card-form"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Hediye Kartı Oluştur
      </a>
    </div>

    <!-- Empty State -->
    <div
      v-if="giftCards.length === 0 && !loading"
      class="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <EmptyState
        :icon="GiftIcon"
        title="Henüz hediye kartı satmaya başlamadınız"
        description="Şimdi veya hediye kartı ürünler ekleyerek hediye kartları oluşturun. Mağazalar değerlerini hediye kartları satın alırlar veya hediye olarak gönderirler"
        action-text="Hediye kartı oluştur"
        action-link="/admin/gift-card-form"
      />
    </div>

    <!-- Gift Cards Table -->
    <div
      v-else
      class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Kod
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Başlangıç Değeri
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Güncel Bakiye
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Müşteri
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Durum
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="card in giftCards"
            :key="card.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4">
              <div class="text-sm font-mono font-medium text-gray-900">
                {{ card.code }}
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">
              ₺{{ card.initialValue.toFixed(2) }}
            </td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">
              ₺{{ card.currentValue.toFixed(2) }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ card.customer?.email || 'Atanmamış' }}
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getStatusClass(card.status)
                ]"
              >
                {{ getStatusText(card.status) }}
              </span>
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium">
              <a
                :href="`/admin/gift-card-form?id=${card.id}`"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                Görüntüle
              </a>
              <button
                class="text-gray-400 hover:text-red-900 ml-4"
                title="Kalıcı Olarak Sil"
                @click="deleteCard(card.id)"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon, GiftIcon, TrashIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { $api } = useApi()
const giftCards = ref([])
const loading = ref(false)

const fetchGiftCards = async () => {
  loading.value = true
  try {
    const response = await $api('/api/admin/gift-cards')
    giftCards.value = response.data
  } catch (error) {
    console.error('Error fetching gift cards:', error)
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status) => {
  const classes = {
    Active: 'bg-green-100 text-green-800',
    Disabled: 'bg-gray-100 text-gray-800',
    Expired: 'bg-yellow-100 text-yellow-800',
    Used: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    Active: 'Aktif',
    Disabled: 'Devre Dışı',
    Expired: 'Süresi Dolmuş',
    Used: 'Kullanılmış'
  }
  return texts[status] || status
}

const deleteCard = async (id) => {
  if (!confirm('Bu hediye kartını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return

  try {
    await $api(`/api/admin/gift-cards/${id}/permanent`, {
      method: 'DELETE'
    })

    const toast = useNuxtApp().$toast
    toast.success('Hediye kartı başarıyla silindi')
    fetchGiftCards()
  } catch (error) {
    console.error('Error deleting gift card:', error)
    const toast = useNuxtApp().$toast
    toast.error('Silme işlemi sırasında bir hata oluştu')
  }
}

onMounted(() => {
  fetchGiftCards()
})
</script>
