<script setup lang="ts">
/**
 * AdminChatWindow — Ghost Mode Read-Only Chat Penceresi
 * 
 * Admin sohbeti salt-okunur izler (ghost mode).
 * Sistem mesajı ve uyarı gönderme, odayı dondurma aksiyonları sağlar.
 * Kullanıcılar admin'in varlığından haberdar değildir.
 */
import { ref, watch, nextTick, onMounted, computed } from '#imports'
import type { AdminMessage, AdminChatRoom } from '@barterborsa/shared-types';
import { useAdminChatStore } from '~/stores/adminChat';

const props = defineProps<{
    room: AdminChatRoom;
    messages: AdminMessage[];
    isConnected: boolean;
    isFrozen: boolean;
    messagesLoading: boolean;
}>();

const emit = defineEmits<{
    (e: 'freeze', payload: { reason: string; note: string }): void;
    (e: 'unfreeze', payload: { note: string }): void;
    (e: 'warning', payload: { reason: string; note: string }): void;
    (e: 'system-message', content: string): void;
    (e: 'close'): void;
}>();

const store = useAdminChatStore();
const scrollContainer = ref<HTMLElement | null>(null);

// ── Modals & Actions ──
const showActionModal = ref(false);
const actionType = ref<'system' | 'warning' | 'freeze' | 'unfreeze' | null>(null);
const actionData = ref({
    reason: '',
    note: '',
    content: '' // sistem mesajı için
});

// ── Typing Status ──
const typingIndicator = computed(() => {
    // typingUsers objesinde roomId key olarak kullanılabilir
    const users = store.typingUsers;
    const typingList = Object.values(users)
        .filter((data) => data.expires > Date.now())
        .map((data) => data.username);

    if (typingList.length === 0) return null;
    if (typingList.length === 1) return `${typingList[0]} yazıyor...`;
    return `${typingList.length} kişi yazıyor...`;
});

// ── Scroll ──
const scrollToBottom = (force = false) => {
    if (!scrollContainer.value) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
    if (isAtBottom || force) {
        nextTick(() => {
            scrollContainer.value?.scrollTo({
                top: scrollContainer.value.scrollHeight,
                behavior: 'smooth',
            });
        });
    }
};

watch(() => props.messages, () => scrollToBottom(), { deep: true });
onMounted(() => scrollToBottom(true));

// ── Tarih Ayracı ──
const shouldShowDateSeparator = (msg: AdminMessage, index: number) => {
    if (index === 0) return true;
    const prevMsg = props.messages[index - 1];
    return new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
};

const formatDateLabel = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Bugün';
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Dün';
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
};

const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

// ── Mesaj Sınıflandırma ──
const isSystemMessage = (msg: AdminMessage) => msg.type === 'SYSTEM' || msg.type === 'SYSTEM_WARNING';
const isFromAdmin = (msg: AdminMessage) => msg.metadata?.fromAdmin === true;

const getMessageStyle = (msg: AdminMessage): string => {
    if (msg.type === 'SYSTEM_WARNING') return 'bg-red-50 border border-red-200 text-red-800';
    if (msg.type === 'SYSTEM') return 'bg-yellow-50 border border-yellow-200 text-yellow-800';
    // UserA (sol) vs UserB (sağ)
    if (msg.senderId === props.room.userAId) return 'bg-blue-50 border border-blue-200 text-blue-900';
    return 'bg-emerald-50 border border-emerald-200 text-emerald-900';
};

const getSenderLabel = (msg: AdminMessage): string => {
    if (isFromAdmin(msg)) return '🛡️ BazarX Ekibi';
    if (msg.type === 'SYSTEM' || msg.type === 'SYSTEM_WARNING') return '⚙️ Sistem';
    if (msg.sender?.name) return msg.sender.name;
    if (msg.senderId === props.room.userAId && props.room.tradeOffer?.fromCompany) return props.room.tradeOffer.fromCompany.name;
    if (msg.senderId === props.room.userBId && props.room.tradeOffer?.toCompany) return props.room.tradeOffer.toCompany.name;
    return 'Bilinmeyen';
};

// ── Risky Keyword Highlighting ──
const RISKY_PATTERNS = [
    /\d{10,11}/g,          // Telefon numarası
    /[\w.-]+@[\w.-]+\.\w+/g,  // E-posta
    /whatsapp|telegram|instagram|banka|iban|hesap\s*no/gi, // Platform / finansal
];

