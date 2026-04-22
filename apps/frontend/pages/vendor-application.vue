<template>
  <div class="min-h-screen bg-gray-50/50 py-16 px-4">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12 relative">
        <h1 class="text-5xl font-black text-gray-900 italic tracking-tighter uppercase mb-4">SATICI BAŞVURUSU</h1>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">EKOSİSTEMİMİZE KATILARAK TİCARETİN GELECEĞİNİ ŞEKİLLENDİRİN</p>

        <!-- Announcements / Policy Files -->
        <div v-if="announcements.length" class="flex flex-wrap justify-center gap-4">
          <a
            v-for="ann in announcements"
            :key="ann.id"
            :href="ann.linkUrl?.startsWith('http') ? ann.linkUrl : (ann.linkUrl?.startsWith('/') ? config.public.apiBase + ann.linkUrl : ann.linkUrl)"
            target="_blank"
            class="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl hover:border-orange-500 hover:bg-orange-50/50 transition-all group shadow-sm"
          >
            <div class="p-2 bg-orange-600 text-white rounded-lg group-hover:scale-110 transition-transform text-[10px]">📁</div>
            <span class="text-[10px] font-black text-gray-700 uppercase tracking-widest">{{ ann.linkText || 'BİLGİLENDİRME DOSYASI' }}</span>
          </a>
        </div>
      </div>

      <!-- Application Stepper -->
      <ApplicationStepper :current-step="currentStep" :total-steps="totalSteps" />

      <!-- Form Container -->
      <div class="bg-white rounded-[3rem] shadow-2xl shadow-gray-200 border border-white p-10 lg:p-14">
        <form @submit.prevent="currentStep === totalSteps ? submitApplication() : nextStep()">
          
          <!-- Step 1: Business Info -->
          <StepBusinessInfo v-if="currentStep === 1" v-model="formData" />

          <!-- Step 2: Contact & Address -->
          <StepContactAddress v-if="currentStep === 2" v-model="formData" />

          <!-- Step 3: Bank & Categories -->
          <StepBankCategories v-if="currentStep === 3" v-model="formData" :categories="categories" />

          <!-- Navigation Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 mt-12 pt-10 border-t border-gray-50">
            <button
              v-if="currentStep > 1"
              type="button"
              class="flex-1 px-8 py-5 bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
              @click="prevStep"
            >
              Geri Dön
            </button>
            <button
              v-else
              type="button"
              class="flex-1 px-8 py-5 bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
              @click="$router.push('/')"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              :disabled="loading"
              class="flex-1 px-8 py-5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary-600 shadow-2xl shadow-slate-900/10 transition-all active:scale-95 disabled:opacity-20"
            >
              <template v-if="loading">İşleniyor...</template>
              <template v-else-if="currentStep === totalSteps">Başvuruyu Protokolle</template>
              <template v-else>Sonraki Adım</template>
            </button>
          </div>
        </form>
      </div>

      <!-- Support Footer -->
      <div class="mt-16 text-center">
        <p class="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4 italic">BazarX Merchant Ecosystem</p>
        <div class="flex justify-center gap-8 opacity-20 filter grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
          <img src="https://placehold.co/100x40?text=SECURE" class="h-6" alt="Secure">
          <img src="https://placehold.co/100x40?text=TRUSTED" class="h-6" alt="Trusted">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useVendorApplication } from '~/composables/useVendorApplication'

// Components
import ApplicationStepper from '~/components/vendor/application/ApplicationStepper.vue'
import StepBusinessInfo from '~/components/vendor/application/StepBusinessInfo.vue'
import StepContactAddress from '~/components/vendor/application/StepContactAddress.vue'
import StepBankCategories from '~/components/vendor/application/StepBankCategories.vue'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Satıcı Başvuru Protokolü | BazarX Merchants' })

const {
  loading, currentStep, totalSteps, categories, announcements, formData, config,
  nextStep, prevStep, submitApplication
} = useVendorApplication()
</script>
