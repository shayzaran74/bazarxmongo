<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Cüzdan Denetimi & Mutabakat
        </h1>
        <p class="text-gray-600">
          Sistem genelinde cüzdan bakiyelerini ve işlemlerini denetleyin
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <label class="flex items-center space-x-2 text-sm text-gray-700 select-none cursor-pointer">
          <input
            v-model="autoSuspend"
            type="checkbox"
            class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
          <span>Otomatik Dondur (Şüpheli Hesaplar)</span>
        </label>
        <button
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          @click="runReconciliation"
        >
          <ArrowPathIcon
            v-if="!loading"
            class="-ml-1 mr-2 h-5 w-5"
            :class="{ 'animate-spin': loading }"
            aria-hidden="true"
          />
          <svg
            v-else
            class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ loading ? 'Denetleniyor...' : 'Denetimi Başlat' }}
        </button>
      </div>
    </div>

    <!-- Results Area -->
    <div
      v-if="result"
      class="bg-white shadow rounded-lg p-6 animate-fade-in-up"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium leading-6 text-gray-900">
          Denetim Sonuçları
        </h3>
        <span
          :class="result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
          class="px-3 py-1 text-xs font-semibold rounded-full"
        >
          {{ result.success ? 'Başarılı' : 'Sorun Tespit Edildi' }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p class="text-sm text-gray-500 font-medium">
            Kontrol Edilen Hesaplar
          </p>
          <p class="text-2xl font-bold text-gray-900 mt-1">
            {{ result.data?.stats?.totalAccounts || 0 }}
          </p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p class="text-sm text-gray-500 font-medium">
            Sorunlu Hesaplar
          </p>
          <p
            class="text-2xl font-bold mt-1"
            :class="result.data?.stats?.issuesCount > 0 ? 'text-red-600' : 'text-gray-900'"
          >
            {{
              result.data?.stats?.issuesCount || 0 }}
          </p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p class="text-sm text-gray-500 font-medium">
            İşlem Durumu
          </p>
          <p class="text-lg font-medium text-gray-900 mt-1">
            {{ result.message }}
          </p>
        </div>
      </div>

      <!-- Discrepancies Table -->
      <div v-if="result.data?.discrepancies?.length > 0">
        <h4 class="text-md font-medium text-gray-900 mb-3 flex items-center">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-500 mr-2" />
          Tespit Edilen Uyumsuzluklar
        </h4>
        <div class="overflow-x-auto border border-gray-200 rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hesap Tipi
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sorun Tipi
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detaylar
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(disc, idx) in result.data.discrepancies"
                :key="idx"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="font-medium">
                    {{ disc.userEmail }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ disc.userId }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ disc.accountType }}
                  </span>
                  <span class="ml-2 text-xs text-gray-400">{{ disc.currency }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                  <div
                    v-for="(issue, i) in disc.issues"
                    :key="i"
                  >
                    {{ issue.type }}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <div
                    v-for="(issue, i) in disc.issues"
                    :key="i"
                    class="mb-1"
                  >
                    <span class="font-medium text-gray-700">Beklenen:</span> {{ issue.expected }} <br>
                    <span class="font-medium text-gray-700">Mevcut:</span> {{ issue.actual }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    v-if="disc.actionTaken === 'FROZEN'"
                    class="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-200"
                  >
                    DONDURULDU
                  </span>
                  <span
                    v-else
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200"
                  >
                    {{ disc.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div
        v-else-if="result.success"
        class="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-800"
      >
        <CheckCircleIcon class="h-8 w-8 mx-auto mb-2 text-green-500" />
        <p class="font-medium">
          Tüm hesaplar ve işlemler tutarlı.
        </p>
        <p class="text-sm mt-1">
          Herhangi bir uyumsuzluk tespit edilmedi.
        </p>
      </div>
    </div>

    <!-- Info Box -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
      <InformationCircleIcon class="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
      <div class="text-sm text-blue-700">
        <p class="font-bold mb-1">
          Bu araç nasıl çalışır?
        </p>
        <p>
          Bu denetim aracı, veritabanındaki tüm kullanıcı cüzdanlarını tarar ve iki temel kontrol yapar:
        </p>
        <ul class="list-disc list-inside mt-2 space-y-1 ml-2">
          <li>
            <strong>Bakiye Tutarlılığı:</strong> <code>Balance - Blocked = AvailableBalance</code> eşitliğini kontrol
            eder.
          </li>
          <li>
            <strong>İşlem Geçmişi Doğrulaması:</strong> Cüzdanın mevcut bakiyesinin, hesap açılışından bu yana yapılan
            tüm işlemlerin (toplam giriş - toplam çıkış) toplamına eşit olup olmadığını doğrular.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: 'super-admin'
})

useHead({
  title: 'Cüzdan Mutabakatı - Admin Panel'
})

const { $api } = useApi()
const loading = ref(false)
const autoSuspend = ref(false)
const result = ref(null)

const runReconciliation = async () => {
  if (autoSuspend.value && !confirm('UYARI: Otomatik dondurma açık. Uyumsuzluk tespit edilen hesaplar anında dondurulacaktır. Devam etmek istiyor musunuz?')) {
    return
  }

  loading.value = true
  result.value = null

  try {
    const response = await $api('/api/v1/admin/wallet/reconcile', {
      method: 'POST',
      body: {
        autoSuspend: autoSuspend.value
      }
    })

    result.value = response
    if (response.success) {
      useNuxtApp().$toast.success('Mutabakat başarıyla tamamlandı.')
    } else {
      useNuxtApp().$toast.warning(`Mutabakat tamamlandı ancak ${response.data.stats.issuesCount} sorun bulundu.`)
    }

  } catch (error) {
    console.error('Reconciliation error:', error)
    useNuxtApp().$toast.error(error.data?.error || 'Mutabakat başlatılamadı.')
  } finally {
    loading.value = false
  }
}
</script>
