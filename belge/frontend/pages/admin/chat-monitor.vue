<template>
  <div class="min-h-[calc(100vh-64px)]">
    <!-- ── HEADER ── -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🔭 Watchtower
          <span class="text-sm font-normal bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Sohbet
            İzleme</span>
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          Ghost mode ile aktif ticaret sohbetlerini izleyin ve moderasyon
          yapın.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Socket Durumu -->
        <span
          class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
          :class="isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
        >
          <span
            class="w-2 h-2 rounded-full"
            :class="isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
          />
          {{ isConnected ? 'Ghost Socket Aktif' : 'Bağlantı Yok' }}
        </span>
        <!-- Risk Sıralaması -->
        <button
          class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors border"
          :class="sortByRisk ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
          @click="toggleSortByRisk"
        >
          ⚖️ {{ sortByRisk ? 'Risk Sıralaması Aktif' : 'Normal Sıralama' }}
        </button>
        <!-- Risky Filtre -->
        <button
          class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors"
          :class="filterRisky ? 'bg-red-100 text-red-700 ring-1 ring-red-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          @click="toggleRiskyFilter"
        >
          🚨 Riskli
        </button>
      </div>
    </div>

    <!-- ── TABS ── -->
    <div class="flex items-center gap-1 mb-4 border-b">
      <button
        class="px-6 py-2.5 text-sm font-medium transition-colors relative"
        :class="activeTab === 'chats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'"
        @click="activeTab = 'chats'"
      >
        Sohbet İzleme
      </button>
      <button
        class="px-6 py-2.5 text-sm font-medium transition-colors relative"
        :class="activeTab === 'audit' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'"
        @click="activeTab = 'audit'"
      >
        Denetim Logları
      </button>
    </div>

    <!-- ── CONTENT ── -->
    <div
      v-if="activeTab === 'chats'"
      class="grid grid-cols-12 gap-4 h-[calc(100vh-230px)]"
    >
      <!-- ═══ SOL: Sohbet Listesi ═══ -->
      <div class="col-span-4 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <!-- Arama -->
        <div class="p-3 border-b flex items-center gap-2">
          <div class="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="searchInput"
              type="text"
              placeholder="Firma veya kullanıcı ara..."
              class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              @input="debouncedSearch"
            >
          </div>
        </div>

        <!-- Oda Listesi -->
        <div class="flex-1 overflow-y-auto">
          <!-- Loading -->
          <div
            v-if="roomsLoading"
            class="p-6 text-center text-gray-400 text-sm"
          >
            <svg
              class="animate-spin h-5 w-5 mx-auto mb-2"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Sohbetler yükleniyor...
          </div>

          <!-- Boş -->
          <div
            v-else-if="filteredRooms.length === 0"
            class="p-6 text-center text-gray-400 text-sm"
          >
            Aktif sohbet bulunamadı.
          </div>

          <!-- Oda Kartları -->
          <div v-else>
            <button
              v-for="room in filteredRooms"
              :key="room.id"
              class="w-full text-left p-3 border-b border-gray-100 hover:bg-blue-50/50 transition-colors group relative"
              :class="activeRoomId === room.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''"
              @click="handleRoomClick(room)"
            >
              <!-- HOT Badge -->
              <div
                v-if="room.isHot"
                class="absolute top-2 right-2 flex items-center gap-1 bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse"
              >
                🔥 AKTİF
              </div>

              <div class="flex items-start gap-2">
                <!-- Risk İndikatörü -->
                <div class="shrink-0 mt-1 flex flex-col items-center">
                  <span
                    v-if="room.hasRiskyContent"
                    class="text-red-500 text-sm"
                    title="Riskli içerik tespit edildi"
                  >🚨</span>
                  <span
                    v-else
                    class="text-gray-300 text-sm"
                  >💬</span>
                  <span
                    v-if="room.riskScore > 0"
                    class="text-[9px] font-bold mt-1"
                    :class="room.riskScore > 50 ? 'text-red-600' : 'text-amber-600'"
                  >
                    {{ room.riskScore }}
                  </span>
                </div>

                <div class="flex-1 min-w-0">
                  <!-- Firma İsimleri -->
                  <div class="flex items-center gap-1 text-sm font-semibold text-gray-800">
                    <span class="truncate">{{ room.tradeOffer.fromCompany.name }}</span>
                    <span class="text-gray-400 text-xs">↔</span>
                    <span class="truncate">{{ room.tradeOffer.toCompany.name }}</span>
                  </div>

                  <!-- Son Mesaj Önizleme -->
                  <p class="text-xs text-gray-500 mt-0.5 truncate">
                    {{ room.lastMessage ? messagePreview(room.lastMessage.content) : 'Henüz mesaj yok' }}
                  </p>

                  <!-- Alt Bilgi -->
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-[10px] text-gray-400">
                      {{ room.lastMessage ? formatTime(room.lastMessage.createdAt) :
                        formatTime(room.createdAt) }}
                    </span>
                    <span
                      v-if="room.messageCount > 0"
                      class="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full"
                    >
                      {{ room.messageCount }} mesaj
                    </span>
                    <span
                      v-if="room.tradeOffer.status === 'disputed'"
                      class="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold"
                    >
                      🧊 Dondurulmuş
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination.totalPages > 1"
          class="p-3 border-t bg-gray-50 flex items-center justify-between"
        >
          <button
            :disabled="pagination.page <= 1"
            class="px-3 py-1 text-xs bg-white border rounded-lg disabled:opacity-40 hover:bg-gray-50"
            @click="paginate(pagination.page - 1)"
          >
            ← Önceki
          </button>
          <span class="text-xs text-gray-500">{{ pagination.page }} / {{ pagination.totalPages }}</span>
          <button
            :disabled="pagination.page >= pagination.totalPages"
            class="px-3 py-1 text-xs bg-white border rounded-lg disabled:opacity-40 hover:bg-gray-50"
            @click="paginate(pagination.page + 1)"
          >
            Sonraki →
          </button>
        </div>
      </div>

      <!-- ═══ ORTA + SAĞ: Ghost Chat Penceresi ═══ -->
      <div
        v-if="activeRoom"
        class="col-span-8"
      >
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

      <!-- Boş Durum -->
      <div
        v-else
        class="col-span-8 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-200"
      >
        <div class="text-center text-gray-400">
          <div class="text-6xl mb-4">
            👻
          </div>
          <h3 class="text-lg font-semibold text-gray-500">
            Ghost Mode Hazır
          </h3>
          <p class="text-sm mt-1">
            Soldaki listeden bir sohbet seçerek<br>görünmez izlemeye başlayın.
          </p>
        </div>
      </div>
    </div>

    <!-- ── DENETİM LOGLARI ── -->
    <div
      v-else
      class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-230px)]"
    >
      <div class="overflow-x-auto h-full overflow-y-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-gray-50 sticky top-0 z-10 border-b">
            <tr>
              <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                Tarih
              </th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                Yönetici
              </th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                Aksiyon
              </th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                Hedef Oda
              </th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                Sebep / Not
              </th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                IP
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-if="auditLogsLoading"
              class="animate-pulse"
            >
              <td
                colspan="6"
                class="px-6 py-8 text-center text-gray-400"
              >
                Loglar yükleniyor...
              </td>
            </tr>
            <tr v-else-if="auditLogs.length === 0">
              <td
                colspan="6"
                class="px-6 py-8 text-center text-gray-400"
              >
                Henüz denetim kaydı bulunmuyor.
              </td>
            </tr>
            <tr
              v-for="log in auditLogs"
              :key="log.id"
              class="hover:bg-gray-50 group"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 font-medium">
                  {{ new
                    Date(log.createdAt).toLocaleDateString('tr-TR') }}
                </div>
                <div class="text-xs text-gray-400">
                  {{ new
                    Date(log.createdAt).toLocaleTimeString('tr-TR') }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold"
                  >
                    {{ log.admin.name ? log.admin.name.charAt(0) : 'A' }}
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-gray-800">
                      {{ log.admin.name || 'Admin' }}
                    </div>
                    <div class="text-xs text-gray-400">
                      @{{ log.admin.username }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
                  :class="{
                    'bg-blue-100 text-blue-700': log.action === 'JOIN_GHOST_MODE',
                    'bg-amber-100 text-amber-700': log.action === 'SEND_WARNING',
                    'bg-red-100 text-red-700': log.action === 'FREEZE_CHAT',
                    'bg-gray-100 text-gray-700': log.action === 'SEND_SYSTEM_MESSAGE'
                  }"
                >
                  {{ log.action }}
                </span>
              </td>
              <td class="px-6 py-4 font-mono text-xs text-gray-500">
                {{ log.targetId || '-' }}
              </td>
              <td class="px-6 py-4">
                <div
                  class="text-sm text-gray-700 max-w-xs truncate"
                  :title="log.reason"
                >
                  {{ log.reason || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                {{ log.ip }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Audit Pagination -->
      <div
        v-if="auditLogsPagination.totalPages > 1"
        class="p-4 border-t bg-gray-50 flex items-center justify-between"
      >
        <button
          :disabled="auditLogsPagination.page <= 1"
          class="px-4 py-1.5 text-sm bg-white border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          @click="fetchAuditLogs(auditLogsPagination.page - 1)"
        >
          ← Önceki
        </button>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">{{ auditLogsPagination.page }}</span>
          <span class="text-sm text-gray-400">/</span>
          <span class="text-sm text-gray-400">{{ auditLogsPagination.totalPages }}</span>
        </div>
        <button
          :disabled="auditLogsPagination.page >= auditLogsPagination.totalPages"
          class="px-4 py-1.5 text-sm bg-white border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          @click="fetchAuditLogs(auditLogsPagination.page + 1)"
        >
          Sonraki →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

definePageMeta({
    layout: 'admin', middleware: 'admin'
})

const {
    roomsLoading,
    pagination,
    activeRoom,
    activeRoomId,
    messages,
    messagesLoading,
    isConnected,
    filterRisky,
    sortByRisk,
    isFrozen,
    filteredRooms,
    auditLogs,
    auditLogsLoading,
    auditLogsPagination,
    initSocket,
    destroySocket,
    fetchRooms,
    fetchAuditLogs,
    joinRoom,
    leaveRoom,
    setSearch,
    toggleRiskyFilter,
    toggleSortByRisk,
    sendSystemMessage,
    sendWarning,
    freezeRoom,
    unfreezeRoom,
    formatTime,
    messagePreview,
} = useAdminChat()

const searchInput = ref('')
const activeTab = ref('chats') // 'chats' | 'audit'

// ── Tab Switch Logic ──
watch(activeTab, (newTab) => {
    if (newTab === 'audit') {
        fetchAuditLogs()
    } else {
        fetchRooms()
    }
})

// ── Debounced Search ──
let searchTimeout = null
const debouncedSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        setSearch(searchInput.value)
    }, 300)
}

// ── Room Click ──
const handleRoomClick = (room) => {
    joinRoom(room)
}

// ── Pagination ──
const paginate = (page) => {
    fetchRooms(page)
}

// ── Moderasyon Aksiyonları ──
const handleFreeze = async ({ reason, note }) => {
    try {
        await freezeRoom(reason, note)
        useNuxtApp().$toast.success('Sohbet donduruldu.')
    } catch (err) {
        useNuxtApp().$toast.error('Dondurma işlemi başarısız.')
    }
}

const handleUnfreeze = async ({ note }) => {
    try {
        await unfreezeRoom(note)
        useNuxtApp().$toast.success('Sohbet tekrar aktif edildi.')
    } catch (err) {
        useNuxtApp().$toast.error('Aktif etme işlemi başarısız.')
    }
}

const handleWarning = async ({ reason, note }) => {
    try {
        await sendWarning(reason, note)
        useNuxtApp().$toast.success('Uyarı gönderildi.')
    } catch (err) {
        useNuxtApp().$toast.error('Uyarı gönderilemedi.')
    }
}

const handleSystemMessage = async (content) => {
    try {
        await sendSystemMessage(content)
        useNuxtApp().$toast.success('Sistem mesajı gönderildi.')
    } catch (err) {
        useNuxtApp().$toast.error('Mesaj gönderilemedi.')
    }
}

const handleClose = () => {
    leaveRoom()
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
.scrollbar-thin::-webkit-scrollbar {
    width: 5px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 10px;
}
</style>
