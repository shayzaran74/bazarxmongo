<template>
  <div class="px-8 py-10 mx-auto max-w-7xl min-h-screen bg-neutral-50/30">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between mb-12 italic uppercase">
      <div class="flex-1 min-w-0">
        <h2 class="text-4xl font-black text-gray-900 tracking-tighter italic leading-none flex items-center gap-4">
          <div class="p-3 bg-indigo-50 rounded-2xl shadow-inner transform rotate-6 italic text-2xl">⚡</div>
          XP Kuralları & Kota
        </h2>
        <p class="mt-3 text-[10px] font-black text-gray-400 tracking-widest uppercase italic">
          Sistem genelinde dağıtılacak XP oranlarını ve satıcıların XP kullanım limitlerini yönetin.
        </p>
      </div>
      <div class="mt-8 flex md:mt-0 md:ml-4 gap-4">
        <button 
          class="h-14 px-10 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-200 italic"
          @click="openDistRuleModal"
        >
          ➕ YENİ DAĞITIM KURALI
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-4 mb-10 p-2 bg-white rounded-[2rem] border border-neutral-100 shadow-sm font-black text-[10px] italic uppercase tracking-widest">
      <button 
        v-for="tab in [{ id: 'distribution', label: 'XP DAĞITIM KURALLARI (KAZANIM)' }, { id: 'spending', label: 'WATCHTOWER LİMİTLERİ (KULLANIM)' }]"
        :key="tab.id"
        class="flex-1 py-4 rounded-[1.5rem] transition-all"
        :class="activeTab === tab.id ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:text-gray-900'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content -->
    <div class="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <XpDistributionTab
        v-if="activeTab === 'distribution'"
        :rules="distRules"
        :loading="loadingDistRules"
      />
      <XpSpendingTab
        v-if="activeTab === 'spending'"
        :limits="spendingLimits"
        :loading="loadingSpendingLimits"
        @edit="openEditLimitModal"
        @create="openCreateLimitModal"
      />
    </div>

    <!-- Modals -->
    <XpDistRuleModal
      :is-open="isDistRuleModalOpen"
      :form="distRuleForm"
      :pct-total="pctTotal"
      :loading="isSaving"
      @close="isDistRuleModalOpen = false"
      @save="saveDistRule"
    />
    <XpLimitModal
      :is-open="isLimitModalOpen"
      :form="limitForm"
      :loading="isSaving"
      @close="isLimitModalOpen = false"
      @save="saveSpendingLimit"
    />
  </div>
</template>

<script setup>
import XpDistributionTab from '~/components/admin/xp/XpDistributionTab.vue';
import XpSpendingTab from '~/components/admin/xp/XpSpendingTab.vue';
import XpDistRuleModal from '~/components/admin/xp/XpDistRuleModal.vue';
import XpLimitModal from '~/components/admin/xp/XpLimitModal.vue';

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
});

const {
  activeTab, distRules, spendingLimits, loadingDistRules, loadingSpendingLimits, isSaving,
  isDistRuleModalOpen, isLimitModalOpen, distRuleForm, limitForm, pctTotal,
  fetchDistRules, fetchSpendingLimits, saveDistRule, saveSpendingLimit,
  openDistRuleModal, openEditLimitModal, openCreateLimitModal
} = useXpRules();

onMounted(() => {
  fetchDistRules();
  fetchSpendingLimits();
});
</script>

<style scoped>
.animate-in { animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
