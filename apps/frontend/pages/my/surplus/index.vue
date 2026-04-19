<template>
  <div class="py-12 lg:py-16">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
      <div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tightest italic uppercase leading-none mb-2">
          TAKAS ALANIM <span class="text-primary-600">|</span> {{ authStore.fullName }}
        </h1>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
          Takas süreçlerinizi ve ticari fazlası ürünlerinizi buradan yönetebilirsiniz.
        </p>
      </div>

      <div class="flex items-center space-x-4">
        <button
          class="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-400 hover:text-primary-600"
          title="Yenile"
          @click="handleRefresh"
        >
          <ArrowPathIcon
            class="h-6 w-6"
            :class="{ 'animate-spin': loading }"
          />
        </button>
        <button
          class="btn-primary space-x-2 px-8 py-4 !rounded-2xl shadow-xl shadow-primary-500/20"
          @click="openCreateModal"
        >
          <PlusIcon class="h-5 w-5" />
          <span class="font-black uppercase tracking-wider text-sm">YENİ İLAN EKLE</span>
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div
      v-if="myCompany"
      class="flex space-x-1 bg-gray-100 p-1 rounded-2xl w-fit mb-8"
    >
      <button
        :class="activeTab === 'listings' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'"
        class="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        @click="activeTab = 'listings'"
      >
        İLANLARIM
      </button>
      <button
        :class="activeTab === 'received' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'"
        class="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        @click="activeTab = 'received'"
      >
        GELEN TEKLİFLER
      </button>
      <button
        :class="activeTab === 'sent' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'"
        class="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        @click="activeTab = 'sent'"
      >
        GİDEN TEKLİFLER
      </button>
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/my/offers"
          class="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-xl hover:bg-indigo-100 transition-all font-bold text-sm shadow-sm"
        >
          <ChatBubbleLeftRightIcon class="h-5 w-5" />
          <span>Tekliflerimi Yönet</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Company Check -->
    <div
      v-if="!loading && !myCompany"
      class="bg-amber-50 rounded-[2.5rem] p-10 border border-amber-100 mb-12 flex flex-col items-center text-center"
    >
      <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
        <BuildingOfficeIcon class="h-10 w-10 text-amber-600" />
      </div>
      <h3 class="text-2xl font-black text-gray-900 mb-2 uppercase italic tracking-tight">
        Firma Profiliniz Bulunmuyor
      </h3>
      <p class="text-sm font-medium text-gray-600 max-w-md mb-8">
        Ticari Takas platformunda işlem yapabilmek için önce
        bir firma profili oluşturmanız gerekmektedir.
      </p>
      <button
        class="bg-gray-900 text-white rounded-2xl px-10 py-4 text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl"
        @click="showCompanyModal = true"
      >
        FİRMA
        OLUŞTUR
      </button>
    </div>

    <!-- Items List -->
    <div
      v-else-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="h-96 bg-gray-50 rounded-[2.5rem] animate-pulse"
      />
    </div>

    <div v-else-if="activeTab === 'listings'">
      <div
        v-if="items.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <div
          v-for="item in items"
          :key="item.id"
          class="group bg-white rounded-[3rem] p-6 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative"
        >
          <div class="aspect-video rounded-[2rem] overflow-hidden mb-6 bg-gray-50 border border-gray-100">
            <img
              :src="getMainImage(item)"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            >
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span
                class="px-3 py-1 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-full border border-gray-100"
              >{{
                item.category }}</span>
              <span class="text-[10px] font-black text-primary-600 uppercase tracking-widest">{{ item.status }}</span>
            </div>

            <h3 class="text-xl font-black text-gray-900 uppercase italic tracking-tight leading-tight truncate">
              {{
                item.title }}
            </h3>

            <div class="flex items-center justify-between text-xs font-bold text-gray-500 border-t border-gray-50 pt-4">
              <div class="flex flex-col">
                <span
                  class="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1"
                >MİKTAR</span>
                <span>{{ item.quantity }} {{ item.unit }}</span>
              </div>
              <div class="flex flex-col text-right">
                <span
                  class="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1"
                >DEĞER</span>
                <span class="text-primary-600">{{ formatCurrency(item.unitPrice * item.quantity) }}</span>
              </div>
            </div>

            <!-- Reactivation Button for Traded Items -->
            <button
              v-if="item.status === 'traded'"
              class="w-full mt-4 py-3 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
              @click.stop="reactivateItem(item)"
            >
              <ArrowPathIcon class="h-3 w-3" />
              Yeniden Aktif Et
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              v-if="getItemChain(item.id)"
              class="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors shadow-lg backdrop-blur-sm"
              title="Takas Zincirini Gör"
              @click.stop="showChainDetails(getItemChain(item.id))"
            >
              <LinkIcon class="h-4 w-4" />
            </button>
            <button
              class="bg-gray-900/90 text-white p-2 rounded-full hover:bg-black transition-colors shadow-lg backdrop-blur-sm"
              @click.stop="editItem(item)"
            >
              <PencilSquareIcon class="h-4 w-4" />
            </button>
            <button
              class="bg-red-500/90 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg backdrop-blur-sm"
              @click.stop="deleteItem(item.id)"
            >
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>

          <!-- Trade Indicator -->
          <div
            v-if="getItemChain(item.id)"
            class="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between group-hover:bg-indigo-100 transition-colors cursor-pointer"
            @click="showChainDetails(getItemChain(item.id))"
          >
            <div class="flex items-center gap-2">
              <span class="text-xs">🤝</span>
              <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AKILLI TAKAS
                EŞLEŞMESİ</span>
            </div>
            <span class="text-[10px] font-bold text-indigo-400">DETAY ></span>
          </div>
        </div>
      </div>

      <div
        v-else
        class="text-center py-24 bg-white/50 backdrop-blur-md rounded-[4rem] border border-dashed border-gray-200"
      >
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ArchiveBoxIcon class="h-10 w-10 text-gray-300" />
        </div>
        <h3 class="text-2xl font-black text-gray-900 mb-2 uppercase italic tracking-tight">
          Henüz ilanınız bulunmuyor
        </h3>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
          Fazla stoklarınızı nakite
          veya ihtiyacınız olan farklı bir mala dönüştürmek için hemen başlayın.
        </p>
      </div>
    </div>

    <!-- Offers List -->
    <div v-else-if="activeTab === 'received' || activeTab === 'sent'">
      <div
        v-if="offers.length > 0"
        class="space-y-4"
      >
        <div
          v-for="offer in offers"
          :key="offer.id"
          class="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div class="flex items-center gap-4 flex-1">
            <img
              :src="getMainImage(activeTab === 'received' ? offer.offeredItem : offer.requestedItem)"
              class="w-20 h-20 rounded-2xl object-cover bg-gray-50 border border-gray-100 shadow-sm"
            >
            <div>
              <p class="text-[9px] font-black text-primary-600 uppercase tracking-widest mb-1">
                {{ activeTab ===
                  'received' ? 'TEKLİF EDEN' : 'ALICI' }}
              </p>
              <h4 class="text-lg font-black text-gray-900">
                {{ activeTab === 'received' ? offer.fromCompany.name :
                  offer.toCompany.name }}
              </h4>
              <p class="text-xs text-gray-500 font-medium">
                {{ activeTab === 'received' ? offer.offeredItem?.title :
                  offer.requestedItem?.title }}
              </p>
            </div>
          </div>

          <div class="text-center">
            <span
              class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border"
              :class="{
                'bg-yellow-50 text-yellow-700 border-yellow-100': offer.status === 'pending' || offer.status === 'waiting_approval',
                'bg-green-50 text-green-700 border-green-100': ['accepted', 'completed'].includes(offer.status),
                'bg-red-50 text-red-700 border-red-100': offer.status === 'rejected'
              }"
            >
              {{
                offer.status === 'waiting_approval' ? 'YÖNETİCİ ONAYI BEKLİYOR' :
                offer.status === 'pending' ? (activeTab === 'received' ? 'YANITINIZI BEKLİYOR' : 'KARŞI TARAF BEKLENİYOR')
                :
                offer.status === 'accepted' ? 'TAKAS SÜRECİNDE' :
                offer.status === 'completed' ? 'TAMAMLANDI' :
                offer.status
              }}
            </span>
          </div>

          <div class="flex-1 text-right">
            <template v-if="activeTab === 'received' && (offer.status === 'pending' || offer.status === 'waiting_approval' || offer.status === 'PENDING' || offer.status === 'WAITING_APPROVAL')">
              <NuxtLink
                v-if="offer.chainId"
                to="/my/trades"
                class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold mr-2 hover:bg-indigo-100 transition uppercase tracking-widest"
              >
                DETAY
              </NuxtLink>
              <button
                class="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold mr-2 hover:bg-green-700 transition"
                @click="acceptOffer(offer.id)"
              >
                KABUL
                ET
              </button>
              <button
                class="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
                @click="rejectOffer(offer.id)"
              >
                REDDET
              </button>
            </template>
            <template v-else-if="offer.status === 'completed'">
              <div class="flex items-center gap-2">
                <span
                  class="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-[10px] font-black transition tracking-widest uppercase flex items-center gap-1 cursor-not-allowed"
                >
                  💬 SOHBET
                </span>
                <span
                  class="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-[10px] font-black transition tracking-widest uppercase cursor-not-allowed"
                >
                  TAKASI YÖNET
                </span>
              </div>
            </template>
            <template v-else-if="offer.status === 'accepted'">
              <div class="flex items-center gap-2">
                <NuxtLink
                  :to="`/my/offers?offerId=${offer.id}&type=${activeTab}`"
                  class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black hover:bg-indigo-100 transition tracking-widest uppercase"
                >
                  💬 SOHBET
                </NuxtLink>
                <NuxtLink
                  :to="`/my/surplus/swap/${offer.id}`"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg text-[10px] font-black hover:bg-primary-700 transition tracking-widest uppercase"
                >
                  TAKASI YÖNET
                </NuxtLink>
              </div>
            </template>
            <template v-else>
              <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                DURUM
              </p>
              <p class="font-bold text-sm">
                {{ new Date(offer.createdAt).toLocaleDateString() }}
              </p>
            </template>
          </div>
        </div>
      </div>
      <div
        v-else
        class="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs"
      >
        HENÜZ BİR TEKLİF YOK
      </div>
    </div>

    <!-- Trade Detail Modal -->
    <TransitionRoot
      appear
      :show="isTradeModalOpen"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-50"
        @close="isTradeModalOpen = false"
      >
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-2xl transform overflow-hidden rounded-[2.5rem] bg-white p-8 text-left align-middle shadow-2xl transition-all border border-gray-100"
              >
                <DialogTitle
                  as="h3"
                  class="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3"
                >
                  <span class="p-2 bg-indigo-50 rounded-xl">ℹ️</span>
                  Takas Zinciri Detayı
                </DialogTitle>

                <div
                  v-if="selectedChain"
                  class="space-y-6"
                >
                  <div class="flex justify-between items-center mb-4">
                    <span
                      :class="getStatusClass(selectedChain.status)"
                      class="px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-widest"
                    >
                      {{ selectedChain.status === 'PENDING' ? 'ONAY BEKLİYOR' : selectedChain.status === 'COMPLETED' ?
                        'TAMAMLANDI' : selectedChain.status }}
                    </span>
                    <span class="text-xs font-black text-gray-400">#{{ selectedChain.id.slice(-6) }}</span>
                  </div>

                  <div
                    v-for="offer in selectedChain.offers"
                    :key="offer.id"
                    class="p-5 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div class="flex justify-between items-start mb-4">
                      <div>
                        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">KİMDEN
                          ->
                          KİME</span>
                        <p class="font-bold text-gray-900">
                          {{ offer.fromCompany.name }} ➜ {{ offer.toCompany.name }}
                        </p>
                      </div>
                      <div class="text-right">
                        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">DEĞER
                          (Tahmini)</span>
                        <p class="font-bold text-indigo-600">
                          {{ formatCurrency(offer.offeredValue) }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-4 pt-4 border-t border-gray-200/50">
                      <div
                        class="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-xl"
                      >
                        📦
                      </div>
                      <div>
                        <p class="text-sm font-black text-gray-800">
                          {{ offer.offeredItem?.title || 'Ürün' }}
                        </p>
                        <p class="text-xs font-medium text-gray-500">
                          {{ offer.offeredQuantity }} Birim
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="selectedChain.status === 'PENDING'"
                    class="p-4 bg-amber-50 rounded-2xl border border-amber-100"
                  >
                    <p class="text-xs font-bold text-amber-700 flex items-center gap-2">
                      <span>⏰</span>
                      Bu takas döngüsü için son onay tarihi: {{ formatDate(selectedChain.expiresAt) }}
                    </p>
                  </div>
                </div>

                <div class="mt-8 flex justify-between gap-4">
                  <NuxtLink
                    v-if="selectedChain"
                    :to="`/my/trades`"
                    class="btn-primary !py-3 !px-6"
                  >
                    İŞLEMLERE GİT
                  </NuxtLink>
                  <button
                    class="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                    @click="isTradeModalOpen = false"
                  >
                    Kapat
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modals -->
    <CreateSurplusModal
      v-if="showCreateModal"
      :item="selectedItem"
      @close="showCreateModal = false"
      @success="fetchItems"
    />
    <CreateCompanyModal
      v-if="showCompanyModal"
      @close="showCompanyModal = false"
      @success="fetchMyCompany"
    />
  </div>
</template>

<script setup>
import {
  BuildingOfficeIcon, PlusIcon, ArchiveBoxIcon,
  PencilSquareIcon, TrashIcon, ArrowPathIcon, LinkIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

const authStore = useAuthStore()
const { $api } = useApi()
const items = ref([])
const offers = ref([])
const myChains = ref([])
const activeTab = ref('listings')
const myCompany = ref(null)
const loading = ref(true)
const showCreateModal = ref(false)
const showCompanyModal = ref(false)
const isTradeModalOpen = ref(false)
const selectedItem = ref(null)
const selectedChain = ref(null)

const openCreateModal = () => {
  selectedItem.value = null
  showCreateModal.value = true
}

const editItem = (item) => {
  selectedItem.value = item
  showCreateModal.value = true
}

const deleteItem = async (id) => {
  if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) return

  try {
    const response = await $api(`/api/surplus/${id}`, {
      method: 'DELETE'
    })
    if (response.success) {
      useNuxtApp().$toast.success('İlan silindi.')
      items.value = items.value.filter(i => i.id !== id)
    }
  } catch (error) {
    console.error('Delete error:', error)
    useNuxtApp().$toast.error('İlan silinirken bir hata oluştu.')
  }
}

const reactivateItem = async (item) => {
  const qty = prompt(`${item.title} için yeni miktar giriniz (${item.unit}):`, item.quantity)
  if (qty === null) return

  const quantity = parseFloat(qty)
  if (isNaN(quantity) || quantity <= 0) {
    useNuxtApp().$toast.error('Lütfen geçerli bir miktar giriniz.')
    return
  }

  try {
    const response = await $api(`/api/surplus/${item.id}/reactivate`, {
      method: 'PATCH',
      body: { quantity }
    })

    if (response.success) {
      useNuxtApp().$toast.success('İlan başarıyla yeniden aktif edildi.')
      fetchItems()
    }
  } catch (error) {
    console.error('Reactivate error:', error)
    useNuxtApp().$toast.error(error.data?.error || 'İşlem başarısız.')
  }
}

const fetchMyCompany = async () => {
  try {
    const response = await $api('/api/companies/me')
    if (response.success) {
      myCompany.value = response.company
      if (myCompany.value) fetchItems()
    }
  } catch (error) {
    console.error('Fetch company error:', error)
  } finally {
    loading.value = false
  }
}

const handleRefresh = async () => {
  if (activeTab.value === 'listings') {
    await fetchItems()
  } else {
    await fetchOffers()
  }
}

const fetchItems = async () => {
  if (!myCompany.value) return
  try {
    const [itemsRes, chainsRes] = await Promise.all([
      $api('/api/surplus', {
        query: { companyId: myCompany.value.id, status: 'all' }
      }),
      $api('/api/barter/my-chains')
    ])

    if (itemsRes.success) {
      items.value = itemsRes.items
    }
    if (chainsRes.data) {
      myChains.value = chainsRes.data
    }
  } catch (error) {
    console.error('Fetch my items/chains error:', error)
  }
}

const getItemChain = (itemId) => {
  // Find a chain where this item is offered
  return myChains.value.find(chain =>
    chain.offers.some(offer => offer.offeredItemId === itemId)
  )
}

const showChainDetails = (chain) => {
  selectedChain.value = chain
  isTradeModalOpen.value = true
}


const getStatusClass = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-amber-100 text-amber-700'
    case 'COMPLETED': return 'bg-green-100 text-green-700'
    case 'FAILED': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}


