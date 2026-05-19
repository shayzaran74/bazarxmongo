<template>
  <div class="min-h-screen bg-gray-50 p-6 lg:p-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight italic uppercase">
          🏷️ Marka <span class="text-indigo-600">Başvurularım</span>
        </h1>
        <p class="text-gray-500 mt-1 font-medium italic opacity-70">Mağazanıza eklemek istediğiniz markaları başvurun ve takip edin.</p>
      </div>
      <button
        class="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-gray-900 transition-all shadow-lg flex items-center gap-3 text-sm uppercase tracking-widest"
        @click="showWizard = true"
      >
        <PlusIcon class="w-5 h-5" /> YENİ BAŞVURU
      </button>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      <div v-for="(val, key) in statsItems" :key="key" class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-4">
        <div :class="val.color" class="w-12 h-12 rounded-2xl flex items-center justify-center border">
          <component :is="val.icon" class="w-6 h-6" />
        </div>
        <div>
          <div class="text-2xl font-black text-gray-900">{{ brandStats[key] || 0 }}</div>
          <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{{ val.label }}</div>
        </div>
      </div>
    </div>

    <!-- Brand List -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
    </div>

    <div v-else-if="brands.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="brand in brands" :key="brand.id"
        class="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all group"
      >
        <div class="flex items-start justify-between mb-5">
          <div class="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center group-hover:border-indigo-100 transition-colors">
            <img :src="resolveImageUrl(brand.brand?.logoUrl)" class="w-full h-full object-contain" @error="$event.target.src='/images/no-brand.png'">
          </div>
          <span :class="getStatusClass(brand.status)" class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
            {{ getStatusLabel(brand.status) }}
          </span>
        </div>

        <h3 class="text-lg font-black text-gray-900 mb-1 truncate">{{ brand.brand?.name || brand.brandName }}</h3>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Başvuru: {{ getApplicationTypeName(brand.applicationType) }}
        </p>

        <div v-if="brand.reviewNotes" class="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <p class="text-xs font-bold text-amber-700 italic">💬 {{ brand.reviewNotes }}</p>
        </div>

        <div class="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
          <span class="text-[10px] font-bold text-gray-400">{{ formatDate(brand.createdAt) }}</span>
          <span v-if="brand.status === 'PENDING'" class="flex items-center gap-1 text-amber-600 text-[10px] font-black uppercase tracking-widest">
            <ClockIcon class="w-3.5 h-3.5" /> İnceleniyor
          </span>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center gap-6 py-24">
      <div class="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center border border-dashed border-indigo-200">
        <TagIcon class="w-10 h-10 text-indigo-400" />
      </div>
      <p class="text-sm font-bold text-gray-500 italic">Henüz marka başvurusu yapılmamış.</p>
      <button class="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl text-sm hover:bg-gray-900 transition-all shadow-lg uppercase tracking-widest" @click="showWizard = true">
        İLK BAŞVURUNU YAP
      </button>
    </div>

    <!-- Application Wizard Modal -->
    <Teleport to="body">
      <div v-if="showWizard" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <!-- Wizard Header -->
          <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 class="text-xl font-black text-gray-900 italic uppercase">Marka Başvurusu</h3>
              <div class="flex items-center gap-2 mt-2">
                <span v-for="s in 4" :key="s" class="h-1.5 w-10 rounded-full transition-all" :class="currentStep >= s ? 'bg-indigo-600' : 'bg-gray-100'"></span>
              </div>
            </div>
            <button class="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400" @click="showWizard = false; resetForm()">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Step 1: Brand Name -->
          <div v-if="currentStep === 1" class="p-8 space-y-5">
            <h4 class="text-sm font-black text-gray-400 uppercase tracking-widest">Adım 1 — Marka Adı & Logo</h4>
            <input v-model="form.brandName" type="text" placeholder="Başvurmak istediğiniz marka adını yazın..." class="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-black focus:bg-white focus:border-indigo-500 outline-none transition-all">
            
            <div class="space-y-2 mt-4">
              <label class="block text-xs font-black text-gray-400 uppercase tracking-widest">Marka Logosu (İsteğe Bağlı)</label>
              <div class="flex gap-3">
                <div class="flex-1 px-5 py-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-indigo-400 hover:bg-white transition-all" @click="$refs.imageInput?.click()">
                  <CloudArrowUpIcon class="w-5 h-5 text-gray-400" />
                  <span class="text-sm font-bold text-gray-500">{{ form.image ? '✅ Yüklendi' : 'Logo seç...' }}</span>
                  <input ref="imageInput" type="file" class="hidden" accept="image/*" @change="handleFileUpload($event, 'image')">
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Application Type -->
          <div v-else-if="currentStep === 2" class="p-8 space-y-4">
            <h4 class="text-sm font-black text-gray-400 uppercase tracking-widest">Adım 2 — Başvuru Türü</h4>
            <div class="grid grid-cols-1 gap-3">
              <label
                v-for="opt in applicationTypes" :key="opt.value"
                class="flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all"
                :class="form.applicationType === opt.value ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'"
              >
                <input v-model="form.applicationType" type="radio" :value="opt.value" class="accent-indigo-600 w-5 h-5">
                <div>
                  <div class="text-sm font-black text-gray-900">{{ opt.label }}</div>
                  <div class="text-xs font-bold text-gray-400 mt-0.5">{{ opt.desc }}</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Step 3: Documents -->
          <div v-else-if="currentStep === 3" class="p-8 space-y-5">
            <h4 class="text-sm font-black text-gray-400 uppercase tracking-widest">Adım 3 — Belgeler</h4>
            <div v-for="doc in requiredDocs" :key="doc.field" class="space-y-2">
              <label class="block text-xs font-black text-gray-400 uppercase tracking-widest">{{ doc.label }}</label>
              <div class="flex gap-3">
                <div class="flex-1 px-5 py-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-indigo-400 hover:bg-white transition-all" @click="$refs[doc.field]?.[0]?.click()">
                  <CloudArrowUpIcon class="w-5 h-5 text-gray-400" />
                  <span class="text-sm font-bold text-gray-500">{{ (form)[doc.field] ? '✅ Yüklendi' : 'Dosya seç...' }}</span>
                  <input :ref="doc.field" type="file" class="hidden" @change="handleFileUpload($event, doc.field)">
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Review & Submit -->
          <div v-else-if="currentStep === 4" class="p-8 space-y-4">
            <h4 class="text-sm font-black text-gray-400 uppercase tracking-widest">Adım 4 — Onaylayın</h4>
            <div class="p-5 bg-gray-50 rounded-2xl space-y-3">
              <div class="flex justify-between text-sm"><span class="font-bold text-gray-400">Marka Adı</span><span class="font-black text-gray-900">{{ form.brandName }}</span></div>
              <div class="flex justify-between text-sm"><span class="font-bold text-gray-400">Başvuru Türü</span><span class="font-black text-gray-900">{{ getApplicationTypeName(form.applicationType) }}</span></div>
            </div>
            <div>
              <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Ek Notlar (Opsiyonel)</label>
              <textarea v-model="form.notes" rows="3" class="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"></textarea>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between gap-3">
            <button v-if="currentStep > 1" class="px-6 py-3 text-sm font-black text-gray-500 italic uppercase" @click="prevStep">GERİ</button>
            <span v-else></span>
            <button
              v-if="currentStep < 4"
              :disabled="!canProceed"
              class="px-10 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-gray-900 transition-all shadow-lg disabled:opacity-40 ml-auto uppercase"
              @click="nextStep"
            >
              DEVAM
            </button>
            <button
              v-else
              :disabled="submitting"
              class="px-10 py-3 bg-green-600 text-white text-sm font-black rounded-2xl hover:bg-gray-900 transition-all shadow-lg disabled:opacity-50 ml-auto uppercase"
              @click="submitApplication"
            >
              {{ submitting ? 'GÖNDERİLİYOR...' : 'BAŞVURUYU GÖNDER' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { PlusIcon, ClockIcon, TagIcon, XMarkIcon, CloudArrowUpIcon } from '@heroicons/vue/24/outline'
import { useVendorBrands } from '~/composables/useVendorBrands'

definePageMeta({ layout: 'vendor', middleware: 'auth' })
useHead({ title: 'Marka Başvurularım - BazarX' })

const {
  brands, loading, submitting, brandStats, showWizard, currentStep, form,
  fetchBrands, handleFileUpload, submitApplication, resetForm,
  canProceed, nextStep, prevStep, resolveImageUrl
} = useVendorBrands()

const statsItems = {
  total:    { label: 'Toplam',    icon: TagIcon,  color: 'bg-gray-100 text-gray-600 border-gray-200' },
  pending:  { label: 'Bekleyen', icon: ClockIcon, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  approved: { label: 'Onaylı',   icon: TagIcon,   color: 'bg-green-50 text-green-600 border-green-100' },
  rejected: { label: 'Reddedilen', icon: TagIcon, color: 'bg-red-50 text-red-600 border-red-100' }
}

const applicationTypes = [
  { value: 'OWNER',             label: 'Marka Sahibiyim',         desc: 'Markanın tescilli sahibiyim, belge yükleyeceğim.' },
  { value: 'AUTHORIZED_SELLER', label: 'Yetkili Satıcıyım',       desc: 'Marka tarafından yetkilendirildim.' },
  { value: 'DISTRIBUTOR',       label: 'Distribütörüm',           desc: 'Bölgesel distribütörlük anlaşmam var.' }
]

const requiredDocs = computed(() => {
  if (form.value.applicationType === 'OWNER') return [{ field: 'documentUrl', label: 'Marka Tescil Belgesi' }]
  if (form.value.applicationType === 'AUTHORIZED_SELLER') return [{ field: 'invoiceChainUrl', label: 'Fatura Silsilesi' }]
  return [{ field: 'authorizationUrl', label: 'Distribütörlük Sözleşmesi' }]
})

const getStatusLabel = (s) => ({ PENDING: 'İnceleniyor', APPROVED: 'Onaylı', REJECTED: 'Reddedildi' })[s] || s
const getStatusClass = (s) => ({
  PENDING:  'bg-amber-50 text-amber-700 border border-amber-100',
  APPROVED: 'bg-green-50 text-green-700 border border-green-100',
  REJECTED: 'bg-red-50 text-red-700 border border-red-100'
})[s] || 'bg-gray-100 text-gray-700'

const getApplicationTypeName = (t) => ({
  OWNER: 'Marka Sahibi', AUTHORIZED_SELLER: 'Yetkili Satıcı', DISTRIBUTOR: 'Distribütör'
})[t] || t

const formatDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR') : ''

onMounted(fetchBrands)
</script>
