<template>
  <div class="fixed inset-0 z-[300] flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-gray-900/40 backdrop-blur-xl"
      @click="$emit('close')"
    />
    <div
      class="relative bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] w-full max-w-2xl overflow-hidden transform transition-all animate-modal-in border border-white/20"
    >
      <!-- Header with Gradient -->
      <div class="relative p-10 bg-gray-900 overflow-hidden">
        <div class="absolute -right-20 -top-20 w-60 h-60 bg-primary-600 rounded-full blur-[100px] opacity-30" />
        <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-600 rounded-full blur-[80px] opacity-20" />

        <div class="relative z-10 flex items-center justify-between">
          <div class="space-y-1">
            <h2 class="text-3xl font-black text-white uppercase tracking-tightest italic flex items-center">
              <ArrowsRightLeftIcon class="h-8 w-8 mr-4 text-primary-500" />
              {{ isCounter ? 'KARŞI TEKLİF' : 'TAKAS TEKLİFİ' }}
            </h2>
            <p class="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-12">
              PROFESSIONAL TRADING OFFER
            </p>
          </div>
          <button
            class="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 text-white/50 hover:text-white"
            @click="$emit('close')"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Form Content -->
      <div class="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar bg-[#fcfcfc]">
        <form
          class="space-y-10"
          @submit.prevent="submitOffer"
        >
          <!-- Comparison View -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Requested Item -->
            <div class="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm space-y-4">
              <p class="text-[9px] font-black text-primary-600 uppercase tracking-widest italic">
                İSTEDİĞİNİZ ÜRÜN
              </p>
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 rounded-2xl bg-gray-50 p-1 border border-black/5 overflow-hidden flex-shrink-0">
                  <img
                    :src="getMainImage(item)"
                    class="w-full h-full object-cover rounded-xl"
                  >
                </div>
                <div>
                  <h4 class="text-sm font-black text-gray-900 uppercase leading-snug">
                    {{ item.title }}
                  </h4>
                  <p class="text-[10px] font-bold text-gray-400 mt-0.5 uppercase">
                    {{ item.company.name }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Offered Item Placeholder/Selector -->
            <div class="bg-gray-900 rounded-[2rem] p-6 text-white space-y-4 relative overflow-hidden group">
              <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl" />
              <p class="text-[9px] font-black text-primary-400 uppercase tracking-widest italic">
                TEKLİF EDİLEN
              </p>
              <div
                v-if="selectedItem"
                class="flex items-center space-x-4"
              >
                <div class="w-16 h-16 rounded-2xl bg-white/10 p-1 border border-white/5 overflow-hidden flex-shrink-0">
                  <img
                    :src="getMainImage(selectedItem)"
                    class="w-full h-full object-cover rounded-xl"
                  >
                </div>
                <div>
                  <h4 class="text-sm font-black text-white uppercase leading-snug">
                    {{ selectedItem.title }}
                  </h4>
                  <p class="text-[10px] font-bold text-gray-500 mt-0.5 uppercase">
                    STOK: {{ selectedItemAvailable }}
                  </p>
                </div>
              </div>
              <div
                v-else
                class="flex items-center space-x-4 h-16"
              >
                <div
                  class="w-16 h-16 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center"
                >
                  <InformationCircleIcon class="h-6 w-6 text-white/20" />
                </div>
                <p class="text-xs font-black text-white/30 uppercase italic">
                  Henüz seçilmedi
                </p>
              </div>
            </div>
          </div>

          <!-- Form Fields -->
          <div class="space-y-8">
            <!-- Select Item -->
            <div class="space-y-3">
              <label class="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">KENDİ ÜRÜNÜNÜZÜ
                SEÇİN</label>
              <div
                v-if="myItems.length > 0"
                class="relative group"
              >
                <select
                  v-model="formData.offeredItemId"
                  class="w-full bg-white border border-gray-100 rounded-3xl px-8 py-5 text-sm font-black text-gray-900 uppercase shadow-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option
                    value=""
                    disabled
                  >
                    Lütfen bir ilan seçin...
                  </option>
                  <option
                    v-for="it in myItems"
                    :key="it.id"
                    :value="it.id"
                  >
                    {{ it.title }} | KALAN: {{ it.availableQuantity }} {{ it.unit }}
                  </option>
                </select>
                <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDownIcon class="h-5 w-5" />
                </div>
              </div>
              <div
                v-else
                class="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-center text-amber-700"
              >
                <InformationCircleIcon class="h-10 w-10 mr-4 opacity-50" />
                <p class="text-xs font-black uppercase tracking-tight italic">
                  Takas yapabilmek için önce bir ürün eklemelisiniz.
                </p>
              </div>
            </div>

            <!-- Quantities -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="space-y-3">
                <label class="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">OFFERED
                  QUANTITY</label>
                <div class="relative">
                  <input
                    v-model.number="formData.offeredQuantity"
                    type="number"
                    step="0.01"
                    :max="selectedItemAvailable"
                    class="w-full bg-white border border-gray-100 rounded-3xl px-8 py-5 text-xl font-black text-gray-900 placeholder-gray-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                    placeholder="0.00"
                    required
                  >
                  <span
                    class="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary-600 uppercase tracking-widest"
                  >{{
                    selectedItemUnit }}</span>
                </div>
              </div>
              <div class="space-y-3">
                <label class="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">REQUESTED
                  QUANTITY</label>
                <div class="relative">
                  <input
                    v-model.number="formData.requestedQuantity"
                    type="number"
                    step="0.01"
                    class="w-full bg-white border border-gray-100 rounded-3xl px-8 py-5 text-xl font-black text-gray-900 placeholder-gray-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                    placeholder="0.00"
                    required
                  >
                  <span
                    class="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-600 uppercase tracking-widest"
                  >{{
                    item.unit }}</span>
                </div>
              </div>
            </div>

            <!-- Cash Adjustment -->
            <div class="space-y-4">
              <div class="flex items-center justify-between ml-1">
                <label class="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">CASH
                  ADJUSTMENT</label>
                <div class="group relative cursor-help">
                  <InformationCircleIcon class="h-4 w-4 text-gray-300 hover:text-primary-500 transition-colors" />
                  <div
                    class="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 text-white text-[9px] p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold uppercase tracking-widest leading-normal"
                  >
                    (+) SİZİN ÖDEYECEĞİNİZ <br> (-) SİZE ÖDENECEK
                  </div>
                </div>
              </div>
              <div class="relative">
                <div class="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300 italic">
                  ₺
                </div>
                <input
                  v-model.number="formData.cashDifference"
                  type="number"
                  step="0.01"
                  class="w-full bg-white border border-gray-100 rounded-3xl pl-16 pr-8 py-5 text-2xl font-black text-gray-900 placeholder-gray-100 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                  placeholder="0.00"
                >
              </div>
            </div>

            <!-- Message -->
            <div class="space-y-3">
              <label class="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">PERSONAL
                NOTE</label>
              <textarea
                v-model="formData.message"
                rows="4"
                class="w-full bg-white border border-gray-100 rounded-[2rem] px-8 py-6 text-sm font-medium text-gray-600 placeholder-gray-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm resize-none italic"
                placeholder="Takas detayları hakkında profesyonel bir not bırakın..."
              />
            </div>

            <!-- Legal Checkbox -->
            <div class="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 shadow-inner group">
              <label class="flex items-start cursor-pointer space-x-5">
                <div class="relative flex items-center h-7 pt-1">
                  <input
                    v-model="legalAccepted"
                    type="checkbox"
                    class="h-6 w-6 text-primary-600 border-gray-200 rounded-xl focus:ring-offset-0 focus:ring-primary-500/20 cursor-pointer"
                    required
                  >
                </div>
                <div class="flex-1">
                  <p class="text-xs font-black text-gray-900 uppercase tracking-tight leading-relaxed italic">
                    <span
                      class="text-primary-600 hover:text-primary-700 underline decoration-primary-600/30 decoration-2 underline-offset-4 transition-all"
                      @click.prevent="showLegalModal = true"
                    >
                      DİJİTAL TAKAS TAAHHÜTNAMESİ VE ONAM FORMU
                    </span>'nu okudum ve kabul ediyorum.
                  </p>
                  <p class="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">GİZLİLİK VE KVKK
                    UYUMLULUĞU DAHİLDİR</p>
                </div>
              </label>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer Actions -->
      <div class="p-10 bg-white border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          class="bg-gray-50 border border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-[1.5rem] py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-sm"
          @click="$emit('close')"
        >
          İŞLEMİ İPTAL ET
        </button>
        <button
          :disabled="submitting || !formData.offeredItemId || !legalAccepted"
          class="relative bg-primary-600 hover:bg-primary-700 text-white rounded-[1.5rem] py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl shadow-primary-600/30 disabled:opacity-50 disabled:grayscale overflow-hidden group"
          @click="submitOffer"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          />
          {{ submitting ? 'VERİLER İŞLENİYOR...' : 'RESMİ TEKLİFİ GÖNDER' }}
        </button>
      </div>
    </div>

    <!-- Legal Modal -->
    <LegalDocumentModal
      :is-open="showLegalModal"
      title="BazarX Dijital Takas Taahhütnamesi"
      :content="LEGAL_TEXT"
      @close="showLegalModal = false"
      @confirm="acceptLegal"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, useNuxtApp, useApi } from '#imports'