const acceptOffer = async (id) => {
  const isConfirmed = confirm(
    "⚠️ TAKAS ONAYI\n\n" +
    "Bu teklifi kabul ettiğinizde:\n" +
    "• Takas süreci resmen başlayacaktır.\n" +
    "• Varsa teminat tutarı bakiyenizden bloke edilebilir.\n" +
    "• Stok miktarınız otomatik olarak düşülecektir.\n\n" +
    "Devam etmek istediğinize emin misiniz?"
  )
  if (!isConfirmed) return
  try {
    const response = await $api(`/api/offers/${id}/accept`, {
      method: 'PATCH'
    })
    if (response.success) {
      useNuxtApp().$toast.success('Teklif kabul edildi.')
      // Refresh both tabs to ensure UI is in sync
      await Promise.all([fetchOffers(), fetchItems()])
    }
  } catch (error) {
    console.error('Accept error:', error)
    const msg = error.data?.message || 'İşlem başarısız.'
    useNuxtApp().$toast.error(msg)
  }
}

const rejectOffer = async (id) => {
  if (!confirm('Bu teklifi reddetmek istediğinize emin misiniz?')) return
  try {
    const response = await $api(`/api/offers/${id}/status`, {
      method: 'PATCH',
      body: { status: 'rejected' }
    })
    if (response.success) {
      useNuxtApp().$toast.success('Teklif reddedildi.')
      await fetchOffers()
    }
  } catch (error) {
    console.error('Reject error:', error)
    const msg = error.data?.message || 'İşlem başarısız.'
    useNuxtApp().$toast.error(msg)
  }
}

const fetchOffers = async () => {
  if (!myCompany.value) return
  loading.value = true
  try {
    const response = await $api('/api/offers/my', {
      query: {
        companyId: myCompany.value.id,
        type: activeTab.value // 'received' or 'sent'
      }
    })
    if (response.success) {
      offers.value = response.offers
    }
  } catch (error) {
    console.error('Fetch offers error:', error)
  } finally {
    loading.value = false
  }
}

watch(activeTab, (newTab) => {
  if (newTab === 'listings') {
    fetchItems()
  } else {
    fetchOffers()
  }
})

const getMainImage = (item) => {
  if (item?.images && item.images.length > 0) {
    const img = item.images[0]
    return typeof img === 'string' ? img : img.url
  }
  return '/placeholder-surplus.jpg'
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0)
}

onMounted(async () => {
  await authStore.init()
  if (authStore.isAuthenticated) {
    fetchMyCompany()
  } else {
    loading.value = false
    useRouter().push('/login')
  }
})
</script>
