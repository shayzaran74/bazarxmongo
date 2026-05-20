<template>
  <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
    <div class="relative bg-white w-full max-w-2xl shadow-2xl rounded-[2.5rem] overflow-hidden border border-gray-100">
      <div class="p-8 md:p-10">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h3 class="text-2xl font-black text-gray-900 uppercase tracking-tight">
              {{ isEdit ? 'Çekilişi Düzenle' : 'Yeni Çekiliş' }}
            </h3>
            <p class="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
              Sistem Parametreleri
            </p>
          </div>
          <button
            class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"
            @click="$emit('close')"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Form -->
        <form class="space-y-6" @submit.prevent="saveLottery">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Çekiliş Başlığı *</label>
              <input
                v-model="form.title"
                type="text"
                required
                class="form-input-premium"
                placeholder="Örn: Tesla Model Y Çekilişi"
              >
            </div>

            <div class="md:col-span-2 flex flex-col gap-2">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Özel Çekiliş Görseli</label>
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                  <img v-if="form.imageUrl" :src="resolveImageUrl(form.imageUrl)" class="w-full h-full object-cover">
                  <span v-else class="text-[10px] font-bold text-gray-400">YOK</span>
                </div>
                <div class="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer"
                    @change="onFileChange"
                    :disabled="uploading"
                  >
                  <p v-if="uploading" class="text-[10px] text-indigo-500 font-bold mt-1">YÜKLENİYOR...</p>
                </div>
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Ödül İlanı (İsteğe Bağlı)</label>
              <select v-model="form.listingId" class="form-input-premium">
                <option value="">İlan Seçin (İsteğe Bağlı)</option>
                <option v-for="l in listings" :key="l.id" :value="l.id">
                  {{ l.name }} - {{ formatPrice(l.price || 0) }}
                </option>
              </select>
              <p v-if="listingsError" class="text-xs text-red-500 mt-1 ml-1">{{ listingsError }}</p>

              <div v-if="selectedListing" class="mt-4 flex items-center p-3 bg-gray-50 rounded-[2rem] border border-gray-100">
                <img
                  :src="resolveImageUrl(selectedListing.images?.[0] || '/placeholder.png')"
                  class="w-16 h-16 rounded-2xl object-cover shadow-sm mr-4"
                >
                <div>
                  <p class="text-sm font-bold text-gray-900">{{ selectedListing.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatPrice(selectedListing.price || 0) }}</p>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Bilet Fiyatı (₺) *</label>
              <input v-model.number="form.ticketPrice" type="number" step="0.01" required class="form-input-premium">
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Ödül Değeri (₺)</label>
              <input v-model.number="form.prizeValue" type="number" step="0.01" class="form-input-premium">
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Hane Sayısı (Digits) *</label>
              <select v-model.number="form.ticketDigits" class="form-input-premium">
                <option :value="3">3 Haneli (000-999)</option>
                <option :value="4">4 Haneli (0000-9999)</option>
                <option :value="5">5 Haneli (00000-99999)</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Bilet Başı Numara *</label>
              <select v-model.number="form.numbersPerTicket" class="form-input-premium">
                <option :value="1">1 Numara (Standart)</option>
                <option :value="3">3 Numara</option>
                <option :value="6">6 Numara</option>
                <option :value="9">9 Numara</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Toplam Bilet Havuzu *</label>
              <input v-model.number="form.totalTickets" type="number" required class="form-input-premium" placeholder="Örn: 1000">
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Kişi Başı Maks. Bilet *</label>
              <input v-model.number="form.maxTicketsPerUser" type="number" required class="form-input-premium" placeholder="Örn: 10">
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Başlangıç Tarihi *</label>
              <input v-model="form.startTime" type="datetime-local" required class="form-input-premium">
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Bitiş Tarihi *</label>
              <input v-model="form.endTime" type="datetime-local" required class="form-input-premium">
            </div>
          </div>

          <div class="pt-6">
            <button
              type="submit"
              :disabled="saving"
              class="w-full bg-primary-600 hover:bg-primary-700 text-white py-5 rounded-3xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-50"
            >
              {{ saving ? 'İŞLEMDE...' : (isEdit ? 'DEĞİŞİKLİKLERİ KAYDET' : 'ÇEKİLİŞİ BAŞLAT') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from '#imports'
import XMarkIcon from '@heroicons/vue/24/outline/XMarkIcon'
import { useAppImage } from '~/composables/useAppImage'

interface ListingItem {
  id: string
  name: string
  price?: number
  images?: string[]
}

interface LotteryForm {
  title: string
  listingId: string
  imageUrl?: string
  ticketPrice: number
  prizeValue: number
  totalTickets: number
  maxTicketsPerUser: number
  ticketDigits: number
  numbersPerTicket: number
  startTime: string
  endTime: string
}

const initForm = () => {
  if (props.lottery) {
    const l = props.lottery
    form.value = {
      title: (l.title as string) || '',
      listingId: (l.listingId as string) || '',
      imageUrl: (l.imageUrl as string) || '',
      ticketPrice: Number(l.ticketPrice) || 0,
      prizeValue: Number(l.prizeValue) || 0,
      totalTickets: (l.totalTickets as number) || 100,
      maxTicketsPerUser: (l.maxTicketsPerUser as number) || 10,
      ticketDigits: (l.ticketDigits as number) || 3,
      numbersPerTicket: (l.numbersPerTicket as number) || 1,
      startTime: l.startTime ? new Date(l.startTime as string).toISOString().slice(0, 16) : '',
      endTime: l.endTime ? new Date(l.endTime as string).toISOString().slice(0, 16) : '',
    }
  } else {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    form.value = {
      title: '',
      listingId: '',
      imageUrl: '',
      ticketPrice: 0,
      prizeValue: 0,
      totalTickets: 100,
      maxTicketsPerUser: 10,
      ticketDigits: 3,
      numbersPerTicket: 1,
      startTime: tomorrow.toISOString().slice(0, 16),
      endTime: nextWeek.toISOString().slice(0, 16),
    }
  }
}

const props = defineProps<{ lottery?: Record<string, unknown> | null }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const { resolveImageUrl } = useAppImage()
const { $api } = useApi()
const { $toast } = useNuxtApp()

const saving = ref(false)
const uploading = ref(false)
const listings = ref<ListingItem[]>([])
const listingsError = ref('')
const isEdit = computed(() => !!props.lottery)

const selectedListing = computed<ListingItem | undefined>(() => {
  if (!form.value.listingId) return undefined
  return listings.value.find(l => l.id === form.value.listingId)
})

const form = ref<LotteryForm>({
  title: '',
  listingId: '',
  imageUrl: '',
  ticketPrice: 0,
  prizeValue: 0,
  totalTickets: 100,
  maxTicketsPerUser: 10,
  ticketDigits: 3,
  numbersPerTicket: 1,
  startTime: '',
  endTime: '',
})

const onFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  uploading.value = true
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'lotteries')

  try {
    const res = await $api<{ url: string }>('/api/v1/upload', {
      method: 'POST',
      body: formData
    })
    form.value.imageUrl = res.url
    $toast.success('Görsel yüklendi')
  } catch {
    $toast.error('Görsel yüklenemedi')
  } finally {
    uploading.value = false
  }
}

