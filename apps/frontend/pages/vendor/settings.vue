<script setup lang="ts">
import {
  CheckIcon, InformationCircleIcon, EyeIcon, XCircleIcon
} from '@heroicons/vue/24/outline'

import BrandIdentitySection from '~/components/vendor/settings/BrandIdentitySection.vue'
import StoreCustomizationSection from '~/components/vendor/settings/StoreCustomizationSection.vue'
import ContactInfoSection from '~/components/vendor/settings/ContactInfoSection.vue'
import BankInfoSection from '~/components/vendor/settings/BankInfoSection.vue'
import RestaurantSettingsSection from '~/components/vendor/settings/RestaurantSettingsSection.vue'
import { useVendor } from '~/composables/useVendor'

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

useHead({ title: 'Mağaza Kontrol Merkezi - BazarX Satıcı' })

const { vendorType } = useVendor()

const {
  loading, saving, vendor, vendorProducts, form,
  fetchProfile, fetchVendorProducts, handleFileUpload, saveSettings, toggleFlashProduct
} = useVendorSettings()

onMounted(async () => {
  await fetchProfile()
  await fetchVendorProducts()
})
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
    <!-- Premium Header -->
    <div class="flex items-center justify-between pb-6 border-b border-gray-50/50">
      <div class="flex items-center gap-6">
        <div class="w-16 h-16 rounded-[2.5rem] bg-gray-900 flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-primary-600/30 to-transparent"></div>
          <div v-if="loading" class="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div v-else class="text-2xl font-black italic">BX</div>
        </div>
        <div>
          <h1 class="text-3xl font-black text-gray-900 italic tracking-tighter uppercase leading-none mb-2">Mağaza Kontrol Merkezi</h1>
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Kimlik, Özelleştirme ve Finansal Ayarlar</p>
        </div>
      </div>
    </div>

    <!-- Status Alerts -->
    <div v-if="!loading && vendor && vendor.status !== 'APPROVED'" class="animate-in zoom-in duration-500">
      <div v-if="vendor.status === 'PENDING'" class="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 flex items-center gap-6">
        <div class="w-12 h-12 rounded-2xl bg-amber-200/50 flex items-center justify-center text-amber-600">
          <InformationCircleIcon class="w-7 h-7" />
        </div>
        <div>
          <h4 class="text-xs font-black text-amber-900 uppercase tracking-widest leading-none mb-1">İnceleme Aşamasında</h4>
          <p class="text-[10px] font-bold text-amber-800/60 uppercase tracking-widest leading-loose">Bilgileriniz şu an onay sürecindedir. Tamamlandığında mağazanız yayına alınacaktır.</p>
        </div>
      </div>
      
      <div v-if="vendor.status === 'REJECTED'" class="bg-red-50 rounded-[2rem] p-8 border border-red-100 flex items-center gap-6">
        <div class="w-12 h-12 rounded-2xl bg-red-200/50 flex items-center justify-center text-red-600">
          <XCircleIcon class="w-7 h-7" />
        </div>
        <div>
          <h4 class="text-xs font-black text-red-900 uppercase tracking-widest leading-none mb-1">Başvuru Reddedildi</h4>
          <p class="text-[10px] font-bold text-red-800/60 uppercase tracking-widest leading-loose">{{ vendor.rejectionReason || 'Eksik veya hatalı bilgiler tespit edildi.' }}</p>
        </div>
      </div>
    </div>

    <form v-if="!loading" class="space-y-12 pb-32" @submit.prevent="saveSettings">
      <BrandIdentitySection :form="form" @upload="handleFileUpload" />

      <StoreCustomizationSection :form="form" :vendorProducts="vendorProducts" @toggleFlash="toggleFlashProduct" />

      <!-- RESTAURANT: Restaurant-specific settings -->
      <RestaurantSettingsSection v-if="vendorType === 'RESTAURANT'" :form="form" />

      <ContactInfoSection :form="form" />

      <BankInfoSection :form="form" />

      <!-- Sticky Action Bar -->
      <div class="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-50">
        <div class="bg-gray-900/90 backdrop-blur-2xl p-4 rounded-[2.5rem] shadow-2xl border border-white/10 flex items-center justify-between gap-6">
          <div class="hidden md:flex items-center gap-4 ml-4">
             <InformationCircleIcon class="w-5 h-5 text-amber-400" />
             <p class="text-[9px] font-black text-white/50 uppercase tracking-widest max-w-[200px]">Değişiklikler admin onayından sonra yayına alınır.</p>
          </div>
          
          <div class="flex items-center gap-3 w-full md:w-auto">
            <NuxtLink v-if="vendor?.id" :to="`/vendors/${vendor.id}`" target="_blank" class="flex-1 md:flex-none px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
               İncele
            </NuxtLink>
            <button type="submit" :disabled="saving" class="flex-1 md:flex-none px-12 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50">
               <div v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               <CheckIcon v-else class="w-4 h-4" />
               {{ saving ? 'İŞLENİYOR' : 'DEĞİŞİKLİKLERİ KAYDET' }}
            </button>
          </div>
        </div>
      </div>
    </form>

    <!-- Final Loading Skeleton Overlay -->
    <div v-else class="py-40 flex flex-col items-center justify-center space-y-4">
       <div class="w-12 h-12 border-4 border-gray-100 border-t-primary-600 rounded-full animate-spin"></div>
       <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Profil Hazırlanıyor</p>
    </div>
  </div>
</template>
