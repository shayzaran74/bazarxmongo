<template>
  <div class="py-12 px-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-12">
      <div>
        <h1 class="text-4xl font-black text-gray-900 italic tracking-tight uppercase leading-none mb-2">
          🏠 Ana Sayfa <span class="text-indigo-600 underline decoration-indigo-200">Ayarları</span>
        </h1>
        <p class="text-sm font-bold text-gray-400 uppercase tracking-widest opacity-70">Sitenizin vitrinini ve genel kurallarını yönetin</p>
      </div>
      
      <button 
        :disabled="saving"
        class="bg-indigo-600 text-white px-10 py-5 rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gray-900 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 active:scale-95 disabled:opacity-50"
        @click="saveSettings"
      >
        <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        <CheckIcon v-else class="h-4 w-4" />
        {{ saving ? 'KAYDEDİLİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET' }}
      </button>
    </div>

    <!-- UI Components -->
    <SiteIdentityForm 
      v-model="settings"
      :logo-preview="logoPreview"
      :get-logo-url="getLogoUrl"
      @remove-logo="removeLogo"
      @file-change="handleLogoChange"
    />

    <VisibilityManager 
      v-model="settings"
      @toggle="k => settings[k] = !settings[k]"
    />

    <ModuleManager 
      v-model="settings"
      @toggle="k => settings[k] = !settings[k]"
    />

    <AutoApprovalManager 
      v-model="settings"
      @update="(k, v) => settings[k] = v"
    />

    <ShippingTierManager 
      v-model="shippingTiers"
      @add="shippingTiers.push({ min: 0, max: 0, cost: 0 })"
      @remove="i => shippingTiers.splice(i, 1)"
    />

    <!-- Bottom Save Button (Floating-ish) -->
    <div class="mt-12 p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] flex items-center justify-between gap-8">
      <div class="flex-1">
        <h4 class="text-sm font-black text-indigo-900 uppercase italic">Tüm Değişiklikler Hazır mı?</h4>
        <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1 leading-tight">Kaydettiğiniz an tüm değişiklikler canlıya yansıyacaktır.</p>
      </div>
      <button 
        :disabled="saving"
        class="px-10 py-5 bg-gray-900 text-white rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl active:scale-95"
        @click="saveSettings"
      >
        SİSTEMİ GÜNCELLE
      </button>
    </div>
  </div>
</template>

<script setup>
import { CheckIcon } from '@heroicons/vue/24/outline'
import { useHomepageSettings } from '~/composables/useHomepageSettings'

import SiteIdentityForm from '~/components/admin/settings/homepage/SiteIdentityForm.vue'
import VisibilityManager from '~/components/admin/settings/homepage/VisibilityManager.vue'
import ModuleManager from '~/components/admin/settings/homepage/ModuleManager.vue'
import AutoApprovalManager from '~/components/admin/settings/homepage/AutoApprovalManager.vue'
import ShippingTierManager from '~/components/admin/settings/homepage/ShippingTierManager.vue'

definePageMeta({ layout: 'admin', middleware: 'super-admin' })
useHead({ title: 'Ana Sayfa Ayarları - Admin' })

const { 
  settings, shippingTiers, saving, logoPreview, logoFile,
  getLogoUrl, fetchSettings, saveSettings 
} = useHomepageSettings()

const handleLogoChange = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    logoFile.value = file
    logoPreview.value = URL.createObjectURL(file)
  }
}

const removeLogo = () => {
  settings.value.siteLogo = ''
  logoPreview.value = null
  logoFile.value = null
}

onMounted(fetchSettings)
</script>
