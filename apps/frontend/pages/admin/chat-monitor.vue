<template>
  <div class="min-h-screen bg-slate-950 p-8">
    <div class="max-w-[1600px] mx-auto h-[calc(100vh-100px)] flex flex-col">
      <!-- ── HEADER PROTOCOL ── -->
      <AdminChatMonitorHeader
        :is-connected="isConnected"
        :sort-by-risk="sortByRisk"
        :filter-risky="filterRisky"
        @toggle-sort-by-risk="toggleSortByRisk"
        @toggle-risky-filter="toggleRiskyFilter"
      />

      <!-- ── TABS NAVIGATION ── -->
      <div class="flex items-center gap-2 mb-10 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 w-fit font-sans italic">
        <button
          class="px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          :class="activeTab === 'chats' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-slate-500 hover:text-slate-200'"
          @click="activeTab = 'chats'"
        >
          🛰️ SOHBET İZLEME
        </button>
        <button
          class="px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          :class="activeTab === 'audit' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-slate-500 hover:text-slate-200'"
          @click="activeTab = 'audit'"
        >
          📜 DENETİM LOGLARI
        </button>
      </div>

      <!-- ── DYNAMIC CONTENT ENGINE ── -->
      <div class="flex-1 min-h-0 overflow-hidden">
        <!-- CHAT VIEW ENGINE -->
        <div v-if="activeTab === 'chats'" class="grid grid-cols-12 gap-8 h-full">
          <!-- Left: Room Intelligence -->
          <div class="col-span-12 lg:col-span-4 h-full">
            <AdminChatMonitorRoomList
              v-model:search-input="searchInput"
              :rooms="filteredRooms"
              :loading="roomsLoading"
              :active-room-id="activeRoomId"
              :pagination="pagination"
              :format-time="formatTime"
              @select="handleRoomClick"
              @paginate="paginate"
            />
          </div>

          <!-- Center/Right: Ghost Monitor Terminal -->
          <div class="col-span-12 lg:col-span-8 h-full">
            <div v-if="activeRoom" class="h-full">
              <AdminChatWindow
                :room="activeRoom"
                :messages="messages"
                :is-connected="isConnected"
                :is-frozen="isFrozen"
                :messages-loading="messagesLoading"
                @freeze="handleFreeze"
                @unfreeze="handleUnfreeze"
                @warning="handleWarning"
                @system-message="handleSystemMessage"
                @close="handleClose"
              />
            </div>
            
            <div v-else class="h-full bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6">
              <div class="w-32 h-32 rounded-full bg-slate-900 flex items-center justify-center text-6xl opacity-30 animate-pulse">
                👻
              </div>
              <div class="space-y-2 max-w-sm px-10">
                <h3 class="text-xl font-black text-slate-100 uppercase tracking-tightest">GHOST ENGINE STANDBY</h3>
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-relaxed">SOL PANEL ÜZERİNDEN BİR SİNYAL SEÇEREK GİZLİ İZLEME PROTOKOLÜNÜ BAŞLATIN.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- AUDIT ENGINE -->
        <div v-else class="h-full">
          <AdminChatMonitorAuditLogs
            :logs="auditLogs"
            :loading="auditLogsLoading"
            :pagination="auditLogsPagination"
            @paginate="fetchAuditLogs"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminChatMonitorHeader from '~/components/admin/chat/AdminChatMonitorHeader.vue'
import AdminChatMonitorRoomList from '~/components/admin/chat/AdminChatMonitorRoomList.vue'
import AdminChatMonitorAuditLogs from '~/components/admin/chat/AdminChatMonitorAuditLogs.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useHead({
  title: 'WATCHTOWER GHOST MODE // BAZARX'
})

const {
  roomsLoading, pagination, activeRoom, activeRoomId, messages, messagesLoading,
  isConnected, filterRisky, sortByRisk, isFrozen, filteredRooms,
  auditLogs, auditLogsLoading, auditLogsPagination,
  initSocket, destroySocket, fetchRooms, fetchAuditLogs, joinRoom, leaveRoom, setSearch,
  toggleRiskyFilter, toggleSortByRisk, sendSystemMessage, sendWarning, freezeRoom, unfreezeRoom,
  formatTime
} = useAdminChat()

const searchInput = ref('')
const activeTab = ref('chats')

// ── Tab Switch Logic ──
watch(activeTab, (newTab) => {
  if (newTab === 'audit') fetchAuditLogs()
  else fetchRooms()
})

// ── Debounced Search ──
let searchTimeout: any = null
watch(searchInput, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    setSearch(val)
  }, 300)
})

// ── Actions ──
const handleRoomClick = (room: any) => joinRoom(room)
const paginate = (page: number) => fetchRooms(page)
const handleClose = () => leaveRoom()

// ── Moderation Handlers ──
const handleFreeze = async ({ reason, note }: any) => {
  if (await freezeRoom(reason, note)) useNuxtApp().$toast.success('SOHBET DONDURULDU')
}
const handleUnfreeze = async ({ note }: any) => {
  if (await unfreezeRoom(note)) useNuxtApp().$toast.success('SOHBET DEVAM EDİYOR')
}
const handleWarning = async ({ reason, note }: any) => {
  if (await sendWarning(reason, note)) useNuxtApp().$toast.success('UYARI GÖNDERİLDİ')
}
const handleSystemMessage = async (content: string) => {
  if (await sendSystemMessage(content)) useNuxtApp().$toast.success('SİSTEM MESAJI YAYINLANDI')
}

// ── Lifecycle ──
onMounted(() => {
  initSocket()
  fetchRooms()
})

onUnmounted(() => {
  destroySocket()
})
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.06em; }
</style>
