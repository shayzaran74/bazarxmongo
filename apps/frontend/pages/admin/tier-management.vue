<template>
  <div class="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-10 italic uppercase">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <span class="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl">YÖNETİM PANELİ</span>
          <span class="h-1.5 w-1.5 bg-neutral-200 rounded-full" />
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">SİSTEM KONFİGÜRASYONU</span>
        </div>
        <h1 class="text-5xl font-black text-gray-900 flex items-center gap-6 tracking-tighter leading-none italic">
          <div class="bg-gray-900 p-4 rounded-[1.5rem] shadow-2xl">
            <ChartBarIcon class="h-10 w-10 text-white" />
          </div>
          TIER <span class="text-indigo-600">MANAGEMENT</span>
        </h1>
        <p class="text-[10px] font-black text-gray-400 mt-4 tracking-widest leading-none">
          SATICI SEVİYE PARAMETRELERİNİN DİNAMİK YAPILANDIRMA MERKEZİ.
        </p>
      </div>

      <div class="flex items-center gap-4">
        <button
          :disabled="resetting"
          class="h-16 px-10 bg-white border border-neutral-100 text-gray-900 rounded-2xl hover:bg-neutral-50 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-4 shadow-xl active:scale-95 disabled:opacity-50 group"
          @click="resetCache"
        >
          <ArrowPathIcon class="h-6 w-6 text-amber-500 group-hover:rotate-180 transition-transform duration-700" :class="{ 'animate-spin': resetting }" />
          ÖNBELLEĞİ TAZELE
        </button>
      </div>
    </div>

    <!-- Stats -->
    <TierStats :tiers="tiers" />

    <!-- Table -->
    <TierTable :tiers="tiers" :loading="loading" @edit="openModal" />

    <!-- Edit Drawer -->
    <TierEditDrawer
      :is-open="showModal"
      :form="form"
      :loading="saving"
      @close="showModal = false"
      @save="saveTier"
    />
  </div>
</template>

<script setup>
import { ChartBarIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import TierStats from '~/components/admin/tier/TierStats.vue'
import TierTable from '~/components/admin/tier/TierTable.vue'
import TierEditDrawer from '~/components/admin/tier/TierEditDrawer.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'TIER YÖNETİMİ // BAZARX' })

const {
  tiers, loading, saving, resetting, showModal, form,
  fetchTiers, resetCache, saveTier, openModal
} = useTierManagement()

onMounted(fetchTiers)
</script>

<style scoped>
.animate-in { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