import ArrowsRightLeftIcon from '@heroicons/vue/24/outline/ArrowsRightLeftIcon'
import XMarkIcon from '@heroicons/vue/24/outline/XMarkIcon'
import InformationCircleIcon from '@heroicons/vue/24/outline/InformationCircleIcon'
import ChevronDownIcon from '@heroicons/vue/24/outline/ChevronDownIcon'
import LegalDocumentModal from '~/components/modals/LegalDocumentModal.vue'

const props = defineProps({
  item: { type: Object, required: true },
  isCounter: { type: Boolean, default: false },
  originalOffer: { type: Object, default: null }
})

const emit = defineEmits(['close', 'success'])
const { $api } = useApi()
const myItems = ref([])
const submitting = ref(false)
const legalAccepted = ref(false)
const showLegalModal = ref(false)

const LEGAL_TEXT = `BAZARX DİJİTAL TAKAS VE TESLİM TAAHHÜTNAMESİ

1. TARAFLAR VE KONU: İşbu taahhütname, BazarX platformu üzerinden gerçekleştirilen dairesel veya karşılıklı takas işlemlerinde; gönderici firmanın mal teslimini, alıcı firmanın kabul şartlarını ve platformun "Güvenli Takas Havuzu" (X-Secure Step) işleyişini düzenler.

2. X-SECURE STEP VE NAKİT BLOKE:
* İşlem hacminin %20'si oranındaki tutar, "Teminat Bedeli" olarak BazarX hesabında bloke edilir.
* Bu bedel, işlemin 5. aşaması başarıyla tamamlandığında, ilgili Tier seviyesine ait hizmet komisyonu kesildikten sonra kullanıcıya iade edilir.

3. YERİNDE STOK VE TESLİM TAAHHÜDÜ:
* Gönderici, takasa konu olan ürünlerin mülkiyetinin kendisine ait olduğunu, ürünlerin beyan edilen teknik özelliklere sahip olduğunu ve kendi deposunda (on-site) sevkiyata hazır bulunduğunu beyan eder.
* Sevkiyatın, sistem tarafından belirlenen 5 (beş) kademeli takvime uygun olarak gerçekleştirileceği taahhüt edilir.

4. CAYMA VE TAZMİNAT:
* Takas süreci başladıktan sonra, geçerli bir mücbir sebep olmaksızın sevkiyatı durduran veya ayıplı mal gönderen tarafın %20'lik Nakit Blokesi, BazarX tarafından "İşlem İptal Tazminatı" ve "Karşı Taraf Mağduriyet Giderimi" olarak irat kaydedilir.

5. DİJİTAL ONAYIN BAĞLAYICILIĞI:
* İşbu formun dijital olarak onaylanması, 6098 sayılı Türk Borçlar Kanunu ve 6102 sayılı Türk Ticaret Kanunu uyarınca ıslak imzalı taahhütname hükmündedir.

6. TİCARİ SIRLARIN KORUNMASI VE VERİ GÜVENLİĞİ (KVKK):
* Ticari Gizlilik: Kullanıcı tarafından sisteme girilen "Atıl Ürünler" ve "İstekler" listesi, BazarX AI eşleşme algoritması tarafından sadece uygun takas zincirlerinin kurulması amacıyla işlenir. Bu veriler, bir eşleşme kesinleşip taraflar karşılıklı "Ön Onay" verene kadar diğer kullanıcılarla anonim (firma ismi gizli) olarak paylaşılabilir.
* Veri Minimizasyonu: Takas süreci (X-Secure Step) boyunca taraflar birbirlerinin ticari unvan, vergi dairesi ve yetkili bilgilerine yalnızca yasal faturalandırma ve lojistik süreçleri için erişebilirler.
* Rekabet Yasağı: BazarX, platform üzerinden elde edilen envanter ve kapasite bilgilerini hiçbir koşulda üçüncü taraf analiz şirketlerine veya rakip firmalara "pazar payı analizi" veya "stok verisi" olarak satmayacağını/paylaşmayacağını taahhüt eder.
* KVKK Uyumu: 6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca, yetkili personel bilgileri sadece işlem güvenliği için işlenir. Takas işlemi tamamlandıktan 12 ay sonra (yasal saklama süreleri saklı kalmak kaydıyla) operasyonel veriler anonimleştirilir.`

