<script setup lang="ts">
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { debounce } from 'lodash-es'
import { iller } from '~/assets/css/data/component/iller'

const props = defineProps<{
  modelValue: boolean
  editingAd: any | null
  currentEcosystem: string
}>()

const emit = defineEmits(['update:modelValue', 'save'])

const { $api } = useApi()
const { $toast } = useNuxtApp()
const { resolveImageUrl } = useAppImage()

const modalOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const saving = ref(false)
const productSearch = ref('')
const searchResults = ref<any[]>([])
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const form = ref({
  side: 'LEFT',
  title: '',
  category: '',
  subtitle: '',
  image: '',
  emoji: '',
  link: '',
  isActive: true,
  order: 0,
  ecosystems: ['GLOBAL'],
  locationTags: { city: '', district: '' }
})

watch(() => props.editingAd, (newAd) => {
  if (newAd) {
    const { parseLocationsToTags } = useAdminSideAds()
    form.value = { ...newAd, locationTags: parseLocationsToTags(newAd.locations) }
  } else {
    form.value = {
      side: 'LEFT', title: '', category: '', subtitle: '', image: '', emoji: '', link: '',
      isActive: true, order: 0, ecosystems: [props.currentEcosystem],
      locationTags: { city: '', district: '' }
    }
  }
}, { immediate: true })

const handleProductSearch = debounce(async () => {
  if (productSearch.value.length < 2) {
    searchResults.value = []
    return
  }
  try {
    const res = await $api(`/api/products?search=${productSearch.value}`)
    searchResults.value = (res as any).data || []
  } catch (e) {
    console.error('Search error:', e)
  }
}, 300)

const selectProduct = (product: any) => {
  form.value.title = product.name
  form.value.category = product.Category?.name?.toUpperCase() || ''
  form.value.subtitle = product.description?.substring(0, 60) + (product.description?.length > 60 ? '...' : '')
  form.value.link = `/products/${product.id}`
  form.value.image = product.image?.url || product.image || ''
  searchResults.value = []
  productSearch.value = ''
}

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  uploading.value = true
  try {
    const res = await $api('/api/upload?type=banner', { method: 'POST', body: formData })
    if ((res as any).success) {
      form.value.image = (res as any).url
      $toast.success('Görsel yüklendi')
    }
  } catch (e) {
    $toast.error('Yükleme başarısız')
  } finally {
    uploading.value = false
  }
}

const onSave = async () => {
  if (!form.value.title) return $toast.error('Başlık zorunludur')
  saving.value = true
  try {
    emit('save', form.value)
  } finally {
    saving.value = false
  }
}

const cityList = computed(() => Object.keys(iller))
const districtList = computed(() => {
  if (form.value.locationTags?.city && (iller as any)[form.value.locationTags.city]) {
    return (iller as any)[form.value.locationTags.city]
  }
  return []
})
</script>