const highlightRisky = (text: string): string => {
    let result = text;
    RISKY_PATTERNS.forEach(pattern => {
        result = result.replace(pattern, (match) => `<mark class="bg-red-200 text-red-900 px-0.5 rounded">${match}</mark>`);
    });
    return result;
};

// ── Aksiyonlar ──
const openAction = (type: 'system' | 'warning' | 'freeze' | 'unfreeze') => {
    actionType.value = type;
    actionData.value = { reason: '', note: '', content: '' };
    showActionModal.value = true;
};

const submitAction = () => {
    if (actionType.value === 'system') {
        if (!actionData.value.content.trim()) return;
        emit('system-message', actionData.value.content.trim());
    } else if (actionType.value === 'warning') {
        if (!actionData.value.reason.trim()) return;
        emit('warning', { reason: actionData.value.reason, note: actionData.value.note });
    } else if (actionType.value === 'freeze') {
        if (!actionData.value.reason.trim()) return;
        emit('freeze', { reason: actionData.value.reason, note: actionData.value.note });
    } else if (actionType.value === 'unfreeze') {
        emit('unfreeze', { note: actionData.value.note });
    }
    showActionModal.value = false;
};

const isActionValid = computed(() => {
    if (actionType.value === 'system') return !!actionData.value.content?.trim();
    if (actionType.value === 'warning') return !!actionData.value.reason?.trim() && !!actionData.value.note?.trim();
    if (actionType.value === 'freeze') return !!actionData.value.reason?.trim() && actionData.value.note?.trim().length >= 3;
    if (actionType.value === 'unfreeze') return true; // Unfreeze is always valid if opened
    return false;
});


// ── Geçmiş Mesajları Yükle ──
const loadingMore = ref(false);
const hasMoreMessages = ref(true);

const loadMore = async () => {
    if (loadingMore.value || !hasMoreMessages.value) return;
    loadingMore.value = true;

    // Yüklemeden önce scroll pozisyonunu korumak için yüksekliği kaydet
    const oldHeight = scrollContainer.value?.scrollHeight || 0;

    const count = await store.loadMoreMessages();

    if (count === 0) {
        hasMoreMessages.value = false;
    } else {
        // Scroll pozisyonunu koru
        nextTick(() => {
            if (scrollContainer.value) {
                scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight - oldHeight;
            }
        });
    }
    loadingMore.value = false;
};

// Oda değiştiğinde hasMore'u sıfırla
watch(() => props.room.id, () => {
    hasMoreMessages.value = true;
});
</script>

