<template>
  <div class="p-8 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <TicketIcon class="h-8 w-8 text-primary-600" />
          Kupon Yönetimi
        </h1>
        <p class="text-gray-600 mt-1">
          İndirim kuponlarını oluşturun ve yönetin
        </p>
      </div>
      <button
        class="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-all font-bold flex items-center shadow-lg shadow-primary-200"
        @click="openModal()"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Yeni Kupon Oluştur
      </button>
    </div>

    <!-- Coupons Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div
        v-if="loading"
        class="p-12 flex flex-col items-center justify-center"
      >
        <div class="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full mb-4" />
        <p class="text-gray-500 font-medium">
          Kuponlar yükleniyor...
        </p>
      </div>

      <div
        v-else-if="coupons.length === 0"
        class="p-12 text-center"
      >
        <div class="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <TicketIcon class="h-10 w-10 text-gray-300" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">
          Henüz kupon yok
        </h3>
        <p class="text-gray-500 mt-1">
          İlk indirim kuponunuzu oluşturmak için yukarıdaki butona tıklayın.
        </p>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                KUPON KODU
              </th>
              <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                TÜR / DEĞER
              </th>
              <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                MİN. TUTAR
              </th>
              <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                KULLANIM
              </th>
              <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                DURUM
              </th>
              <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                İŞLEMLER
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="coupon in coupons"
              :key="coupon.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-6 py-4">
                <span class="font-black text-gray-900 tracking-wider bg-gray-100 px-3 py-1 rounded-lg">{{ coupon.code
                }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-900">
                    {{ coupon.type === 'PERCENTAGE' ? '%' + coupon.value : formatPrice(coupon.value) }}
                  </span>
                  <span class="text-[10px] text-gray-500 font-bold uppercase">{{ coupon.type === 'PERCENTAGE' ?
                    'Yüzdesel' : 'Sabit' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-600">
                {{ formatPrice(coupon.minAmount || 0) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      class="bg-primary-500 h-full"
                      :style="{ width: coupon.usageLimit ? (coupon.usedCount / coupon.usageLimit * 100) + '%' : '0%' }"
                    />
                  </div>
                  <span class="text-[10px] font-bold text-gray-500">{{ coupon.usedCount }}{{ coupon.usageLimit ? ' / ' +
                    coupon.usageLimit : '' }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                  :class="coupon.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
                >
                  {{ coupon.isActive ? 'AKTİF' : 'PASİF' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  class="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  @click="deleteCoupon(coupon.id)"
                >
                  <TrashIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Coupon Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm shadow-2xl"
    >
      <div class="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
        <div
          class="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-primary-50 to-white"
        >
          <h2 class="text-xl font-black text-gray-900 tracking-tight">
            Yeni Kupon Oluştur
          </h2>
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="showModal = false"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <div class="p-8 space-y-6">
          <!-- Code -->
          <div class="space-y-1">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kupon Kodu</label>
            <input
              v-model="form.code"
              type="text"
              class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 uppercase tracking-widest"
              placeholder="YAZFIRRSATI20"
            >
          </div>

          <!-- Type and Value -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kupon Türü</label>
              <select
                v-model="form.type"
                class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="PERCENTAGE">
                  Yüzdesel (%)
                </option>
                <option value="FIXED">
                  Sabit Tutar (TL)
                </option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">İndirim Değeri</label>
              <input
                v-model.number="form.value"
                type="number"
                class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                placeholder="20"
              >
            </div>
          </div>

          <!-- Limits -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Min. Sepet
                Tutarı</label>
              <input
                v-model.number="form.minAmount"
                type="number"
                class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                placeholder="500"
              >
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kullanım Limiti</label>
              <input
                v-model.number="form.usageLimit"
                type="number"
                class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                placeholder="Sınırsız için boş bırakın"
              >
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Son Geçerlilik
              Tarihi</label>
            <input
              v-model="form.endDate"
              type="date"
              class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
            >
          </div>
        </div>

        <div class="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            class="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            @click="showModal = false"
          >
            İptal
          </button>
          <button
            :disabled="saving || !form.code || !form.value"
            class="flex-[2] bg-primary-600 text-white px-6 py-4 rounded-2xl hover:bg-primary-700 transition-all font-bold shadow-lg shadow-primary-200 disabled:opacity-50"
            @click="saveCoupon"
          >
            <span v-if="saving">Kaydediliyor...</span>
            <span v-else>Kuponu Oluştur</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { TicketIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { $api } = useApi()
const toast = useNuxtApp().$toast

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const coupons = ref([])

const form = ref({
  code: '',
  type: 'PERCENTAGE',
  value: 0,
  minAmount: 0,
  maxDiscount: null,
  usageLimit: null,
  endDate: null
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const fetchCoupons = async () => {
  loading.value = true
  try {
    const data = await $api('/api/coupons')
    if (data.success) {
      coupons.value = data.data || []
    }
  } catch (error) {
    console.error('Fetch coupons error:', error)
    toast.error('Kuponlar yüklenirken bir hata oluştu')
  } finally {
    loading.value = false
  }
}

const openModal = () => {
  form.value = {
    code: '',
    type: 'PERCENTAGE',
    value: 0,
    minAmount: 0,
    maxDiscount: null,
    usageLimit: null,
    endDate: null
  }
  showModal.value = true
}

const saveCoupon = async () => {
  saving.value = true
  try {
    const data = await $api('/api/coupons', {
      method: 'POST',
      body: form.value
    })
    if (data.success) {
      toast.success('Kupon başarıyla oluşturuldu')
      showModal.value = false
      fetchCoupons()
    }
  } catch (error) {
    toast.error(error.data?.error || 'Kupon oluşturulamadı')
  } finally {
    saving.value = false
  }
}

const deleteCoupon = async (id) => {
  if (!confirm('Bu kuponu silmek istediğinize emin misiniz?')) return
  try {
    const data = await $api(`/api/coupons/${id}`, {
      method: 'DELETE'
    })
    if (data.success) {
      toast.success('Kupon silindi')
      fetchCoupons()
    }
  } catch (error) {
    toast.error('Kupon silinirken bir hata oluştu')
  }
}

onMounted(() => {
  fetchCoupons()
})
</script>

<style scoped>
@keyframes scale-up {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-up {
  animation: scale-up 0.2s ease-out;
}
</style>