const formData = ref({
  fromCompanyId: '',
  toCompanyId: props.isCounter ? props.originalOffer.fromCompanyId : props.item.companyId,
  offeredItemId: props.isCounter ? props.originalOffer.requestedItemId : '',
  requestedItemId: props.isCounter ? props.originalOffer.offeredItemId : props.item.id,
  offeredQuantity: props.isCounter ? props.originalOffer.requestedQuantity : 0,
  requestedQuantity: props.isCounter ? props.originalOffer.offeredQuantity : props.item.quantity,
  cashDifference: props.isCounter ? -props.originalOffer.cashDifference : 0, // Invert if countering
  message: ''
})

// Computed properties for selected item
const selectedItem = computed(() => {
  return myItems.value.find(it => it.id === formData.value.offeredItemId)
})

// Default offered quantity when item changes
watch(() => formData.value.offeredItemId, (newVal) => {
  if (newVal && selectedItem.value && formData.value.offeredQuantity === 0) {
    formData.value.offeredQuantity = selectedItem.value.availableQuantity
  }
})

const selectedItemAvailable = computed(() => {
  return selectedItem.value?.availableQuantity || 0
})

const selectedItemUnit = computed(() => {
  return selectedItem.value?.unit || 'ADET'
})

const fetchMyCompanyAndItems = async () => {
  try {
    const compRes = await $api('/api/companies/me')

    if (compRes.success && compRes.company) {
      formData.value.fromCompanyId = compRes.company.id

      const itemsRes = await $api('/api/surplus', {
        query: { companyId: compRes.company.id, status: 'active' }
      })

      if (itemsRes.success) {
        myItems.value = itemsRes.items.map(item => ({
          ...item,
          availableQuantity: item.quantity - (item.blockedQuantity || 0)
        })).filter(item => item.availableQuantity > 0)
      }
    }
  } catch (error) {
    console.error('Fetch error in TradeOfferModal:', error)
  }
}