const fetchListings = async () => {
  listingsError.value = ''
  try {
    const res = await $api<{ items?: ListingItem[] } | ListingItem[]>('/api/v1/listings', {
      query: { limit: 100 },
    })
    listings.value = (res as any).data?.items || (res as any).data || []
  } catch {
    listingsError.value = 'İlanlar yüklenemedi. Kimlik doğrulama kontrol edin.'
  }
}

const saveLottery = async () => {
  saving.value = true
  try {
    const method = isEdit.value ? 'PUT' : 'POST'
    const url = isEdit.value
      ? `/api/v1/admin/lotteries/${props.lottery!.id}`
      : '/api/v1/admin/lotteries'

    await $api(url, {
      method,
      body: { ...form.value, listingId: form.value.listingId || undefined },
    })

    $toast.success('Başarıyla kaydedildi')
    emit('saved')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    $toast.error(err?.data?.message || 'Hata oluştu')
  } finally {
    saving.value = false
  }
}

const formatPrice = (p: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p)

onMounted(() => {
  initForm()
  fetchListings()
})
</script>

<style scoped>
.form-input-premium {
  width: 100%;
  background-color: #f9fafb;
  border: 2px dashed #f3f4f6;
  border-radius: 1.5rem;
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  transition: all 0.2s;
}
.form-input-premium:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #ffffff;
}
</style>
