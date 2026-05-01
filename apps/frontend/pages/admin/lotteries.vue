<template>
  <div class="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-10 italic uppercase">
      <div>
        <h1 class="text-5xl font-black text-gray-900 flex items-center gap-6 tracking-tighter leading-none italic">
          <div class="bg-gray-900 p-4 rounded-[1.5rem] shadow-2xl">
            <TicketIcon class="h-10 w-10 text-white" />
          </div>
          LOTTERY <span class="text-indigo-600">SYSTEM</span>
        </h1>
        <p class="text-[10px] font-black text-gray-400 mt-4 tracking-widest leading-none">
          ÖDÜLLÜ ÇEKİLİŞLERİN VE KATILIMCI ETKİLEŞİMİNİN MERKEZİ YÖNETİMİ.
        </p>
      </div>

      <button
        class="h-16 px-12 bg-gray-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-200 flex items-center gap-4 active:scale-95 shrink-0"
        @click="showCreateModal = true"
      >
        <PlusIcon class="h-5 w-5" />
        YENİ ÇEKİLİŞ OLUŞTUR
      </button>
    </div>

    <!-- Stats -->
    <LotteryStats :stats="stats" />

    <!-- Filters -->
    <LotteryFilters v-model="filters" @change="fetchLotteries" />

    <!-- Table -->
    <LotteryTable
      :lotteries="lotteries"
      :loading="loading"
      :pagination="pagination"
      @edit="editLottery"
      @delete="deleteLottery"
      @end="endLottery"
      @change-page="(p) => { pagination.page = p; fetchLotteries() }"
    />

    <!-- Create/Edit Modal -->
    <CreateLotteryModal
      v-if="showCreateModal || selectedLottery"
      :lottery="selectedLottery"
      @close="closeModal"
      @saved="onLotterySaved"
    />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, TicketIcon } from '@heroicons/vue/24/outline'
import LotteryStats from '~/components/admin/lottery/LotteryStats.vue'
import LotteryFilters from '~/components/admin/lottery/LotteryFilters.vue'
import LotteryTable from '~/components/admin/lottery/LotteryTable.vue'
import CreateLotteryModal from '~/components/modals/CreateLotteryModal.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'ÇEKİLİŞ YÖNETİMİ // BAZARX' })

const {
  lotteries, loading, showCreateModal, selectedLottery, filters, stats, pagination,
  fetchLotteries, endLottery, deleteLottery, closeModal, editLottery, onLotterySaved
} = useAdminLottery()

onMounted(fetchLotteries)
</script>

<style scoped>
.animate-in { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>