const acceptLegal = () => {
  legalAccepted.value = true
  showLegalModal.value = false
}

const submitOffer = async () => {
  if (submitting.value) return
  if (!legalAccepted.value) {
    const toast = useNuxtApp().$toast
    toast.error('Lütfen Dijital Takas Taahhütnamesini onaylayın.')
    return
  }

  if (formData.value.offeredQuantity <= 0 || formData.value.requestedQuantity <= 0) {
    const toast = useNuxtApp().$toast
    toast.error('Lütfen geçerli miktarlar girin (0\'dan büyük olmalıdır).')
    return
  }

  submitting.value = true

  try {
    const endpoint = props.isCounter ? `/api/offers/${props.originalOffer.id}/counter` : '/api/offers'
    
    // Construct request body carefully
    const requestBody = { 
      ...formData.value, 
      legalAccepted: true,
      // For counters, the cashDifference is already prepared in formData initialization
    }

    const response = await $api(endpoint, {
      method: 'POST',
      body: requestBody
    })

    if (response.success) {
      const toast = useNuxtApp().$toast
      toast.success(props.isCounter ? 'Karşı teklifiniz başarıyla gönderildi!' : 'Takas teklifiniz başarıyla gönderildi!')
      emit('success')
    }
  } catch (error) {
    console.error('Submit trade error:', error)
    const toast = useNuxtApp().$toast
    const message = error.data?.message || 'Teklif gönderilirken bir hata oluştu.'
    toast.error(message)
  } finally {
    submitting.value = false
  }
}

const getMainImage = (item) => {
  if (item.images && item.images.length > 0) {
    const img = item.images[0]
    return typeof img === 'string' ? img : img.url
  }
  return '/placeholder-surplus.jpg'
}

onMounted(() => {
  fetchMyCompanyAndItems()
})
</script>

<style scoped>
.animate-modal-in {
  animation: modal-in 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-in {
  from {
    transform: translateY(20px) scale(0.98);
    opacity: 0;
  }

  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.1);
}
</style>
