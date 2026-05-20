<template>
  <div class="px-4 py-8 sm:px-0 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4 italic">
          <ShieldCheckIcon class="h-12 w-12 text-indigo-600" />
          BazarX Private <span class="text-lg font-bold text-indigo-500 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest leading-none">Apex Plus Altyapısı</span>
        </h1>
        <p class="mt-4 text-gray-500 max-w-2xl font-medium leading-relaxed italic">
          Kapalı devre bayi ekosisteminizi yönetin. Stok izolasyonu, akıllı kotalar ve marka koruma araçlarıyla kontrol sizde.
        </p>
      </div>
      <div v-if="ecosystem" class="flex gap-4">
        <NuxtLink :to="`/ecosystem/${ecosystem.id}`" class="px-8 py-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-1 transition-all font-black flex items-center gap-2 text-xs uppercase tracking-widest italic">
          <ArrowTopRightOnSquareIcon class="h-4 w-4" /> Bayi Portalına Git
        </NuxtLink>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32 rounded-[3rem] bg-indigo-50/20 border-2 border-dashed border-indigo-100">
      <div class="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-6" />
      <p class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] italic">Veriler Senkronize Ediliyor...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-[2.5rem] p-12 text-center">
      <ExclamationTriangleIcon class="h-16 w-16 text-red-500 mx-auto mb-6" />
      <h3 class="text-xl font-black text-red-900 italic uppercase">Bağlantı Hatası</h3>
      <p class="text-red-700/70 mt-2 font-bold mb-8 uppercase text-xs tracking-widest">{{ error }}</p>
      <button class="px-10 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl shadow-red-100" @click="fetchData">TEKRAR DENE</button>
    </div>

    <!-- Owner Dashboard View -->
    <div v-else-if="isOwner" class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
      <div class="lg:col-span-2 space-y-8">
        <EcosystemMembersTable 
          :members="ecosystem?.Members || []" 
          @invite="showInviteModal = true"
          @remove="removeMember"
        />
        <EcosystemWatchtower :logs="auditLogs" />
      </div>
      <EcosystemStatsSidebar :ecosystem="ecosystem" />
    </div>

    <!-- Non-Owner / Potential Owner View -->
    <div v-else class="max-w-4xl mx-auto animate-slide-up">
      <!-- Member View Or No Ecosystem Placeholder Logic Here -->
      <div v-if="!ecosystem && isApexPlus" class="relative overflow-hidden bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-12 text-center">
        <div class="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <BuildingStorefrontIcon class="h-20 w-20 text-indigo-600 mx-auto mb-8" />
        <h2 class="text-4xl font-black text-gray-900 mb-6 italic uppercase tracking-tighter">Kendi Özel Pazar Yerini Kur</h2>
        <p class="text-gray-500 text-xl font-bold italic leading-relaxed mb-10">Bayilerinize özel stoklar tanımlayın ve pazar dengesini koruyun.</p>
        <button class="px-12 py-6 bg-gray-900 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95 italic" @click="showCreateModal = true">EKOSİSTEMİ ŞİMDİ BAŞLAT</button>
      </div>

      <!-- Master Plan v4.3 §4.1 — Sadece APEX seviyesi ekosistem kurabilir -->
      <div v-else-if="!ecosystem && !isApexPlus" class="relative overflow-hidden bg-white rounded-[3rem] shadow-2xl border border-amber-100 p-12 text-center">
        <div class="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
        <ExclamationTriangleIcon class="h-20 w-20 text-amber-500 mx-auto mb-8" />
        <h2 class="text-4xl font-black text-gray-900 mb-6 italic uppercase tracking-tighter">APEX Seviyesi Gerekli</h2>
        <p class="text-gray-500 text-xl font-bold italic leading-relaxed mb-4">
          Ekosistem kurabilmek için B2B üyeliğinizin <span class="text-amber-600">APEX</span> seviyesinde olması gerekir.
        </p>
        <p class="text-gray-400 text-sm font-bold italic mb-10">
          Mevcut seviye: <span class="text-gray-900 font-black uppercase">{{ vendorTier || '—' }}</span>
        </p>
        <NuxtLink to="/vendor/subscription" class="inline-block px-12 py-6 bg-amber-500 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl hover:bg-amber-600 transition-all active:scale-95 italic">
          APEX'E YÜKSELT
        </NuxtLink>
      </div>

      <div v-else-if="ecosystem" class="bg-white rounded-[3rem] p-16 shadow-2xl border border-gray-100 text-center">
        <CheckBadgeIcon class="h-24 w-24 text-green-600 mx-auto mb-8" />
        <h2 class="text-3xl font-black text-gray-900 mb-4 italic uppercase tracking-tight">{{ ecosystem.name }} ÜYESİSİNİZ</h2>
        <p class="text-gray-500 text-lg font-bold italic leading-relaxed mb-10">Bu markanın kapalı ekosistemine başarıyla dahil edildiniz.</p>
        <NuxtLink :to="`/ecosystem/${ecosystem.id}`" class="block w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-black transition-all flex items-center justify-center gap-4 italic">
          <ArrowTopRightOnSquareIcon class="h-7 w-7" /> BAYI PORTALINA GİRİŞ YAP
        </NuxtLink>
      </div>
    </div>

    <!-- Modals -->
    <EcosystemInviteModal 
      :is-open="showInviteModal"
      :results="searchResults"
      @close="showInviteModal = false"
      @search="handleSearch"
      @invite="handleInviteMember"
    />

    <!-- Ecosystem Create Modal (Simplified as independent component or inlined for now) -->
    <div v-if="showCreateModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="showCreateModal = false" />
      <div class="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 animate-slide-up">
        <h3 class="text-2xl font-black text-gray-900 mb-2 italic uppercase">🌐 Yeni Ekosistem</h3>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Markanız adına BazarX Private ağını aktifleştirin.</p>
        <div class="space-y-6">
          <input v-model="createForm.name" type="text" placeholder="EKOSİSTEM ADI..." class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-black focus:border-indigo-500 outline-none transition-all italic">
          <textarea v-model="createForm.description" placeholder="VİZYONUNUZU ANLATIN..." class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-black focus:border-indigo-500 outline-none transition-all italic min-h-[100px]"></textarea>
          <button :disabled="creating" class="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95" @click="handleCreate">
            {{ creating ? 'KURULUYOR...' : 'EKOSİSTEMİ KUR' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ShieldCheckIcon, ArrowTopRightOnSquareIcon, ExclamationTriangleIcon, 
  BuildingStorefrontIcon, CheckBadgeIcon 
} from '@heroicons/vue/24/outline'

import { useVendorEcosystem } from '~/composables/useVendorEcosystem'
import EcosystemMembersTable from '~/components/vendor/ecosystem/EcosystemMembersTable.vue'
import EcosystemWatchtower from '~/components/vendor/ecosystem/EcosystemWatchtower.vue'
import EcosystemStatsSidebar from '~/components/vendor/ecosystem/EcosystemStatsSidebar.vue'
import EcosystemInviteModal from '~/components/vendor/ecosystem/EcosystemInviteModal.vue'

definePageMeta({ layout: 'vendor', middleware: 'vendor' })
useHead({ title: 'Ekosistem Yönetimi - BazarX Private' })

const {
  loading, ecosystem, isOwner, auditLogs, error, creating, isApexPlus, vendorTier,
  fetchData, createEcosystem, removeMember
} = useVendorEcosystem()

const { $api } = useApi()
const showInviteModal = ref(false)
const showCreateModal = ref(false)
const searchResults = ref([])
const createForm = ref({ name: '', description: '' })

const handleSearch = async (q: string) => {
  if (q.length < 2) return searchResults.value = []
  try {
    const res: any = await $api('/api/vendors', { params: { q, status: 'APPROVED', limit: 5 } })
    searchResults.value = res.data || []
  } catch (e) { console.error('Search error:', e) }
}

const handleInviteMember = async (vendorId: string) => {
  try {
    const res: any = await $api('/api/ecosystem/members', { method: 'POST', body: { memberVendorId: vendorId } })
    if (res.success) {
      useNuxtApp().$toast.success('Bayi eklendi!')
      showInviteModal.value = false
      await fetchData()
    }
  } catch (e: any) { useNuxtApp().$toast.error(e.data?.error || 'Hata') }
}

const handleCreate = async () => {
  const ok = await createEcosystem(createForm.value.name, createForm.value.description)
  if (ok) showCreateModal.value = false
}

onMounted(fetchData)
</script>

<style scoped>
.animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slide-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
