<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Talep Eşleştirme Merkezi
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          İstek listelerini analiz ederek doğrudan ticaret, hizmet ve ortak alım fırsatlarını bulun.
        </p>
      </div>
      <div>
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          @click="fetchMatches"
        >
          <ArrowPathIcon
            class="-ml-1 mr-2 h-5 w-5"
            aria-hidden="true"
            :class="{ 'animate-spin': loading }"
          />
          Analizi Yenile
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div
        v-for="stat in stats"
        :key="stat.name"
        class="bg-white overflow-hidden shadow rounded-lg"
      >
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <component
                :is="stat.icon"
                class="h-6 w-6 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{ stat.name }}
                </dt>
                <dd>
                  <div class="text-lg font-medium text-gray-900">
                    {{ stat.value }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="bg-white shadow rounded-lg">
      <div class="border-b border-gray-200">
        <nav
          class="-mb-px flex space-x-8 px-6"
          aria-label="Tabs"
        >
          <button
            v-for="tab in tabs"
            :key="tab.name"
            :class="[
              currentTab === tab.value
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
            @click="currentTab = tab.value"
          >
            {{ tab.name }}
            <span
              :class="[
                currentTab === tab.value ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900',
                'hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block'
              ]"
            >
              {{ getCount(tab.value) }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Matches List -->
      <div class="p-6">
        <div
          v-if="loading"
          class="text-center py-12"
        >
          <ArrowPathIcon class="mx-auto h-12 w-12 text-gray-300 animate-spin" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            Eşleşmeler Aranıyor...
          </h3>
        </div>

        <div
          v-else-if="filteredMatches.length === 0"
          class="text-center py-12"
        >
          <InboxIcon class="mx-auto h-12 w-12 text-gray-300" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            Eşleşme Bulunamadı
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            Seçili kriterlere uygun şu an için bir fırsat yok.
          </p>
        </div>

        <div
          v-else
          class="space-y-4"
        >
          <div
            v-for="(match, index) in filteredMatches"
            :key="index"
            class="bg-white border rounded-lg hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            <div class="p-4 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    %{{ match.score }} Eşleşme
                  </span>
                  <span class="text-sm text-gray-500">{{ match.reason }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <NuxtLink
                    :to="`/admin/demand-matching/${match.id}`"
                    class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                  >
                    Karşılaştır
                  </NuxtLink>
                  <button
                    :disabled="match.status === 'CONNECTED'"
                    :class="[
                      match.status === 'CONNECTED'
                        ? 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
                        : 'border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50'
                    ]"
                    class="inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded focus:outline-none transition-colors"
                    @click="establishConnection(match)"
                  >
                    {{ match.status === 'CONNECTED' ? 'Bağlantı Kuruldu' : 'Bağlantı Kur' }}
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                <!-- Sol Taraf (Talep 1 / Alıcı) -->
                <div class="bg-gray-50 p-4 rounded-md">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {{ match.type === 'DIRECT_TRADE' ? 'ALICI (Talep)' : 'TALEP 1' }}
                    </span>
                    <span class="text-xs text-indigo-600 font-medium truncate max-w-[120px]">
                      {{ match.item1?.company?.name || 'Anonim Şirket' }}
                    </span>
                  </div>
                  <h4 class="text-md font-semibold text-gray-900">
                    {{ match.item1?.keywords?.[0] ||
                      'Genel Talep' }}
                  </h4>
                  <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                    {{ match.item1?.description || 'Açıklama yok' }}
                  </p>
                  <div class="mt-2 flex flex-wrap gap-1">
                    <span
                      v-for="kw in match.item1?.keywords?.slice(0, 3)"
                      :key="kw"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800"
                    >
                      #{{ kw }}
                    </span>
                  </div>
                </div>

                <!-- Ortada Ok İkonu (Desktop) -->
                <div
                  class="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none"
                >
                  <div class="bg-white p-1 rounded-full border shadow-sm">
                    <ArrowsRightLeftIcon class="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <!-- Sağ Taraf (Talep 2 / Satıcı / Fazla Mal) -->
                <div class="bg-gray-50 p-4 rounded-md">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {{ match.type === 'DIRECT_TRADE' ? 'SATICI (Arz)' : match.type ===
                        'SURPLUS_MATCH' ? 'FAZLA MAL (Stok)' : 'TALEP 2' }}
                    </span>
                    <span class="text-xs text-indigo-600 font-medium truncate max-w-[120px]">
                      {{ match.type === 'SURPLUS_MATCH' ? match.item2?.company?.name :
                        match.item2?.company?.name }}
                    </span>
                  </div>
                  <h4 class="text-md font-semibold text-gray-900">
                    {{ match.type === 'SURPLUS_MATCH' ? match.item2?.title :
                      (match.item2?.keywords?.[0] || 'Genel Arz') }}
                  </h4>
                  <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                    {{ match.item2?.description || 'Açıklama yok' }}
                  </p>
                  <div class="mt-2 flex flex-wrap gap-1">
                    <template v-if="match.type !== 'SURPLUS_MATCH'">
                      <span
                        v-for="kw in match.item2?.keywords?.slice(0, 3)"
                        :key="kw"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800"
                      >
                        #{{ kw }}
                      </span>
                    </template>
                    <template v-else>
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                      >
                        {{ match.item2?.category }}
                      </span>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth', 'admin'] })

import { ref, computed, onMounted } from 'vue'
import {
    ArrowPathIcon,
    InboxIcon,
    ArrowsRightLeftIcon,
    UserGroupIcon,
        BriefcaseIcon
} from '@heroicons/vue/24/outline'

const loading = ref(false)
const matches = ref([])
const currentTab = ref('ALL')

const tabs = [
    { name: 'Tümü', value: 'ALL' },
    { name: 'Doğrudan Ticaret', value: 'DIRECT_TRADE' },
    { name: 'Ortak Alım Fırsatı', value: 'GROUP_BUY' },
    { name: 'Fazla Mal Eşleşmesi', value: 'SURPLUS_MATCH' }
]

const stats = computed(() => [
    { name: 'Toplam Fırsat', value: matches.value.length, icon: InboxIcon },
    { name: 'Doğrudan Ticaret', value: matches.value.filter(m => m.type === 'DIRECT_TRADE').length, icon: BriefcaseIcon },
    { name: 'Ortak Alım', value: matches.value.filter(m => m.type === 'GROUP_BUY').length, icon: UserGroupIcon },
])

const filteredMatches = computed(() => {
    if (currentTab.value === 'ALL') return matches.value
    return matches.value.filter(m => m.type === currentTab.value)
})

const getCount = (type) => {
    if (type === 'ALL') return matches.value.length
    return matches.value.filter(m => m.type === type).length
}

const { $api } = useApi()

const fetchMatches = async () => {
    loading.value = true
    try {
        const response = await $api('/api/v1/admin/barter/demand-matches')

        if (response.success) {
            matches.value = response.data
        }
    } catch (err) {
        console.error('Failed to fetch matches:', err)
    } finally {
        loading.value = false
    }
}

const establishConnection = async (match) => {
    if (match.status === 'CONNECTED') return

    try {
        const response = await $api(`/api/v1/admin/barter/demand-matches/${match.id}/connect`, {
            method: 'PATCH'
        })

        if (response.success) {
            match.status = 'CONNECTED'
            useNuxtApp().$toast?.success('Bağlantı başarıyla kuruldu!')
        }
    } catch (err) {
        console.error('Failed to establish connection:', err)
        useNuxtApp().$toast?.error('Bağlantı kurulurken bir hata oluştu.')
    }
}

onMounted(() => {
    fetchMatches()
})
</script>
