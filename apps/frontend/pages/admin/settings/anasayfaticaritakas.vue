<template>
  <div class="py-12 px-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-12">
      <div>
        <h1 class="text-4xl font-black text-gray-900 italic tracking-tight uppercase leading-none mb-2">
          🤝 TİCARİTAKAS <span class="text-indigo-600">AYARLARI</span>
        </h1>
        <p class="text-sm font-bold text-gray-400 uppercase tracking-widest opacity-70">TicariTakas ekosistemi için özel yapılandırma</p>
      </div>
      <button :disabled="saving" class="bg-indigo-600 text-white px-10 py-5 rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-gray-900 transition-all active:scale-95 flex items-center gap-3" @click="saveSettings">
        <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        {{ saving ? 'KAYDEDİLİYoR...' : 'TİCARİTAKAS KAYDET' }}
      </button>
    </div>

    <SiteIdentityForm v-model="settings" :logo-preview="logoPreview" :get-logo-url="getLogoUrl" @remove-logo="removeLogo" @file-change="handleLogoChange" />
    <VisibilityManager v-model="settings" ecosystem="TICARITAKAS" @toggle="k => settings[k] = !settings[k]" />
    <ModuleManager v-model="settings" @toggle="k => settings[k] = !settings[k]" />
    <AutoApprovalManager v-model="settings" @update="(k, v) => settings[k] = v" />
    <ShippingTierManager v-model="shippingTiers" @add="shippingTiers.push({ min: 0, max: 0, cost: 0 })" @remove="i => shippingTiers.splice(i, 1)" />
  </div>
</template>

<script setup>
import { useHomepageSettings } from '~/composables/useHomepageSettings'
import SiteIdentityForm from '~/components/admin/settings/homepage/SiteIdentityForm.vue'
import VisibilityManager from '~/components/admin/settings/homepage/VisibilityManager.vue'
import ModuleManager from '~/components/admin/settings/homepage/ModuleManager.vue'
import AutoApprovalManager from '~/components/admin/settings/homepage/AutoApprovalManager.vue'
import ShippingTierManager from '~/components/admin/settings/homepage/ShippingTierManager.vue'

definePageMeta({ layout: 'admin', middleware: 'super-admin' })
useHead({ title: 'TicariTakas Ayarları - Admin' })

const { settings, shippingTiers, saving, logoPreview, logoFile, getLogoUrl, fetchSettings, saveSettings } = useHomepageSettings('TICARITAKAS')

const handleLogoChange = (e) => {
  const file = e.target.files?.[0]
  if (file) { logoFile.value = file; logoPreview.value = URL.createObjectURL(file) }
}
onMounted(fetchSettings)
</script>
