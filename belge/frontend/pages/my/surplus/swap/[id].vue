<template>
  <div class="py-8 max-w-5xl mx-auto px-4">
    <div
      v-if="loading"
      class="space-y-6"
    >
      <div class="h-12 w-64 bg-gray-100 animate-pulse rounded-xl" />
      <div class="h-96 bg-gray-50 animate-pulse rounded-[3rem]" />
    </div>

    <div
      v-else-if="session"
      class="space-y-8"
    >
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            class="text-[0.625rem] font-black text-primary-600 uppercase tracking-widest flex items-center mb-2 hover:translate-x-1 transition-transform"
            @click="$router.back()"
          >
            <ChevronLeftIcon class="h-3 w-3 mr-1" /> Geri Dön
          </button>
          <h1 class="text-3xl font-black text-gray-900 uppercase italic tracking-tight">
            Takas Süreci Yönetimi
          </h1>
          <div class="flex items-center space-x-3 mt-1">
            <p class="text-[0.625rem] font-black text-gray-400 uppercase tracking-widest">
              İlan: {{ session.offer.requestedItem?.title }} <span class="mx-2">|</span> ID: #{{
                session.id.slice(-6) }}
            </p>
            <ReviewStatusBadge :trade-offer-id="session.offerId" />
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <button
            class="p-2 text-gray-400 hover:text-primary-600 transition-colors"
            title="Verileri Güncelle"
            @click="fetchSession"
          >
            <ArrowPathIcon
              class="h-5 w-5"
              :class="{ 'animate-spin': loading }"
            />
          </button>
          <NuxtLink
            :to="`/my/offers?offerId=${session.offer.id}&type=${session.offer.fromCompanyId === myCompany.id ? 'sent' : 'received'}`"
            class="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[0.625rem] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2"
          >
            💬 CANLI SOHBET
          </NuxtLink>
          <span
            v-if="session.status && statusStyles[session.status.toUpperCase()]"
            class="px-4 py-2 rounded-2xl text-[0.625rem] font-black uppercase tracking-widest border"
            :class="statusStyles[session.status.toUpperCase()].class"
          >
            {{ statusStyles[session.status.toUpperCase()].label }}
          </span>
        </div>
      </div>

      <!-- Progressive Stepper -->
      <div class="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between mb-12 relative">
          <!-- Connector Line -->
          <div class="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0" />
          <div
            class="absolute top-1/2 left-0 h-1 bg-primary-600 -translate-y-1/2 z-0 transition-all duration-700"
            :style="{ width: progressPercent + '%' }"
          />

          <div
            v-for="(step, index) in steps"
            :key="index"
            class="relative z-10 flex flex-col items-center"
          >
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500"
              :class="step.active ? 'bg-primary-600 border-primary-100 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-300'"
            >
              <component
                :is="step.icon"
                class="h-6 w-6"
              />
            </div>
            <span
              class="absolute -bottom-8 whitespace-nowrap text-[0.5625rem] font-black uppercase tracking-widest"
              :class="step.active ? 'text-primary-600' : 'text-gray-400'"
            >
              {{ step.label }}
            </span>
          </div>
        </div>

        <!-- Current Status Detail Card -->
        <div class="bg-gray-50 rounded-[2rem] p-6 md:p-10 mt-16 border border-gray-100">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Left: Actions & Status -->
            <div class="space-y-6">
              <div class="flex items-start space-x-4">
                <div class="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <component
                    :is="statusStyles[session.status.toUpperCase()].icon"
                    v-if="session.status && statusStyles[session.status.toUpperCase()]"
                    class="h-8 w-8 text-primary-600"
                  />
                </div>
                <div>
                  <h3
                    v-if="session.status && statusStyles[session.status.toUpperCase()]"
                    class="text-xl font-black text-gray-900 uppercase italic leading-none mb-2"
                  >
                    {{ statusStyles[session.status.toUpperCase()].label }}
                  </h3>
                  <p
                    v-if="session.status && statusStyles[session.status.toUpperCase()]"
                    class="text-xs text-gray-500 font-medium leading-relaxed"
                  >
                    {{ statusStyles[session.status.toUpperCase()].description }}
                  </p>
                </div>
              </div>

              <div class="pt-6 border-t border-gray-200">
                <!-- Action Buttons Based on Status -->
                <div
                  v-if="session.status.toUpperCase() === 'PENDING_COLLATERAL'"
                  class="space-y-4"
                >
                  <div
                    v-if="!isMyCollateralLocked"
                    class="bg-primary-50 p-6 rounded-2xl border border-primary-100"
                  >
                    <p class="text-sm font-bold text-primary-900 mb-4 uppercase tracking-tight">
                      Güvenli Takas İçin Teminat Kilitlemeniz Gerekiyor
                    </p>
                    <button
                      :loading="actionLoading"
                      class="w-full btn-primary py-4 !rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary-500/20"
                      @click="lockCollateral"
                    >
                      TEMİNATI KİLİTLE & ONAYLA
                    </button>
                  </div>
                  <div
                    v-else
                    class="flex items-center space-x-3 text-green-600 bg-green-50 p-4 rounded-xl border border-green-100"
                  >
                    <CheckCircleIcon class="h-5 w-5" />
                    <span class="text-xs font-black uppercase tracking-widest">Teminatınız
                      Kilitlendi. Karşı taraf bekleniyor.</span>
                  </div>
                </div>

                <div
                  v-else-if="['SHIPPING_PENDING', 'SHIPPING_IN_PROGRESS', 'IN_TRANSIT', 'DELIVERED', 'COLLATERAL_DEPOSITED'].includes(session.status.toUpperCase())"
                  class="space-y-4"
                >
                  <div
                    v-if="!isMyShippingInfoProvided"
                    class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
                  >
                    <label
                      class="block text-[0.625rem] font-black text-gray-400 uppercase tracking-widest mb-2"
                    >Kargo
                      Takip No / Teslimat Bilgisi</label>
                    <input
                      v-model="shippingCode"
                      type="text"
                      placeholder="Örn: MNG-123456"
                      class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all mb-4"
                    >
                    <button
                      :disabled="!shippingCode"
                      :loading="actionLoading"
                      class="w-full btn-primary py-4 !rounded-xl font-black uppercase tracking-widest"
                      @click="submitShipping"
                    >
                      GÖNDERİMİ
                      BİLDİR
                    </button>
                  </div>
                  <div
                    v-else
                    class="space-y-4"
                  >
                    <div
                      class="flex items-center space-x-3 text-primary-600 bg-primary-50 p-4 rounded-xl border border-primary-100"
                    >
                      <TruckIcon class="h-5 w-5" />
                      <span class="text-xs font-black uppercase tracking-widest">Gönderiminiz
                        Kaydedildi. Takip No: {{ getMyShippingCode }}</span>
                    </div>
                    <button
                      v-if="!isMyReceiptConfirmed"
                      :loading="actionLoading"
                      class="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all"
                      @click="confirmReceipt"
                    >
                      ÜRÜNÜ TESLİM ALDIM
                    </button>
                  </div>
                </div>

                <div
                  v-else-if="['INSPECTION', 'INSPECTION_PERIOD'].includes(session.status.toUpperCase())"
                  class="space-y-6"
                >
                  <div class="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                    <div class="flex items-center justify-between mb-4">
                      <span
                        class="text-[10px] font-black text-amber-600 uppercase tracking-widest"
                      >İnceleme
                        Süresi</span>
                      <span class="text-xl font-black text-amber-700 tracking-tighter">{{ timeLeft
                      }}</span>
                    </div>
                    <p class="text-xs font-medium text-amber-800 leading-relaxed mb-6">
                      <span v-if="!isMyReceiptConfirmed">Ürünü teslim aldıysanız lütfen
                        onaylayın.</span>
                      <span v-else-if="!isMyFinalized">Ürünleri inceleyin. Sorun yoksa "ONAYLA &
                        TAMAMLA" butonuna basın.</span>
                      <span v-else>Onayınız alındı. Diğer tarafın onayı bekleniyor.</span>
                    </p>
                    <div
                      v-if="!isMyReceiptConfirmed"
                      class="mb-6"
                    >
                      <button
                        :loading="actionLoading"
                        class="w-full bg-amber-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
                        @click="confirmReceipt"
                      >
                        ÜRÜNÜ TESLİM ALDIM
                      </button>
                    </div>
                    <div class="flex gap-4">
                      <button
                        class="flex-1 bg-white border-2 border-red-100 text-red-600 py-3 rounded-xl text-[0.625rem] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                        @click="openDisputeModal"
                      >
                        SORUN
                        BİLDİR / İTİRAZ
                      </button>

                      <button
                        v-if="!isMyFinalized"
                        :disabled="!isMyReceiptConfirmed"
                        :class="[!isMyReceiptConfirmed ? 'opacity-50 cursor-not-allowed' : '']"
                        class="flex-1 bg-gray-900 text-white py-3 rounded-xl text-[0.625rem] font-black uppercase tracking-widest hover:bg-black transition-all"
                        @click="finalizeSwap"
                      >
                        ONAYLA & TAMAMLA
                      </button>
                      <div
                        v-else
                        class="flex-1 bg-green-100 text-green-700 py-3 rounded-xl text-[0.625rem] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <CheckCircleIcon class="h-4 w-4" /> ONAYINIZ ALINDI
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-else-if="['COMPLETED', 'FUNDS_RELEASED'].includes(session.status.toUpperCase())"
                  class="text-center py-6 space-y-6"
                >
                  <div
                    class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <ShieldCheckIcon class="h-8 w-8 text-green-600" />
                  </div>
                  <div class="space-y-2">
                    <p class="text-sm font-black text-gray-900 uppercase tracking-tight italic">
                      TAKAS BAŞARIYLA TAMAMLANDI
                    </p>
                    <p class="text-xs text-gray-500 font-medium">
                      Teminatlar serbest bırakıldı ve
                      ürün sahipleri değişti.
                    </p>
                  </div>

                  <div class="pt-6 border-t border-gray-100 flex justify-center">
                    <button
                      class="bg-gray-900 hover:bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-3 group"
                      @click="openReviewModal"
                    >
                      <StarIcon
                        class="h-4 w-4 text-amber-400 group-hover:scale-125 transition-transform"
                      />
                      DENEYİMİ DEĞERLENDİR
                    </button>
                  </div>
                </div>

                <div
                  v-else-if="session.status === 'DISPUTED'"
                  class="space-y-6"
                >
                  <div class="bg-red-50 p-6 rounded-2xl border border-red-100 mb-6">
                    <div class="flex items-center space-x-3 text-red-700 mb-4">
                      <ExclamationTriangleIcon class="h-6 w-6" />
                      <h4 class="font-black uppercase italic tracking-widest text-sm">
                        Takas
                        Donduruldu
                      </h4>
                    </div>
                    <p class="text-xs font-bold text-red-800 leading-relaxed italic">
                      "{{ session.disputeReason || 'Belirtilmedi' }}"
                    </p>
                    <div
                      class="mt-4 p-4 bg-white/50 rounded-xl text-[10px] font-bold text-red-900 leading-normal"
                    >
                      ⚠️ ÖNEMLİ: Sorun çözülene kadar teminat bloke işlemleri devam edecektir.
                      Platform adminleri her iki tarafla iletişime geçerek süreci karara
                      bağlayacaktır.
                    </div>
                  </div>

                  <div class="space-y-4">
                    <h5
                      class="text-[0.625rem] font-black text-gray-400 uppercase tracking-widest px-2"
                    >
                      Hala yardıma mı ihtiyacınız var?
                    </h5>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <!-- Live Support -->
                      <div
                        class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-primary-200 transition-all cursor-pointer"
                      >
                        <div
                          class="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all"
                        >
                          <ChatBubbleLeftRightIcon class="h-6 w-6" />
                        </div>
                        <div>
                          <p
                            class="text-xs font-black text-gray-900 uppercase leading-none mb-1"
                          >
                            Canlı Destek
                          </p>
                          <p
                            class="text-[9px] font-bold text-gray-500 uppercase tracking-tighter"
                          >
                            Temsilcimizle anında görüşün
                          </p>
                          <p
                            class="text-[9px] font-black text-primary-600 uppercase mt-1 tracking-widest group-hover:translate-x-1 transition-transform"
                          >
                            Sohbeti Başlat →
                          </p>
                        </div>
                      </div>

                      <!-- Phone Support -->
                      <div
                        class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4"
                      >
                        <div
                          class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600"
                        >
                          <PhoneIcon class="h-6 w-6" />
                        </div>
                        <div>
                          <p
                            class="text-xs font-black text-gray-900 uppercase leading-none mb-1"
                          >
                            Çağrı Merkezi
                          </p>
                          <p
                            class="text-[9px] font-bold text-gray-500 uppercase tracking-tighter"
                          >
                            0850 123 45 67
                          </p>
                          <p
                            class="text-[9px] font-black text-gray-400 uppercase mt-1 tracking-widest italic"
                          >
                            Hafta içi 09:00 - 18:00
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Companies & Items Summary -->
            <div class="space-y-6">
              <!-- User A (From) -->
              <div
                class="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4 relative"
              >
                <div
                  class="absolute -top-3 left-4 px-2 bg-gray-50 rounded-lg text-[8px] font-black text-gray-400 uppercase border border-gray-100 italic"
                >
                  Gönderen Taraf
                </div>
                <img
                  :src="getMainImage(session.offer.offeredItem)"
                  class="w-28 h-28 rounded-[1.5rem] object-cover shadow-sm border border-gray-100"
                >
                <div class="flex-1">
                  <h4 class="text-sm font-black text-gray-900 leading-none mb-1">
                    {{
                      session.offer.fromCompany.name }}
                  </h4>
                  <p class="text-[0.625rem] text-gray-500 font-bold uppercase truncate max-w-52">
                    {{
                      session.offer.offeredItem?.title }}
                  </p>
                  <div class="mt-2 flex items-center space-x-2">
                    <span
                      v-if="session.fromCompanyCollateral"
                      class="w-2 h-2 rounded-full bg-green-500"
                    />
                    <span
                      v-else
                      class="w-2 h-2 rounded-full bg-gray-200"
                    />
                    <span
                      class="text-[0.5rem] font-black text-gray-400 uppercase tracking-widest"
                    >Teminat
                      {{ session.fromCompanyCollateral ? 'KİLİTLENDİ' : 'BEKLENİYOR' }}</span>
                  </div>
                </div>
              </div>

              <!-- Swap Icon -->
              <div class="flex justify-center -my-3 relative z-10">
                <div class="bg-white p-2 rounded-full shadow-md border border-gray-100">
                  <ArrowsRightLeftIcon class="h-4 w-4 text-primary-600" />
                </div>
              </div>

              <!-- User B (To) -->
              <div
                class="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4 relative"
              >
                <div
                  class="absolute -top-3 left-4 px-2 bg-gray-50 rounded-lg text-[8px] font-black text-gray-400 uppercase border border-gray-100 italic"
                >
                  Alıcı Taraf
                </div>
                <img
                  :src="getMainImage(session.offer.requestedItem)"
                  class="w-28 h-28 rounded-[1.5rem] object-cover shadow-sm border border-gray-100"
                >
                <div class="flex-1">
                  <h4 class="text-sm font-black text-gray-900 leading-none mb-1">
                    {{
                      session.offer.toCompany.name }}
                  </h4>
                  <p class="text-[0.625rem] text-gray-500 font-bold uppercase truncate max-w-52">
                    {{
                      session.offer.requestedItem?.title }}
                  </p>
                  <div class="mt-2 flex items-center space-x-2">
                    <span
                      v-if="session.toCompanyCollateral"
                      class="w-2 h-2 rounded-full bg-green-500"
                    />
                    <span
                      v-else
                      class="w-2 h-2 rounded-full bg-gray-200"
                    />
                    <span
                      class="text-[0.5rem] font-black text-gray-400 uppercase tracking-widest"
                    >Teminat
                      {{ session.toCompanyCollateral ? 'KİLİTLENDİ' : 'BEKLENİYOR' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dispute Modal -->
    <div
      v-if="showDisputeModal"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        @click="showDisputeModal = false"
      />
      <div class="relative bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-slide-up">
        <h2 class="text-2xl font-black text-gray-900 uppercase italic mb-2">
          SORUN BİLDİR
        </h2>
        <p class="text-xs text-gray-500 mb-6 font-bold uppercase tracking-widest">
          Lütfen yaşadığınız sorunu
          detaylandırın. Takas dondurulacak ve admin kontrolüne geçecektir.
        </p>

        <textarea
          v-model="disputeReason"
          rows="4"
          placeholder="Ürün eksik geldi, görselle uyuşmuyor vb..."
          class="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-red-500 mb-6"
        />

        <div class="flex gap-4">
          <button
            class="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl text-[10px] font-black uppercase tracking-widest"
            @click="showDisputeModal = false"
          >
            VAZGEÇ
          </button>
          <button
            :disabled="!disputeReason"
            class="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20"
            @click="sendDispute"
          >
            İTİRAZI
            GÖNDER
          </button>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div
      v-if="showReviewModal"
      class="fixed inset-0 z-[600] flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        @click="showReviewModal = false"
      />
      <div class="relative w-full max-w-xl animate-fade-in">
        <ReviewForm
          :trade-info="reviewTradeInfo"
          @success="handleReviewSuccess"
          @cancel="showReviewModal = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    ChevronLeftIcon, CheckCircleIcon, TruckIcon, DocumentMagnifyingGlassIcon,
    ShieldCheckIcon, ExclamationTriangleIcon, ArrowsRightLeftIcon, LockClosedIcon,
    ArrowPathIcon, ChatBubbleLeftRightIcon, PhoneIcon, StarIcon
} from '@heroicons/vue/24/outline'
import ReviewStatusBadge from '~/components/trade/ReviewStatusBadge.vue'
import ReviewForm from '~/components/trade/ReviewForm.vue'
import { onUnmounted, watch } from 'vue'

const route = useRoute()
const config = useRuntimeConfig()
const authStore = useAuthStore()
const { $api } = useApi()

const session = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const shippingCode = ref('')
const disputeReason = ref('')
const showDisputeModal = ref(false)
const showReviewModal = ref(false)
const myCompany = ref(null)

const reviewTradeInfo = computed(() => {
    if (!session.value || !myCompany.value) return {}

    const isFromCompany = session.value.offer.fromCompanyId === myCompany.value.id
    const partner = isFromCompany ? session.value.offer.toCompany : session.value.offer.fromCompany

    // Find a user from the partner company
    let toUserId = null

    if (partner?.users && partner.users.length > 0) {
        // Try nested user object structure: { user: { id, name } }
        const otherUser = partner.users.find(u => {
            const uid = u.user?.id || u.userId
            return uid && uid !== authStore.user?.id
        })

        if (otherUser) {
            toUserId = otherUser.user?.id || otherUser.userId
        } else {
            // Fallback: pick first available user
            const firstUser = partner.users[0]
            toUserId = firstUser?.user?.id || firstUser?.userId
        }
    }

    console.log('[DEBUG] swap reviewTradeInfo:', {
        offerId: session.value.offerId,
        partnerName: partner?.name,
        partnerUsersCount: partner?.users?.length,
        toUserId
    })

    return {
        tradeId: session.value.offerId,
        partnerName: partner?.name,
        fromImage: getMainImage(session.value.offer.offeredItem),
        toImage: getMainImage(session.value.offer.requestedItem),
        toUserId
    }
})

const openReviewModal = () => {
    showReviewModal.value = true
}

const handleReviewSuccess = () => {
    showReviewModal.value = false
    // Optionally refresh session or status badge
    fetchSession()
}

const statusStyles = {
    'PENDING_COLLATERAL': {
        label: 'TEMİNAT BEKLENİYOR',
        icon: LockClosedIcon,
        class: 'bg-yellow-50 text-yellow-700 border-yellow-100',
        description: 'Takasın güvenle başlaması için her iki tarafın da belirlenen teminat miktarını kilitlemesi gerekmektedir.'
    },
    'COLLATERAL_DEPOSITED': {
        label: 'TEMİNATLAR ALINDI',
        icon: LockClosedIcon,
        class: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        description: 'Her iki tarafın da teminatları kilitlendi. Şimdi gönderim aşamasını başlatabilirsiniz.'
    },
    'SHIPPING_PENDING': {
        label: 'KARGO BEKLENİYOR',
        icon: TruckIcon,
        class: 'bg-blue-50 text-blue-700 border-blue-100',
        description: 'Gönderim için hazırlık yapılıyor. Lütfen kargo takip numarasını girin.'
    },
    'SHIPPING_IN_PROGRESS': {
        label: 'KARGO / TESLİMAT',
        icon: TruckIcon,
        class: 'bg-blue-50 text-blue-700 border-blue-100',
        description: 'Teminatlar alındı. Şimdi ürünleri birbirinize gönderme zamanı! Lütfen kargo takip kodunuzu paylaşın.'
    },
    'IN_TRANSIT': {
        label: 'GÖNDERİMDE',
        icon: TruckIcon,
        class: 'bg-blue-50 text-blue-700 border-blue-100',
        description: 'Ürünler yolda. Takip numaraları üzerinden süreci izleyebilirsiniz.'
    },
    'DELIVERED': {
        label: 'TESLİM EDİLDİ',
        icon: CheckCircleIcon,
        class: 'bg-blue-50 text-blue-700 border-blue-100',
        description: 'Ürünler teslim edildi. İnceleme sürecine geçiliyor.'
    },
    'INSPECTION': {
        label: 'İNCELEME DÖNEMİ',
        icon: DocumentMagnifyingGlassIcon,
        class: 'bg-amber-50 text-amber-700 border-amber-100',
        description: 'Ürünler teslim edildi. Güven için 48 saatlik inceleme süreniz başladı.'
    },
    'INSPECTION_PERIOD': {
        label: 'İNCELEME DÖNEMİ',
        icon: DocumentMagnifyingGlassIcon,
        class: 'bg-amber-50 text-amber-700 border-amber-100',
        description: 'Ürünler teslim edildi. Güven için 48 saatlik inceleme süreniz başladı.'
    },
    'COMPLETED': {
        label: 'TAMAMLANDI',
        icon: ShieldCheckIcon,
        class: 'bg-green-50 text-green-700 border-green-100',
        description: 'Takas başarıyla sonuçlandı. Teminatlar serbest bırakıldı.'
    },
    'FUNDS_RELEASED': {
        label: 'TAMAMLANDI',
        icon: ShieldCheckIcon,
        class: 'bg-green-50 text-green-700 border-green-100',
        description: 'Takas başarıyla sonuçlandı. Teminatlar serbest bırakıldı.'
    },
    'DISPUTED': {
        label: 'İTİRAZ / DONDURULDU',
        icon: ExclamationTriangleIcon,
        class: 'bg-red-50 text-red-700 border-red-100',
        description: 'Bir sorun bildirildi. Admin ekibi inceleme başlattı.'
    },
    'CANCELLED': {
        label: 'İPTAL EDİLDİ',
        icon: ExclamationTriangleIcon,
        class: 'bg-gray-100 text-gray-700 border-gray-200',
        description: 'Bu takas süreci iptal edildi.'
    }
}

const steps = computed(() => [
    { label: 'TEMİNAT', icon: LockClosedIcon, active: true },
    { label: 'GÖNDERİM', icon: TruckIcon, active: ['SHIPPING_PENDING', 'SHIPPING_IN_PROGRESS', 'IN_TRANSIT', 'DELIVERED', 'INSPECTION', 'INSPECTION_PERIOD', 'COMPLETED', 'FUNDS_RELEASED'].includes(session.value?.status) },
    { label: 'İNCELEME', icon: DocumentMagnifyingGlassIcon, active: ['INSPECTION', 'INSPECTION_PERIOD', 'COMPLETED', 'FUNDS_RELEASED'].includes(session.value?.status) },
    { label: 'SONUÇ', icon: ShieldCheckIcon, active: ['COMPLETED', 'FUNDS_RELEASED'].includes(session.value?.status) }
])

const progressPercent = computed(() => {
    if (!session.value) return 0
    const statusOrder = [
        'PENDING_COLLATERAL',
        'COLLATERAL_DEPOSITED',
        'SHIPPING_PENDING',
        'IN_TRANSIT',
        'DELIVERED',
        'INSPECTION',
        'COMPLETED'
    ]
    const currentStatus = session.value.status?.toUpperCase()
    let idx = statusOrder.indexOf(currentStatus)

    // Fallbacks for legacy/alternative naming
    if (idx === -1) {
        if (currentStatus === 'SHIPPING_IN_PROGRESS') idx = 2
        if (currentStatus === 'INSPECTION_PERIOD') idx = 5
        if (currentStatus === 'FUNDS_RELEASED') idx = 6
        if (currentStatus === 'DISPUTED') idx = 5 // Keep at inspection level
        if (currentStatus === 'CANCELLED') idx = 0
    }

    return (Math.max(0, idx) / (statusOrder.length - 1)) * 100
})

const isMyCollateralLocked = computed(() => {
    if (!session.value || !myCompany.value) return false
    return session.value.offer.fromCompanyId === myCompany.value.id
        ? session.value.fromCompanyCollateral
        : session.value.toCompanyCollateral
})

const isMyShippingInfoProvided = computed(() => {
    if (!session.value || !myCompany.value) return false
    return session.value.offer.fromCompanyId === myCompany.value.id
        ? !!session.value.fromCompanyShippingCode
        : !!session.value.toCompanyShippingCode
})

const getMyShippingCode = computed(() => {
    if (!session.value || !myCompany.value) return ''
    return session.value.offer.fromCompanyId === myCompany.value.id
        ? session.value.fromCompanyShippingCode
        : session.value.toCompanyShippingCode
})

const isMyReceiptConfirmed = computed(() => {
    if (!session.value || !myCompany.value) return false
    return session.value.offer.fromCompanyId === myCompany.value.id
        ? !!session.value.fromCompanyDeliveredAt
        : !!session.value.toCompanyDeliveredAt
})

const isMyFinalized = computed(() => {
    if (!session.value || !myCompany.value) return false
    return session.value.offer.fromCompanyId === myCompany.value.id
        ? !!session.value.fromCompanyFinalizedAt
        : !!session.value.toCompanyFinalizedAt
})

const fetchSession = async () => {
    try {
        const data = await $api(`/api/surplus/swap/offer/${route.params.id}`)
        if (data.success) {
            session.value = data.session
        }
    } catch (err) {
        console.error('Fetch session error:', err)
    } finally {
        loading.value = false
    }
}

const fetchMyCompany = async () => {
    try {
        const data = await $api('/api/companies/me')
        if (data.success) {
            myCompany.value = data.company
        }
    } catch (err) {
        console.error('Fetch company error:', err)
    }
}

const lockCollateral = async () => {
    actionLoading.value = true
    try {
        const data = await $api(`/api/surplus/swap/${session.value.id}/lock-collateral`, {
            method: 'POST',
            body: { companyId: myCompany.value.id }
        })
        if (data.success) {
            useNuxtApp().$toast.success('Teminat kilitlendi!')
            await fetchSession()
        }
    } catch (err) {
        useNuxtApp().$toast.error('İşlem sırasında hata oluştu.')
    } finally {
        actionLoading.value = false
    }
}

const submitShipping = async () => {
    actionLoading.value = true
    try {
        const data = await $api(`/api/surplus/swap/${session.value.id}/shipping`, {
            method: 'POST',
            body: { companyId: myCompany.value.id, shippingCode: shippingCode.value }
        })
        if (data.success) {
            useNuxtApp().$toast.success('Kargo bilgisi kaydedildi.')
            await fetchSession()
        }
    } catch (err) {
        useNuxtApp().$toast.error('Hata oluştu.')
    } finally {
        actionLoading.value = false
    }
}

const confirmReceipt = async () => {
    if (!confirm('Ürünü teslim aldığınızı onaylıyor musunuz?')) return
    actionLoading.value = true
    try {
        const data = await $api(`/api/surplus/swap/${session.value.id}/confirm-receipt`, {
            method: 'POST',
            body: { companyId: myCompany.value.id }
        })
        if (data.success) {
            useNuxtApp().$toast.success('Teslimat onaylandı!')
            await fetchSession()
        }
    } catch (err) {
        useNuxtApp().$toast.error('Hata oluştu.')
    } finally {
        actionLoading.value = false
    }
}

const sendDispute = async () => {
    try {
        const data = await $api(`/api/surplus/swap/${session.value.id}/report-issue`, {
            method: 'POST',
            body: { reason: disputeReason.value, companyId: myCompany.value.id }
        })
        if (data.success) {
            useNuxtApp().$toast.warning('İtiraz bildirildi, takas donduruldu.')
            showDisputeModal.value = false
            await fetchSession()
        }
    } catch (err) {
        useNuxtApp().$toast.error('Hata oluştu.')
    }
}

const finalizeSwap = async () => {
    if (!confirm('İncelemeniz tamamlandı mı? Karşı taraf da onayladığında takas sonuçlanacaktır.')) return
    try {
        const data = await $api(`/api/surplus/swap/${session.value.id}/finalize`, {
            method: 'POST',
            body: { companyId: myCompany.value.id }
        })
        if (data.success) {
            useNuxtApp().$toast.success('Onayınız kaydedildi!')
            await fetchSession()
        }
    } catch (err) {
        useNuxtApp().$toast.error('Hata oluştu.')
    }
}

const openDisputeModal = () => {
    showDisputeModal.value = true
}

const getMainImage = (item) => {
    if (item?.images && item.images.length > 0) {
        const img = item.images[0]
        const url = typeof img === 'string' ? img : img.url
        if (url.startsWith('http')) return url
        return `${config.public.apiBase}${url}`
    }
    return '/placeholder-surplus.jpg'
}

const timeLeft = ref('48:00:00')
let timerInterval = null

const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval)
    const currentStatus = session.value?.status?.toUpperCase()
    if (!['INSPECTION', 'INSPECTION_PERIOD'].includes(currentStatus) || !session.value?.autoReleaseAt) return

    const tick = () => {
        const end = new Date(session.value.autoReleaseAt).getTime()
        const now = new Date().getTime()
        const diff = end - now

        if (diff <= 0) {
            timeLeft.value = '00:00:00'
            if (timerInterval) clearInterval(timerInterval)
            fetchSession()
            return
        }

        const h = Math.floor(diff / (1000 * 60 * 60))
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const s = Math.floor((diff % (1000 * 60)) / 1000)
        timeLeft.value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    tick()
    timerInterval = setInterval(tick, 1000)
}

onMounted(async () => {
    await authStore.init()
    if (!authStore.isAuthenticated) {
        useRouter().push('/login')
        return
    }

    await Promise.all([
        fetchMyCompany(),
        fetchSession()
    ])

    if (['INSPECTION', 'INSPECTION_PERIOD'].includes(session.value?.status?.toUpperCase())) {
        startTimer()
    }
})

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval)
})

watch(() => session.value?.status, (newStatus) => {
    const s = newStatus?.toUpperCase()
    if (['INSPECTION', 'INSPECTION_PERIOD'].includes(s)) {
        startTimer()
    } else {
        if (timerInterval) clearInterval(timerInterval)
    }
})
</script>
