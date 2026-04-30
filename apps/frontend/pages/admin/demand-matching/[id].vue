<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-20">
    <!-- Breadcrumbs & Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <NuxtLink
          to="/admin/demand-matching"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeftIcon class="w-6 h-6 text-gray-500" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">
            Eşleşme Detayları
          </h1>
          <p class="text-sm text-gray-500">
            AI tarafından önerilen bu eşleşmeyi inceleyip nihai kararı verin.
          </p>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <div class="flex -space-x-2">
          <div
            class="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 z-10"
          >
            AL
          </div>
          <div
            class="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600"
          >
            SA
          </div>
        </div>
        <span class="text-xs font-bold text-gray-400">#{{ match?.id?.slice(-8) }}</span>
      </div>
    </div>

    <!-- Main Comparison -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border shadow-sm"
    >
      <ArrowPathIcon class="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <p class="text-gray-500 font-medium">
        Veriler yükleniyor...
      </p>
    </div>

    <template v-else-if="match">
      <MatchingDiffView
        :buyer-item="match.buyerItem"
        :seller-item="match.sellerItem"
        :surplus-item="match.surplusItem"
        :type="match.matchType"
        :score="match.score"
      />

      <!-- Action Bar (Floating at bottom for high ergonomics) -->
      <div class="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
        <div
          class="bg-gray-900/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between"
        >
          <div class="flex items-center space-x-4 text-white">
            <div class="hidden sm:block">
              <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Durum
              </div>
              <div class="text-sm font-bold flex items-center">
                <div
                  class="w-2 h-2 rounded-full mr-2"
                  :class="statusColorClass"
                />
                {{ match.status }}
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <!-- REJECT BUTTON -->
            <button
              class="group flex items-center px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl font-bold transition-all border border-red-600/20"
              @click="openRejectModal"
            >
              <XMarkIcon class="w-5 h-5 mr-2" />
              Reddet
              <span class="ml-2 px-1.5 py-0.5 rounded bg-black/20 text-[10px] hidden sm:inline">[R]</span>
            </button>

            <!-- APPROVE / CONNECT BUTTON -->
            <button
              :disabled="submitting"
              class="flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
              @click="approveMatch"
            >
              <CheckIcon
                v-if="!submitting"
                class="w-5 h-5 mr-2"
              />
              <ArrowPathIcon
                v-else
                class="w-5 h-5 mr-2 animate-spin"
              />
              {{ match.status === 'PENDING' ? 'Onayla ve Bağla' : 'Bağlantıyı Yenile' }}
              <span class="ml-2 px-1.5 py-0.5 rounded bg-white/20 text-[10px] hidden sm:inline">[A]</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Rejection Reason Modal -->
      <TransitionRoot
        appear
        :show="isRejectModalOpen"
        as="template"
      >
        <Dialog
          as="div"
          class="relative z-[100]"
          @close="isRejectModalOpen = false"
        >
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div class="fixed inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4">
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all border border-gray-100"
              >
                <DialogTitle
                  as="h3"
                  class="text-xl font-black text-gray-900 mb-2"
                >
                  Neden Reddediyorsunuz?
                </DialogTitle>
                <p class="text-sm text-gray-500 mb-6">
                  Geri bildiriminiz AI modelimizin ticaret zekasını
                  geliştirmek için kullanılacaktır.
                </p>

                <div class="space-y-4">
                  <select
                    v-model="rejectionReason"
                    class="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 focus:ring-blue-500 font-medium"
                  >
                    <option
                      value=""
                      disabled
                    >
                      Lütfen bir sebep seçin
                    </option>
                    <option value="MISMATCHED_CATEGORY">
                      Yanlış Kategori Eşleşmesi
                    </option>
                    <option value="QUANTITY_INSUFFICIENT">
                      Miktar Yetersiz / Uyumsuz
                    </option>
                    <option value="LOCATION_TOO_FAR">
                      Lokasyon Çok Uzak
                    </option>
                    <option value="PRICE_TOO_HIGH">
                      Fiyat Beklentisi Çok Yüksek
                    </option>
                    <option value="IRRELEVANT_KEYWORDS">
                      Alakasız Anahtar Kelimeler
                    </option>
                    <option value="OTHER">
                      Diğer (Notlarda belirtin)
                    </option>
                  </select>

                  <textarea
                    v-model="adminNotes"
                    placeholder="Ek notlarınız (Opsiyonel)..."
                    class="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 focus:ring-blue-500 text-sm"
                    rows="3"
                  />
                </div>

                <div class="mt-8 flex space-x-3">
                  <button
                    class="flex-1 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                    @click="isRejectModalOpen = false"
                  >
                    Vazgeç
                  </button>
                  <button
                    :disabled="!rejectionReason || submitting"
                    class="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 disabled:opacity-50"
                    @click="rejectMatch"
                  >
                    Reddi Onayla
                  </button>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
    ChevronLeftIcon,
    ArrowPathIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/vue/24/outline'
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
} from '@headlessui/vue'
import MatchingDiffView from '~/components/admin/MatchingDiffView.vue'
import type { DemandMatch, ApiResponse } from '@barterborsa/shared-types'

const route = useRoute()
const { $api } = useApi()
const match = ref<DemandMatch | null>(null)
const loading = ref(true)
const submitting = ref(false)

const isRejectModalOpen = ref(false)
const rejectionReason = ref('')
const adminNotes = ref('')

const fetchMatch = async () => {
    loading.value = true
    try {
        const response = await $api(`/api/v1/admin/barter/demand-matches/${route.params.id}`) as ApiResponse<DemandMatch>
        if (response.success) match.value = response.data || null
    } catch (err) {
        console.error('Fetch error:', err)
        useNuxtApp().$toast?.error('Eşleşme detayı yüklenemedi.')
    } finally {
        loading.value = false
    }
}

const updateStatus = async (status: string, extras = {}) => {
    submitting.value = true
    try {
        const response = await $api(`/api/v1/admin/barter/demand-matches/${route.params.id}/status`, {
            method: 'PATCH',
            body: { status, ...extras }
        }) as ApiResponse<DemandMatch>
        if (response.success) {
            match.value = response.data || null
            useNuxtApp().$toast?.success(`Eşleşme başarıyla ${status === 'CONNECTED' ? 'onaylandı' : 'reddedildi'}.`)
            if (status === 'REJECTED') isRejectModalOpen.value = false
        }
    } catch (err) {
        console.error('Update error:', err)
        useNuxtApp().$toast?.error('Durum güncellenemedi.')
    } finally {
        submitting.value = false
    }
}

const approveMatch = () => updateStatus('CONNECTED')
const rejectMatch = () => updateStatus('REJECTED', { rejectionReason: rejectionReason.value, notes: adminNotes.value })

const openRejectModal = () => {
    rejectionReason.value = ''
    adminNotes.value = ''
    isRejectModalOpen.value = true
}

// Keyboard Shortcuts
const handleKeydown = (e: KeyboardEvent) => {
    if (isRejectModalOpen.value) return // Don't trigger shortcuts inside modal
    if (loading.value || submitting.value) return

    const key = e.key.toLowerCase()
    if (key === 'a') approveMatch()
    if (key === 'r') openRejectModal()
}

const statusColorClass = computed(() => {
    switch (match.value?.status) {
        case 'CONNECTED': return 'bg-emerald-500'
        case 'REJECTED': return 'bg-red-500'
        case 'PENDING': return 'bg-amber-500 animate-pulse'
        default: return 'bg-gray-400'
    }
})

onMounted(() => {
    fetchMatch()
    window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})
</script>
