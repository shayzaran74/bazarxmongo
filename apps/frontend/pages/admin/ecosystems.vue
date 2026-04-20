<template>
  <div class="min-h-screen bg-neutral-50/50 py-12 lg:py-16 px-4 md:px-12 italic">
    <div class="max-w-7xl mx-auto space-y-12">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div class="space-y-4">
          <div class="flex items-center gap-6">
            <div class="p-4 bg-black rounded-[1.5rem] shadow-2xl shadow-black/20">
               <ShieldCheckIcon class="h-8 w-8 text-white" />
            </div>
            <h1 class="text-5xl lg:text-7xl font-black text-gray-900 tracking-tightest uppercase italic leading-none">WATCH<span class="text-indigo-600">TOWER</span></h1>
          </div>
          <p class="text-gray-400 font-black text-sm uppercase tracking-widest leading-tight opacity-70">BAZARX PRİVATE EKOSİSTEMLERİ VE AKILLI KOTA DENETİM MERKEZİ.</p>
        </div>

        <button class="group h-16 w-16 bg-white border border-neutral-100 rounded-[1.5rem] hover:bg-black transition-all shadow-xl flex items-center justify-center active:scale-90" @click="fetchData">
          <ArrowPathIcon :class="['h-6 w-6 text-gray-400 group-hover:text-white group-hover:rotate-180 transition-transform duration-700', loading ? 'animate-spin' : '']" />
        </button>
      </div>

      <!-- Stats -->
      <EcoStats :stats="{ active: ecosystems.length, privateStock: totalPrivateStock, inventoryValue: totalInventoryValue, violations: recentViolations }" />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <!-- List -->
        <EcoList :items="ecosystems" :loading="loading" :selected-id="selectedEco?.id" class="lg:col-span-2" @select="(e) => selectedEco = e" />

        <!-- Sidebar -->
        <EcoSidebar :selected-eco="selectedEco" @deselect="selectedEco = null" @override="(m) => { targetMember = m; overrideScore = m.trustScore; showOverrideModal = true }" @remove="removeMember" @logs="showLogs = true" />
      </div>

      <!-- Audit Logs -->
      <EcoAuditLogs v-if="showLogs" :items="auditLogs" @close="showLogs = false" />
    </div>

    <!-- Modals -->
    <TrustOverrideModal
      :is-open="showOverrideModal"
      :member="targetMember"
      :score="overrideScore"
      :loading="submitting"
      @close="showOverrideModal = false"
      @submit="(data) => { overrideScore = data.score; overrideReason = data.reason; submitOverride(); }"
    />
  </div>
</template>

<script setup>
import { ShieldCheckIcon, ArrowPathIcon } from '@heroicons/vue/24/solid'
import EcoStats from '~/components/admin/ecosystems/EcoStats.vue'
import EcoList from '~/components/admin/ecosystems/EcoList.vue'
import EcoSidebar from '~/components/admin/ecosystems/EcoSidebar.vue'
import EcoAuditLogs from '~/components/admin/ecosystems/EcoAuditLogs.vue'
import TrustOverrideModal from '~/components/admin/ecosystems/TrustOverrideModal.vue'

definePageMeta({ layout: 'admin', middleware: 'super-admin' })
useHead({ title: 'WATCHTOWER ADMIN // BAZARX' })

const {
  ecosystems, auditLogs, loading, showLogs, selectedEco,
  showOverrideModal, targetMember, overrideScore, overrideReason, submitting,
  totalPrivateStock, totalInventoryValue, recentViolations,
  fetchData, submitOverride, removeMember
} = useAdminEcosystems()
</script>
