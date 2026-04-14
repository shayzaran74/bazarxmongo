/**
 * useAdminChat — Watchtower Ghost Mode Composable
 * 
 * Admin chat monitoring UI logic'ini sağlar.
 * AdminChatStore üzerinden ghost socket bağlantısı, oda yönetimi
 * ve moderasyon aksiyonlarını yönetir.
 * 
 * Kullanım:
 * const { rooms, activeRoom, messages, joinRoom, ... } = useAdminChat()
 */

import { storeToRefs } from 'pinia';
import { useAdminChatStore } from '~/stores/adminChat';
import { useAuthStore } from '~/stores/auth';
import type { AdminChatRoom } from '@barterborsa/shared-types';

export function useAdminChat() {
    const store = useAdminChatStore();
    const authStore = useAuthStore();

    const {
        rooms,
        roomsLoading,
        pagination,
        activeRoom,
        activeRoomId,
        messages,
        messagesLoading,
        isConnected,
        searchQuery,
        filterRisky,
        sortByRisk,
        isFrozen,
        filteredRooms,
        typingUsers,
        auditLogs,
        auditLogsLoading,
        auditLogsPagination,
    } = storeToRefs(store);

    // ─── Lifecycle: Socket bağlantısı ───
    const initSocket = () => {
        if (!authStore.isAuthenticated) return;
        store.connectSocket();
    };

    const destroySocket = () => {
        store.leaveGhostRoom();
        store.disconnectSocket();
    };

    // ─── Oda İşlemleri ───
    const fetchRooms = (page?: number) => store.fetchRooms(page);

    const joinRoom = async (room: AdminChatRoom) => {
        try {
            await store.joinGhostRoom(room);
        } catch (err) {
            console.error('[useAdminChat] Failed to join ghost room:', err);
        }
    };

    const leaveRoom = () => store.leaveGhostRoom();

    // ─── Arama & Filtre ───
    const setSearch = (query: string) => {
        store.searchQuery = query;
        store.fetchRooms(1);
    };

    const toggleRiskyFilter = () => {
        store.filterRisky = !store.filterRisky;
        store.fetchRooms(1);
    };

    const toggleSortByRisk = () => {
        store.sortByRisk = !store.sortByRisk;
        store.fetchRooms(1);
    };

    const fetchAuditLogs = (page?: number) => store.fetchAuditLogs(page);

    // ─── Moderasyon Aksiyonları ───

    /** Sistem mesajı gönder */
    const sendSystemMessage = async (content: string) => {
        try {
            await store.sendSystemMessage(content, 'SYSTEM');
            return true;
        } catch (err) {
            console.error('[useAdminChat] sendSystemMessage error:', err);
            return false;
        }
    };

    /** Uyarı mesajı gönder */
    const sendWarning = async (reason: string, note: string) => {
        if (!activeRoom.value) return false;
        try {
            await store.sendWarning(activeRoom.value.id, reason, note);
            return true;
        } catch (err) {
            console.error('[useAdminChat] sendWarning error:', err);
            return false;
        }
    };

    /** Odayı dondur */
    const freezeRoom = async (reason: string, note: string) => {
        if (!activeRoom.value) return false;
        try {
            await store.freezeRoom(activeRoom.value.id, reason, note);
            return true;
        } catch (err) {
            console.error('[useAdminChat] freezeRoom error:', err);
            return false;
        }
    };

    /** Sohbeti devam ettir */
    const unfreezeRoom = async (note: string) => {
        if (!activeRoom.value) return false;
        try {
            await store.unfreezeRoom(activeRoom.value.id, note);
            return true;
        } catch (err) {
            console.error('[useAdminChat] unfreezeRoom error:', err);
            return false;
        }
    };

    // ─── Yardımcılar ───

    /** Mesaj zamanını formatla */
    const formatTime = (dateStr: string): string => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Dün ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            return d.toLocaleDateString('tr-TR', { weekday: 'short' }) + ' ' +
                d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' +
            d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    /** Mesaj ön izlemesi (chat listesi için) */
    const messagePreview = (content: string, maxLen = 40): string => {
        if (content.length <= maxLen) return content;
        return content.substring(0, maxLen) + '...';
    };

    return {
        // State (reactive refs)
        rooms,
        roomsLoading,
        pagination,
        activeRoom,
        activeRoomId,
        messages,
        messagesLoading,
        isConnected,
        searchQuery,
        filterRisky,
        sortByRisk,
        isFrozen,
        filteredRooms,
        typingUsers,
        auditLogs,
        auditLogsLoading,
        auditLogsPagination,

        // Actions
        initSocket,
        destroySocket,
        fetchRooms,
        joinRoom,
        leaveRoom,
        setSearch,
        toggleRiskyFilter,
        toggleSortByRisk,
        fetchAuditLogs,
        sendSystemMessage,
        sendWarning,
        freezeRoom,
        unfreezeRoom,

        // Helpers
        formatTime,
        messagePreview,
    };
}
