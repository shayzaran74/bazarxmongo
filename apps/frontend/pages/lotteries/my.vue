<template>
  <div class="min-h-screen bg-[#f8fafc] py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto space-y-16">
      <!-- Header -->
      <div class="space-y-4">
        <nav class="flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
          <NuxtLink to="/lotteries" class="hover:text-primary-600 transition-colors">ÇEKİLİŞLER</NuxtLink>
          <span class="text-gray-300">/</span>
          <span class="text-primary-600">BİLETLERİM</span>
        </nav>
        <h1 class="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none uppercase">
          ÇEKİLİŞ<br><span class="text-primary-600">BİLETLERİM</span>
        </h1>
        <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          KATILDIĞIM TÜM ÇEKİLİŞLER VE BİLETLERİM
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-24">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>

      <!-- My Lotteries with Tickets -->
      <div v-else-if="myLotteriesWithTickets.length > 0" class="space-y-8">
        <div
          v-for="item in myLotteriesWithTickets"
          :key="item.lottery.id"
          class="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden"
        >
          <!-- Lottery Header -->
          <div class="p-8 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-center gap-6">
              <div class="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  :src="item.lottery.Product?.image || 'https://placehold.co/64x64?text=🎰'"
                  class="w-full h-full object-cover"
                >
              </div>
              <div>
                <h3 class="text-xl font-black text-gray-900 uppercase tracking-tight">
                  {{ item.lottery.title }}
                </h3>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {{ item.tickets.length }} adet bilet
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span
                class="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                :class="getStatusClass(item.lottery.status)"
              >
                {{ getStatusText(item.lottery.status) }}
              </span>
              <NuxtLink
                :to="`/lotteries/${item.lottery.id}`"
                class="px-6 py-2.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-600 transition-all"
              >
                İNCELE
              </NuxtLink>
            </div>
          </div>

          <!-- Tickets Grid -->
          <div class="p-8">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
              BİLETLERİNİZ
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="ticket in item.tickets"
                :key="ticket.id"
                class="bg-gray-50 border border-gray-100 p-5 rounded-2xl"
              >
                <div class="text-[10px] font-black text-gray-300 uppercase italic mb-3">
                  Bilet #{{ ticket.id.slice(-6).toUpperCase() }}
                </div>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="n in ticket.numbers"
                    :key="n"
                    class="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-700 tracking-wider shadow-sm"
                  >
                    {{ n }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Winner Badge -->
            <div
              v-if="item.lottery.status === 'DRAWN' && item.lottery.winnerId === authStore.user?.id"
              class="mt-6 bg-primary-50 border border-primary-100 rounded-2xl p-6 flex items-center gap-4"
            >
              <span class="text-3xl">🏆</span>
              <div>
                <p class="font-black text-primary-700 uppercase tracking-tight">
                  KAZANDIRDINIZ!
                </p>
                <p class="text-xs font-bold text-primary-500">
                  Kazanan numara: {{ item.lottery.winningNumber }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-32">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <span class="text-4xl">🎰</span>
        </div>
        <h2 class="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Henüz çekiliş biletiniz yok
        </h2>
        <p class="text-gray-400 font-bold mt-2 mb-8">
          Aktif çekilişlere katılarak şansınızı deneyin!
        </p>
        <NuxtLink
          to="/lotteries"
          class="px-8 py-4 bg-primary-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30"
        >
          ÇEKİLİŞLERERE GİT
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLotteryStore } from '~/stores/lottery'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default', middleware: 'auth' })
useHead({ title: 'Çekiliş Biletlerim | BazarX' })

const lotteryStore = useLotteryStore()
const authStore = useAuthStore()

const loading = ref(true)

// Biletleri çekiliş bazında grupla
const myLotteriesWithTickets = computed(() => {
  const groups = new Map<string, { lottery: any; tickets: any[] }>()

  for (const ticket of lotteryStore.myTickets) {
    const lottery = lotteryStore.lotteries.find(l => l.id === ticket.lotteryId)
    if (!lottery) continue
    if (!groups.has(ticket.lotteryId)) {
      groups.set(ticket.lotteryId, { lottery, tickets: [] })
    }
    groups.get(ticket.lotteryId)!.tickets.push(ticket)
  }

  return Array.from(groups.values())
})

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    ENDED: 'bg-gray-100 text-gray-600',
    DRAWN: 'bg-purple-100 text-purple-700',
    CANCELLED: 'bg-red-100 text-red-600',
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: 'AKTİF',
    ENDED: 'BİTTİ',
    DRAWN: 'ÇEKİLDİ',
    CANCELLED: 'İPTAL',
  }
  return map[status] || status
}

onMounted(async () => {
  await Promise.all([
    lotteryStore.fetchLotteries(),
    lotteryStore.fetchMyTickets(),
  ])
  loading.value = false
})
</script>
