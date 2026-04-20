<template>
  <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
    <!-- Header -->
    <div class="mb-16 italic uppercase">
      <h1 class="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-3 italic">
        SİSTEM AYARLARI <span class="text-indigo-600">/</span> PROFİL
      </h1>
      <p class="text-[10px] font-black text-gray-400 tracking-widest leading-none">
        HESAP TERCİHLERİNİZİ VE GÜVENLİK AYARLARINIZI BU PANEL ÜZERİNDEN YÖNETİN.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <!-- Menu -->
      <div class="lg:col-span-3">
        <nav class="space-y-3 sticky top-32 italic font-black text-[10px] tracking-widest uppercase">
          <button
            v-for="tab in [{ id: 'account', label: 'HESAP BİLGİLERİ', icon: UserCircleIcon }, { id: 'security', label: 'GÜVENLİK & ŞİFRE', icon: ShieldCheckIcon }, { id: 'notifications', label: 'BİLDİRİM TERCİHLERİ', icon: BellIcon }]"
            :key="tab.id"
            :class="activeTab === tab.id ? 'bg-gray-900 text-white shadow-2xl translate-x-2' : 'bg-white text-gray-400 hover:text-gray-900 hover:bg-neutral-50 shadow-sm'"
            class="flex items-center gap-5 w-full px-8 py-5 rounded-[1.5rem] transition-all border border-transparent"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" class="h-6 w-6 shrink-0" />
            <span>{{ tab.label }}</span>
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="lg:col-span-9">
        <div class="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-100/50 border border-neutral-100 overflow-hidden relative group">
          <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
          
          <div class="p-10 md:p-16">
            <div class="mb-12 border-b border-neutral-100 pb-8 italic">
              <h2 class="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
                {{ activeTab === 'account' ? 'HESAP AYARLARI' : 
                   activeTab === 'security' ? 'GÜVENLİK PROTOKOLLERİ' : 
                   'BİLDİRİM MATRİSİ' }}
              </h2>
              <p class="text-[10px] font-black text-gray-400 mt-2 tracking-widest uppercase">
                {{ activeTab === 'account' ? 'Kişisel tercihler ve uygulama dili yapılandırması.' : 
                   activeTab === 'security' ? 'Şifre güncellemeleri ve oturum güvenliği denetimi.' : 
                   'Seçilmiş kanallar üzerinden gelecek anlık bilgilendirme ayarları.' }}
              </p>
            </div>

            <AccountSettings v-if="activeTab === 'account'" @update="updateAccount" />
            <SecuritySettings v-if="activeTab === 'security'" :form="passwordForm" :loading="passwordLoading" @change-password="changePassword" />
            <NotificationSettings v-if="activeTab === 'notifications'" :settings="notificationSettings" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UserCircleIcon, ShieldCheckIcon, BellIcon } from '@heroicons/vue/24/outline'
import AccountSettings from '~/components/settings/AccountSettings.vue'
import SecuritySettings from '~/components/settings/SecuritySettings.vue'
import NotificationSettings from '~/components/settings/NotificationSettings.vue'

definePageMeta({ layout: 'default' })
useHead({ title: 'AYARLAR // BAZARX' })

const {
  activeTab, passwordLoading, passwordForm, notificationSettings,
  changePassword, updateAccount
} = useSettings()
</script>

<style scoped>
.animate-in { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>