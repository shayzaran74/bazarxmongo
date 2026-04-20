<template>
  <div class="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-4xl font-black text-neutral-900 tracking-tighter sm:text-5xl mb-4 italic uppercase">
          🚀 Satıcı Paneline Katılın
        </h1>
        <p class="text-[10px] font-black text-neutral-400 max-w-2xl mx-auto uppercase tracking-widest italic">
          Milyonlarca müşteriye ulaşın, işinizi dijital dünyada büyütün.
        </p>

        <!-- Dynamic Announcements -->
        <div v-if="announcements.length" class="mt-10 flex flex-wrap justify-center gap-4">
          <div v-for="ann in announcements" :key="ann.id">
            <a
              v-if="ann.linkUrl"
              :href="resolveUrl(ann.linkUrl)"
              target="_blank"
              class="inline-flex items-center gap-3 px-6 py-3 bg-white text-neutral-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all border border-neutral-100 italic"
            >
              <div class="p-1 px-2 bg-orange-600 text-white rounded-lg text-[8px] font-black">PDF</div>
              {{ ann.linkText || 'BİLGİLENDİRME' }}
            </a>
            <div v-else class="px-6 py-3 bg-white rounded-2xl border border-neutral-50 text-[10px] font-black text-neutral-400 uppercase tracking-widest italic shadow-sm">
              {{ ann.content }}
            </div>
          </div>
        </div>
      </div>

      <!-- Stepper -->
      <div v-if="!isStatusScreen" class="mb-16">
        <div class="relative flex items-center justify-between max-w-3xl mx-auto">
          <div class="absolute left-0 top-1/2 w-full h-0.5 bg-neutral-200 -z-10 -translate-y-1/2" />
          <div
            class="absolute left-0 top-1/2 h-1 bg-indigo-600 -z-10 -translate-y-1/2 transition-all duration-700"
            :style="{ width: `${(currentStep - 1) * 20}%` }"
          />

          <div v-for="step in 6" :key="step" class="flex flex-col items-center group">
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 shadow-sm"
              :class="[
                currentStep >= step
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110'
                  : 'bg-white border-2 border-neutral-100 text-neutral-300'
              ]"
            >
              <template v-if="currentStep > step">✓</template>
              <template v-else>{{ step }}</template>
            </div>
            <span class="absolute mt-16 text-[9px] font-black text-neutral-400 uppercase tracking-widest hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity italic">
              {{ stepTitles[step - 1] }}
            </span>
          </div>
        </div>
      </div>

      <!-- Form Container -->
      <div class="bg-white rounded-[3rem] shadow-2xl shadow-neutral-200/40 border border-neutral-50 overflow-hidden min-h-[600px] flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
        <RegistrationStatus
          v-if="isStatusScreen"
          :status="vendorStatus"
          :is-logged-in="!!authStore.isLoggedIn"
        />

        <div v-else class="flex-1 flex flex-col">
          <div class="p-8 sm:p-16 flex-1">
            <RegistrationIntro v-if="currentStep === 1" />
            <RegistrationBusinessInfo v-if="currentStep === 2" :form="form" />
            <RegistrationContactInfo v-if="currentStep === 3" :form="form" />
            <RegistrationBankAndCategories v-if="currentStep === 4" :form="form" :categories="categories" />
            <RegistrationLegalAgreements
              v-if="currentStep === 5"
              :form="form"
              :legal-docs="legalDocs"
              :active-doc="activeDoc"
              @toggle-doc="activeDoc = activeDoc === $event ? null : $event"
            />
            <RegistrationSummary v-if="currentStep === 6" :form="form" />
          </div>

          <!-- Navigation -->
          <div class="p-10 bg-neutral-50/50 border-t-2 border-neutral-50 flex justify-between items-center px-16">
            <button
              v-if="currentStep > 1"
              class="h-14 px-10 rounded-2xl border-2 border-neutral-100 text-neutral-400 font-black text-[10px] uppercase tracking-widest hover:text-neutral-900 transition-all italic"
              @click="currentStep--"
            >
              GERİ DÖN
            </button>
            <div v-else />

            <button
              v-if="currentStep < 6"
              class="h-14 px-12 rounded-2xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-100 active:scale-95"
              @click="nextStep"
            >
              DEVAM ET
            </button>
            <button
              v-else
              :disabled="loading || !form.agreeTerms"
              class="h-14 px-16 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 disabled:opacity-30 active:scale-95"
              @click="submitForm"
            >
              {{ loading ? 'GÖNDERİLİYOR...' : '🚀 BAŞVURUYU TAMAMLA' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import RegistrationIntro from '~/components/vendor/registration/RegistrationIntro.vue'
import RegistrationBusinessInfo from '~/components/vendor/registration/RegistrationBusinessInfo.vue'
import RegistrationContactInfo from '~/components/vendor/registration/RegistrationContactInfo.vue'
import RegistrationBankAndCategories from '~/components/vendor/registration/RegistrationBankAndCategories.vue'
import RegistrationLegalAgreements from '~/components/vendor/registration/RegistrationLegalAgreements.vue'
import RegistrationSummary from '~/components/vendor/registration/RegistrationSummary.vue'
import RegistrationStatus from '~/components/vendor/registration/RegistrationStatus.vue'

definePageMeta({ layout: 'default' })
useHead({ title: 'Satıcı Başvurusu | BazarX' })

const authStore = useAuthStore()
const runtimeConfig = useRuntimeConfig()
const {
  currentStep, loading, activeDoc, categories, legalDocs, announcements, form, vendorStatus,
  fetchAnnouncements, fetchCategories, fetchLegalDocs, nextStep, submitForm
} = useVendorRegistration()

const stepTitles = ['Giriş', 'İşletme', 'İletişim', 'Banka', 'Yasal', 'Tamamla']

const isStatusScreen = computed(() => {
  return !authStore.isLoggedIn || vendorStatus.value === 'APPROVED' || vendorStatus.value === 'PENDING'
})

const resolveUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${runtimeConfig.public.apiBase}${url.startsWith('/') ? '' : '/'}${url}`
}

onMounted(() => {
  fetchCategories()
  fetchLegalDocs()
  fetchAnnouncements()
})
</script>

<style scoped>
.animate-in { animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
