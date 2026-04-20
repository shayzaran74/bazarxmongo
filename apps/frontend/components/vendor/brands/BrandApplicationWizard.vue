<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[85vh]">
        <!-- Header & Progress -->
        <div class="px-10 py-8 border-b border-gray-100 bg-gray-50/50 relative">
          <div class="flex justify-between items-center mb-8">
            <div>
              <h2 class="text-2xl font-black text-gray-900 tracking-tight">Yeni Marka Başvurusu</h2>
              <p class="text-sm text-gray-500 font-medium">Lütfen temsil ettiğiniz markayı sisteme kaydedin.</p>
            </div>
            <button class="p-2 border border-gray-200 rounded-xl hover:bg-white text-gray-400" @click="$emit('close')">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <!-- Wizard Progress Bar -->
          <div class="flex items-center gap-4">
            <div 
              v-for="i in 4" 
              :key="i"
              class="flex-1 h-2 rounded-full transition-all duration-500"
              :class="i <= step ? 'bg-blue-600' : 'bg-gray-200'"
            />
          </div>
          <div class="flex justify-between mt-3">
            <span v-for="label in ['Marka', 'Tür', 'Belgeler', 'Onay']" :key="label" class="text-[9px] font-black uppercase text-gray-400 tracking-widest">
              {{ label }}
            </span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-10">
          <!-- Step 1: Brand Base Info -->
          <div v-if="step === 1" class="space-y-6">
            <div class="text-center mb-8">
              <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                <TagIcon class="h-10 w-10" />
              </div>
              <h3 class="text-xl font-bold text-gray-900">Marka İsmini Girin</h3>
              <p class="text-sm text-gray-500">Sistemde kayıtlı olup olmadığını otomatik kontrol edeceğiz.</p>
            </div>
            <div>
              <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Marka Adı</label>
              <input
                :value="form.brandName"
                type="text"
                class="w-full px-6 py-4 bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none rounded-2xl font-bold transition-all"
                placeholder="Örn: ABC Elektronik"
                @input="$emit('update:form', { ...form, brandName: $event.target.value })"
              >
            </div>
          </div>

          <!-- Step 2: Relationship Type -->
          <div v-if="step === 2" class="space-y-4">
            <h3 class="text-lg font-bold text-gray-900 text-center mb-6">Marka İle İlişkiniz Nedir?</h3>
            <div 
              v-for="type in relTypes" 
              :key="type.id"
              :class="[
                'p-5 border-2 rounded-3xl cursor-pointer transition-all flex items-center justify-between group',
                form.applicationType === type.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:border-blue-200'
              ]"
              @click="$emit('update:form', { ...form, applicationType: type.id })"
            >
              <div class="flex items-center gap-4">
                <div :class="['p-3 rounded-2xl', form.applicationType === type.id ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-50']">
                  <component :is="type.icon" class="h-6 w-6" />
                </div>
                <div>
                  <p class="font-bold text-gray-900">{{ type.label }}</p>
                  <p class="text-xs text-gray-500 font-medium">{{ type.desc }}</p>
                </div>
              </div>
              <div v-if="form.applicationType === type.id" class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <CheckIcon class="h-4 w-4" />
              </div>
            </div>
          </div>

          <!-- Step 3: Documents -->
          <div v-if="step === 3" class="space-y-6">
            <div class="text-center mb-6">
              <h3 class="text-lg font-bold text-gray-900">Belgeleri Yükleyin</h3>
              <p class="text-xs text-gray-500">Onay sürecini hızlandırmak için net görseller yükleyin.</p>
            </div>

            <div v-if="form.applicationType === 'OWNER'" class="space-y-6">
              <div class="p-6 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 hover:bg-white transition-all">
                <p class="text-sm font-bold text-gray-900 mb-4">Marka Tescil Belgesi</p>
                <div v-if="form.documentUrl" class="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-xl border border-green-100">
                  <span class="text-xs font-bold truncate pr-4">{{ form.documentUrl }}</span>
                  <button class="text-red-500 hover:text-red-700" @click="$emit('update:form', { ...form, documentUrl: '' })">
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
                <div v-else>
                  <label class="flex flex-col items-center justify-center py-4 cursor-pointer">
                    <CloudArrowUpIcon class="h-8 w-8 text-blue-500 mb-2" />
                    <span class="text-xs font-bold text-gray-600">PDF veya Görsel Yükle</span>
                    <input type="file" class="hidden" accept=".pdf,image/*" @change="$emit('upload', $event, 'documentUrl')">
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Tescil Numarası (Opsiyonel)</label>
                <input
                  :value="form.trademarkNumber"
                  type="text"
                  class="w-full px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:bg-white"
                  placeholder="Örn: 2024/000123"
                  @input="$emit('update:form', { ...form, trademarkNumber: $event.target.value })"
                >
              </div>
            </div>

            <!-- Other Types... (Simplified for brevity but kept functional logic) -->
            <div v-else class="p-6 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
               <p class="text-sm font-bold text-gray-900 mb-4">Yetki / Fatura Belgesi</p>
               <!-- Generic upload for brevity -->
                <div v-if="isDocUploaded" class="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-xl">
                  <span class="text-xs font-bold">Belge Yüklendi</span>
                  <button class="text-red-500" @click="clearDocs">Sil</button>
                </div>
                <label v-else class="flex flex-col items-center justify-center py-4 cursor-pointer">
                  <CloudArrowUpIcon class="h-8 w-8 text-blue-500 mb-2" />
                  <input type="file" class="hidden" @change="handleGenericUpload">
                </label>
            </div>
          </div>

          <!-- Step 4: Summary -->
          <div v-if="step === 4" class="space-y-6">
            <div class="h-24 w-24 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon class="h-14 w-14" />
            </div>
            <div class="p-6 bg-gray-900 rounded-[2rem] text-white">
              <h4 class="text-gray-400 text-xs font-black uppercase tracking-widest mb-4">Başvuru Özeti</h4>
              <div class="space-y-4">
                <div class="flex justify-between border-b border-white/10 pb-2">
                  <span class="text-gray-400 text-xs">Marka</span>
                  <span class="font-bold">{{ form.brandName }}</span>
                </div>
                <div class="flex justify-between border-b border-white/10 pb-2">
                  <span class="text-gray-400 text-xs">Temsil Türü</span>
                  <span class="font-bold">{{ getApplicationTypeLabel(form.applicationType) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400 text-xs">Belge Durumu</span>
                  <span class="text-green-400 font-bold">Hazır</span>
                </div>
              </div>
            </div>
            <p class="text-center text-xs text-gray-500 px-6 italic">
              "Yukarıdaki bilgilerin doğruluğunu ve marka sahibi/temsilcisi olduğumu beyan ederim."
            </p>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="px-10 py-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
          <button
            v-if="step > 1"
            class="px-8 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-white transition-all shadow-sm"
            @click="$emit('prev')"
          >
            Geri
          </button>
          <button
            v-if="step < 4"
            :disabled="!canProceed"
            class="flex-1 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-30 shadow-xl shadow-gray-200"
            @click="$emit('next')"
          >
            Devam Et
          </button>
          <button
            v-else
            :disabled="submitting"
            class="flex-1 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
            @click="$emit('submit')"
          >
            {{ submitting ? 'Gönderiliyor...' : 'Başvuruyu Tamamla' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { 
  XMarkIcon, 
  TagIcon, 
  IdentificationIcon, 
  BriefcaseIcon, 
  BuildingOfficeIcon, 
  CheckIcon, 
  CloudArrowUpIcon, 
  TrashIcon, 
  CheckCircleIcon 
} from '@heroicons/vue/24/outline'
import { getApplicationTypeLabel } from '~/utils/brand-helpers'

const props = defineProps({
  show: Boolean,
  step: Number,
  form: Object,
  canProceed: Boolean,
  submitting: Boolean
})

const emit = defineEmits(['close', 'prev', 'next', 'submit', 'update:form', 'upload'])

const relTypes = [
  { id: 'OWNER', label: 'Marka Sahibi', desc: 'Markanın yasal mülkiyetine sahibim.', icon: IdentificationIcon },
  { id: 'AUTHORIZED_SELLER', label: 'Yetkili Satıcı / Bayi', desc: 'Marka adına satış yapma yetkim var.', icon: BriefcaseIcon },
  { id: 'DISTRIBUTOR', label: 'Resmi Distribütör', desc: 'Markanın ülke/bölge temsilcisiyim.', icon: BuildingOfficeIcon }
]

const isDocUploaded = computed(() => {
  const f = props.form
  return f.documentUrl || f.invoiceChainUrl || f.authorizationUrl
})

const handleGenericUpload = (e) => {
  const field = props.form.applicationType === 'AUTHORIZED_SELLER' ? 'invoiceChainUrl' : 'authorizationUrl'
  emit('upload', e, field)
}

const clearDocs = () => {
  emit('update:form', { ...props.form, documentUrl: '', invoiceChainUrl: '', authorizationUrl: '' })
}
</script>