<template>
  <div class="flex flex-col h-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative">
    <!-- ── MODERASYON MODAL ── -->
    <div
      v-if="showActionModal"
      class="absolute inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm"
    >
      <div
        class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">
            {{ actionType === 'system' ? 'Sistem Mesajı Gönder' :
              actionType === 'warning' ? 'Uyarı Gönder' :
              actionType === 'freeze' ? 'Konuşmayı Dondur' : 'Sohbeti Devam Ettir' }}
          </h3>
        </div>

        <div class="p-6 space-y-4">
          <!-- Sistem Mesajı -->
          <div v-if="actionType === 'system'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Mesaj İçeriği</label>
            <textarea
              v-model="actionData.content"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="Kullanıcılara iletilecek sistem mesajı..."
            />
          </div>

          <!-- Uyarı / Dondurma Sebebi -->
          <div v-if="actionType === 'warning' || actionType === 'freeze'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Sebep</label>
            <select
              v-model="actionData.reason"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">
                Sebep Seçin...
              </option>
              <option value="argo_kufur">
                Argo / Küfürlü Üslup
              </option>
              <option value="platform_disi">
                Platform Dışı İşlem Denemesi
              </option>
              <option value="guvenlik_riski">
                Güvenlik Riski (Dolandırıcılık Şüphesi)
              </option>
              <option value="etik_disi">
                Etik Dışı Davranış
              </option>
              <option value="diger">
                Diğer
              </option>
            </select>
          </div>

          <!-- Not (Opsiyonel) -->
          <div v-if="actionType === 'warning' || actionType === 'freeze' || actionType === 'unfreeze'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ actionType === 'unfreeze' ? 'Açıklama Notu' : 'Yönetici Notu' }}
            </label>
            <textarea
              v-model="actionData.note"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              :placeholder="actionType === 'freeze' ? 'Dondurma hakkında detaylı açıklama (En az 3 karakter)...' : 'Yönetici için not...'"
            />
          </div>
        </div>

        <div class="p-6 border-t border-gray-100 flex justify-end space-x-3">
          <button
            class="px-6 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            @click="showActionModal = false"
          >
            İptal
          </button>
          <button
            :disabled="!isActionValid"
            class="px-6 py-2 text-sm font-bold text-white rounded-lg transition-transform active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{
              'bg-blue-600': actionType === 'system',
              'bg-orange-600': actionType === 'warning',
              'bg-red-600': actionType === 'freeze',
              'bg-green-600': actionType === 'unfreeze'
            }"
            @click="submitAction"
          >
            {{ actionType === 'unfreeze' ? 'Aktif Et' : 'İşlemi Onayla' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── HEADER ── -->
    <div class="p-4 border-b bg-gradient-to-r from-gray-900 to-gray-800 text-white shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Ghost Badge -->
          <span class="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded-full">
            <span class="animate-pulse">👻</span>
            GHOST MODE
          </span>
          <div>
            <h3 class="font-bold text-sm">
              {{ room.tradeOffer?.fromCompany?.name || 'Üye A' }}
              <span class="text-gray-400 font-normal mx-1">↔</span>
              {{ room.tradeOffer?.toCompany?.name || 'Üye B' }}
            </h3>
            <p class="text-xs text-gray-400">
              <span :class="isConnected ? 'text-green-400' : 'text-red-400'">●</span>
              {{ isConnected ? 'Canlı İzleme' : 'Bağlantı Kesildi' }}
              <span
                v-if="isFrozen"
                class="ml-2 bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full text-[10px] font-bold"
              >
                🧊 DONDURULMUŞ
              </span>
            </p>
          </div>
        </div>

        <!-- Kapat Butonu -->
        <button
          class="text-gray-400 hover:text-white transition-colors p-1"
          title="Kapat"
          @click="emit('close')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <!-- Trade Detayları -->
      <div
        v-if="room.tradeOffer"
        class="mt-2 flex items-center gap-4 text-xs text-gray-400"
      >
        <span
          v-if="room.tradeOffer.offeredItem"
          class="flex items-center gap-1"
        >
          📦 {{ room.tradeOffer.offeredItem.title }}
        </span>
        <span
          v-if="room.tradeOffer.requestedItem"
          class="flex items-center gap-1"
        >
          🔄 {{ room.tradeOffer.requestedItem.title }}
        </span>
        <span
          class="ml-auto text-[10px] font-mono uppercase px-2 py-0.5 rounded-full"
          :class="{
            'bg-green-500/20 text-green-300': room.tradeOffer.status === 'ACCEPTED' || room.tradeOffer.status === 'accepted' as any,
            'bg-yellow-500/20 text-yellow-300': room.tradeOffer.status === 'PENDING' || room.tradeOffer.status === 'pending',
            'bg-red-500/20 text-red-300': room.tradeOffer.status === 'DISPUTED' || room.tradeOffer.status === 'disputed',
          }"
        >
          {{ room.tradeOffer.status }}
        </span>
      </div>
    </div>

    <!-- ── MESAJ LİSTESİ (Read-Only) ── -->
    <div
      ref="scrollContainer"
      class="flex-1 p-4 overflow-y-auto bg-gray-50/50 space-y-2 scrollbar-thin"
    >
      <!-- Loading -->
      <div
        v-if="messagesLoading"
        class="flex h-full items-center justify-center text-gray-400"
      >
        <svg
          class="animate-spin h-6 w-6 mr-2"
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
        Mesajlar yükleniyor...
      </div>

      <!-- Load More Button -->
      <div
        v-if="!messagesLoading && messages.length >= 50 && hasMoreMessages"
        class="flex justify-center pb-4"
      >
        <button
          :disabled="loadingMore"
          class="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 transition-colors disabled:opacity-50"
          @click="loadMore"
        >
          {{ loadingMore ? 'Yükleniyor...' : '⬆️ Daha Fazla Geçmiş Mesaj Yükle' }}
        </button>
      </div>
      <div
        v-else-if="!hasMoreMessages && messages.length > 0"
        class="text-center pb-4 text-[9px] text-gray-400"
      >
        Sohbetin başlangıcı.
      </div>

      <!-- Boş -->
      <div
        v-else-if="messages.length === 0"
        class="flex h-full items-center justify-center text-gray-400 text-sm italic"
      >
        Bu sohbette henüz mesaj yok.
      </div>

      <!-- Mesajlar -->
      <div
        v-for="(msg, index) in messages"
        v-else
        :key="msg.id"
      >
        <!-- Tarih Ayracı -->
        <div
          v-if="shouldShowDateSeparator(msg, index)"
          class="flex justify-center my-3"
        >
          <span
            class="bg-gray-200 text-gray-600 text-[10px] px-2.5 py-0.5 rounded-full font-medium uppercase tracking-wider"
          >
            {{ formatDateLabel(msg.createdAt) }}
          </span>
        </div>

        <!-- Sistem Mesajı -->
        <div
          v-if="isSystemMessage(msg)"
          class="flex justify-center my-2"
        >
          <div
            class="max-w-[85%] px-3 py-2 rounded-lg text-xs text-center shadow-sm"
            :class="getMessageStyle(msg)"
          >
            <span
              v-if="isFromAdmin(msg)"
              class="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold mr-1"
            >
              🛡️ ADMIN
            </span>
            {{ msg.content }}
            <div class="text-[9px] mt-1 opacity-60">
              {{ formatTime(msg.createdAt) }}
            </div>
          </div>
        </div>

        <!-- Normal Mesaj (Read-Only) -->
        <div
          v-else
          class="mb-2"
        >
          <div
            class="flex items-start gap-2 max-w-[90%]"
            :class="msg.senderId === room.userBId ? 'ml-auto flex-row-reverse' : ''"
          >
            <!-- Avatar Placeholder -->
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              :class="msg.senderId === room.userAId ? 'bg-blue-200 text-blue-700' : 'bg-emerald-200 text-emerald-700'"
            >
              {{ getSenderLabel(msg).charAt(0).toUpperCase() }}
            </div>

            <div>
              <!-- Gönderen -->
              <div
                class="text-[10px] font-medium mb-0.5 px-1"
                :class="msg.senderId === room.userAId ? 'text-blue-600' : 'text-emerald-600'"
              >
                {{ getSenderLabel(msg) }}
              </div>

              <!-- Mesaj Baloncuğu -->
              <div
                class="px-3 py-2 rounded-xl text-sm shadow-sm"
                :class="getMessageStyle(msg)"
              >
                <!-- eslint-disable vue/no-v-html -->
                <p
                  class="break-words"
                  v-html="highlightRisky(msg.content)"
                />
                <!-- eslint-enable vue/no-v-html -->
                <div class="flex items-center gap-1 mt-1 text-[9px] opacity-50">
                  <span>{{ formatTime(msg.createdAt) }}</span>
                  <!-- Read Receipts -->
                  <span
                    v-if="msg.readAt"
                    class="flex"
                    :class="isFromAdmin(msg) ? 'text-blue-500' : 'text-gray-400'"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill="currentColor"
                    >
                      <path
                        d="M0.45 12.15l1.41-1.42 4.24 4.25 9.19-9.19 1.42 1.41-10.61 10.61-5.65-5.66zM16.97 6.38l1.42 1.41-9.19 9.2-1.42-1.41 9.19-9.2z"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div
        v-if="typingIndicator"
        class="flex items-center gap-2 text-xs text-gray-400 italic px-10 animate-pulse"
      >
        <div class="flex gap-0.5">
          <span class="w-1 h-1 bg-gray-300 rounded-full animate-bounce" />
          <span
            class="w-1 h-1 bg-gray-300 rounded-full animate-bounce"
            style="animation-delay: 0.2s"
          />
          <span
            class="w-1 h-1 bg-gray-300 rounded-full animate-bounce"
            style="animation-delay: 0.4s"
          />
        </div>
        {{ typingIndicator }}
      </div>
    </div>

    <!-- ── MODERASYON TOOLBAR ── -->
    <div class="p-4 border-t bg-gray-50 flex items-center gap-2 shrink-0">
      <div class="mr-auto">
        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">👁️ Ghost Mode</span>
        <span class="text-[9px] text-gray-500">Müdahale edebilirsiniz.</span>
      </div>
      <button
        class="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition-all shadow-sm border border-blue-100"
        @click="openAction('system')"
      >
        💬 Mesaj
      </button>
      <button
        class="px-4 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-bold rounded-xl transition-all shadow-sm border border-orange-100"
        @click="openAction('warning')"
      >
        ⚠️ Uyarı
      </button>
      <button
        v-if="!isFrozen"
        class="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold rounded-xl transition-all shadow-sm border border-red-100"
        @click="openAction('freeze')"
      >
        🧊 Dondur
      </button>
      <button
        v-else
        class="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-bold rounded-xl transition-all shadow-sm border border-green-100"
        @click="openAction('unfreeze')"
      >
        ✅ Aktif Et
      </button>
    </div>
  </div>
</template>


<style scoped>
.scrollbar-thin::-webkit-scrollbar {
    width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 10px;
}
</style>