<template>
  <div v-if="modalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="modalOpen = false" />
    <div class="relative bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in duration-300">
      <div class="p-10 overflow-y-auto custom-scrollbar">
        <div class="flex items-center justify-between mb-10">
          <h3 class="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
            {{ editingAd ? 'Reklamı Düzenle' : 'Yeni Reklam Ekle' }}
          </h3>
          <button class="p-3 hover:bg-gray-100 rounded-2xl transition-colors" @click="modalOpen = false">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <div class="space-y-8">
          <div class="relative">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2">🔍 Ürünle Hızlı Doldur</label>
            <div class="relative">
              <input v-model="productSearch" type="text" placeholder="Ürün adı yazın..." class="w-full pl-12 pr-6 py-5 bg-gray-50 border-none rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none" @input="handleProductSearch">
              <MagnifyingGlassIcon class="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <div v-if="searchResults.length > 0" class="absolute z-50 w-full mt-3 bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl max-h-64 overflow-y-auto p-3">
              <div v-for="product in searchResults" :key="product.id" class="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4 rounded-2xl transition-all" @click="selectProduct(product)">
                <img :src="resolveImageUrl(product.image)" class="w-14 h-14 rounded-xl object-cover bg-gray-100 shadow-sm">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-gray-900 truncate italic tracking-tighter">{{ product.name }}</p>
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ product.Category?.name }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2">YERLEŞİM</label>
              <select v-model="form.side" class="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 appearance-none cursor-pointer">
                <option value="LEFT">Fırsat Alanı (Sol)</option>
                <option value="RIGHT">Reklam Alanı (Sağ)</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2">KATEGORİ ETİKETİ</label>
              <input v-model="form.category" type="text" placeholder="Örn: EMLAK" class="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2">ANA BAŞLIK</label>
              <input v-model="form.title" type="text" class="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10">
            </div>
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2">VARSA EMORJİ</label>
              <input v-model="form.emoji" type="text" placeholder="🎁" class="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10">
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2">ALT AÇIKLAMA</label>
            <input v-model="form.subtitle" type="text" class="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10">
          </div>

          <div class="space-y-4">
             <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">YAYIN LANACAK EKOSİSTEMLER</label>
             <div class="grid grid-cols-2 gap-4 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                <label v-for="eco in ['GLOBAL', 'BAZARX', 'TICARITAKAS', 'BARTER_BORSA']" :key="eco" class="flex items-center gap-3 cursor-pointer group">
                   <input v-model="form.ecosystems" type="checkbox" :value="eco" class="w-5 h-5 rounded-lg border-gray-300 text-orange-600 focus:ring-orange-500">
                   <span class="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900 transition-colors">{{ eco }}</span>
                </label>
             </div>
          </div>

          <div class="space-y-4">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">HEDEF LOKASYON</label>
            <div class="grid grid-cols-2 gap-6">
              <select v-model="form.locationTags.city" class="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 appearance-none cursor-pointer" @change="form.locationTags.district = ''">
                <option value="">Tüm İller</option>
                <option v-for="city in cityList" :key="city" :value="city">{{ city }}</option>
              </select>
              <select v-model="form.locationTags.district" :disabled="!form.locationTags.city" class="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 appearance-none cursor-pointer disabled:opacity-30">
                <option value="">Tüm İlçeler</option>
                <option v-for="district in districtList" :key="district" :value="district">{{ district }}</option>
              </select>
            </div>
          </div>

          <div class="space-y-4">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">GÖRSEL VE BAĞLANTI</label>
            <div class="p-6 bg-orange-50/50 rounded-[2rem] border-2 border-dashed border-orange-100 flex items-center gap-6">
               <div class="w-24 h-24 bg-white rounded-3xl border border-orange-100 shadow-inner flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img v-if="form.image" :src="resolveImageUrl(form.image)" class="w-full h-full object-cover">
                  <span v-else class="text-4xl">{{ form.emoji || '🎁' }}</span>
               </div>
               <div class="flex-1 space-y-3">
                  <button type="button" class="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline" @click="fileInput?.click()">
                    {{ uploading ? 'YÜKLENİYOR...' : 'GÖRSEL SEÇ VEYA DEĞİŞTİR' }}
                  </button>
                  <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="handleFileUpload">
                  <input v-model="form.image" type="text" placeholder="Görsel URL..." class="w-full bg-white border border-orange-100 rounded-xl px-4 py-3 text-[10px] font-mono outline-none">
               </div>
            </div>
            <input v-model="form.link" type="text" placeholder="Tıklandığında gidecek URL (/products/...)" class="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10">
          </div>

          <div class="flex items-center gap-6 pt-4">
            <button :class="form.isActive ? 'bg-green-600 text-white shadow-xl shadow-green-100' : 'bg-gray-100 text-gray-400'" class="flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all" @click="form.isActive = !form.isActive">
               {{ form.isActive ? 'YAYINDA' : 'PASİF' }}
            </button>
            <button :disabled="saving" class="flex-[2] bg-gray-900 text-white py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all" @click="onSave">
              {{ saving ? 'İŞLENİYOR...' : 'REKLAMI KAYDET' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
