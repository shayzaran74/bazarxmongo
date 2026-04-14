import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './auth';
import { useAdminChatService } from '~/services/api/AdminChatService';
import type { AdminMessage, AdminChatRoom, AdminAuditLog } from '@barterborsa/shared-types';

export const useAdminChatStore = defineStore('adminChat', {
    state: () => ({
        // Socket
        socket: null as Socket | null,
        isConnected: false,

        // Oda listesi (REST API'den)
        rooms: [] as AdminChatRoom[],
        roomsLoading: false,
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },

        // Aktif ghost room (socket'ten)
        activeRoom: null as AdminChatRoom | null,
        activeRoomId: null as string | null,
        messages: [] as AdminMessage[],
        messagesLoading: false,

        // Filtreler
        searchQuery: '',
        filterRisky: false,
        sortByRisk: false,

        // Audit Loglar
        auditLogs: [] as AdminAuditLog[],
        auditLogsLoading: false,
        auditLogsPagination: { page: 1, limit: 50, total: 0, totalPages: 0 },

        // typing durumu
        typingUsers: {} as Record<string, { username: string; expires: number }>,

        // Freeze durumu
        isFrozen: false,
    }),

    getters: {
        filteredRooms: (state) => {
            let rooms = state.rooms;
            if (state.filterRisky) {
                rooms = rooms.filter(r => r.hasRiskyContent);
            }
            return rooms;
        },
        isSocketConnected: (state) => state.isConnected,
    },

    actions: {
        // ─── Ghost Socket Bağlantısı ───
        connectSocket() {
            if (this.socket) return;

            const config = useRuntimeConfig();
            const authStore = useAuthStore();
            const socketUrl = `${config.public.apiBase}/admin-chat`;

            this.socket = io(socketUrl, {
                auth: { token: authStore.token },
                withCredentials: true,
                transports: ['websocket'],
            });

            this.socket.on('connect', () => {
                this.isConnected = true;
                console.log('[AdminChatStore] 👻 Connected to /admin-chat namespace');
            });

            this.socket.on('disconnect', () => {
                this.isConnected = false;
                console.log('[AdminChatStore] 👻 Disconnected from /admin-chat namespace');
            });

            // ── Ghost event listeners ──
            this.socket.on('newMessage', (message: AdminMessage) => {
                this.messages.push(message);
            });

            this.socket.on('messagesRead', ({ messageIds, readAt, tradeOfferId }: { messageIds: string[]; readAt: string; tradeOfferId?: string }) => {
                if (!tradeOfferId || (this.activeRoom && this.activeRoom.tradeOfferId === tradeOfferId)) {
                    this.messages.forEach(m => {
                        if (messageIds.length === 0 || messageIds.includes(m.id)) {
                            m.readAt = readAt;
                        }
                    });
                }
            });

            this.socket.on('userTyping', ({ userId, username, isTyping, tradeOfferId }: { userId: string; username: string; isTyping: boolean; tradeOfferId?: string }) => {
                if (tradeOfferId && this.activeRoom && this.activeRoom.tradeOfferId === tradeOfferId) {
                    if (isTyping) {
                        this.typingUsers[userId] = { username, expires: Date.now() + 5000 };
                    } else {
                        delete this.typingUsers[userId];
                    }
                }
            });

            this.socket.on('roomUpdated', ({ roomId, lastMessage, updatedAt, hasRiskyContent }: { roomId: string; lastMessage: AdminMessage; updatedAt: string; hasRiskyContent: boolean }) => {
                const roomIndex = this.rooms.findIndex(r => r.id === roomId);
                if (roomIndex !== -1) {
                    const room = this.rooms[roomIndex];
                    room.lastMessage = lastMessage;
                    room.updatedAt = updatedAt;
                    if (room.messageCount !== undefined) {
                        room.messageCount++;
                    } else {
                        room.messageCount = 1;
                    }
                    room.isHot = true;
                    if (hasRiskyContent) {
                        room.hasRiskyContent = true;
                    }
                    this.rooms.splice(roomIndex, 1);
                    this.rooms.unshift(room);
                } else if (!this.searchQuery && this.pagination.page === 1) {
                    this.fetchRooms(1);
                }
            });

            this.socket.on('chatFrozen', ({ roomId, status }: { roomId: string; status: string }) => {
                if (this.activeRoomId === roomId) {
                    this.isFrozen = true;
                }
                const room = this.rooms.find(r => r.id === roomId);
                if (room && room.tradeOffer) room.tradeOffer.status = status || 'disputed';
            });

            this.socket.on('chatUnfrozen', ({ roomId, status }: { roomId: string; status: string }) => {
                if (this.activeRoomId === roomId) {
                    this.isFrozen = false;
                }
                const room = this.rooms.find(r => r.id === roomId);
                if (room && room.tradeOffer) room.tradeOffer.status = status || 'pending';
            });

            this.socket.on('connect_error', (err: Error) => {
                console.error('[AdminChatStore] Connection error:', err.message);
            });
        },

        disconnectSocket() {
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
                this.isConnected = false;
                this.messages = [];
                this.activeRoom = null;
                this.activeRoomId = null;
            }
        },

        // ─── REST API: Oda Listesi ───
        async fetchRooms(page = 1) {
            this.roomsLoading = true;
            try {
                const adminChatService = useAdminChatService();
                const params = {
                    page: String(page),
                    limit: String(this.pagination.limit),
                    ...(this.searchQuery && { search: this.searchQuery }),
                    ...(this.filterRisky && { hasRiskyContent: 'true' }),
                    ...(this.sortByRisk && { sortByRisk: 'true' }),
                };
                const response = await adminChatService.getRooms(params);

                if (response.success) {
                    this.rooms = (response.rooms as AdminChatRoom[]) || [];
                    if (response.pagination) {
                        this.pagination = response.pagination;
                    }
                }
            } catch (err) {
                console.error('[AdminChatStore] fetchRooms error:', err);
            } finally {
                this.roomsLoading = false;
            }
        },

        // ─── Ghost Room: Katıl (Lazy Join) ───
        async joinGhostRoom(room: AdminChatRoom) {
            if (!this.socket) return;

            // Önceki odadan ayrıl
            if (this.activeRoom && this.activeRoom.tradeOfferId !== room.tradeOfferId) {
                this.socket.emit('leaveGhostRoom', { tradeOfferId: this.activeRoom.tradeOfferId });
            }

            this.activeRoom = room;
            this.activeRoomId = room.id;
            this.messages = [];
            this.messagesLoading = true;
            this.isFrozen = room.tradeOffer?.status === 'disputed';

            return new Promise<void>((resolve, reject) => {
                this.socket?.emit('joinGhostRoom', { tradeOfferId: room.tradeOfferId }, (response: { status: string; data?: AdminMessage[]; message?: string }) => {
                    this.messagesLoading = false;
                    if (response.status === 'ok') {
                        this.messages = response.data || [];
                        if (!this.rooms.some(r => r.id === room.id)) {
                            this.rooms.unshift(room);
                        }
                        resolve();
                    } else {
                        console.error('[AdminChatStore] joinGhostRoom error:', response.message);
                        reject(response.message);
                    }
                });
            });
        },

        // ─── Ghost Room: Daha Fazla Mesaj Yükle ───
        async loadMoreMessages() {
            if (!this.activeRoomId || this.messagesLoading) return;

            const nextPage = Math.floor(this.messages.length / 50) + 1;

            try {
                const adminChatService = useAdminChatService();
                const response = await adminChatService.getMessages(this.activeRoomId, nextPage, 50);

                if (response.success && response.messages && response.messages.length > 0) {
                    const newMessages = (response.messages as AdminMessage[]).filter(
                        (nm) => !this.messages.some(m => m.id === nm.id)
                    );
                    this.messages = [...newMessages, ...this.messages];
                    return newMessages.length;
                }
                return 0;
            } catch (err) {
                console.error('[AdminChatStore] loadMoreMessages error:', err);
                return 0;
            }
        },

        // ─── Ghost Room: Ayrıl ───
        leaveGhostRoom() {
            if (!this.socket || !this.activeRoom) return;
            this.socket.emit('leaveGhostRoom', { tradeOfferId: this.activeRoom.tradeOfferId });
            this.activeRoom = null;
            this.activeRoomId = null;
            this.messages = [];
            this.isFrozen = false;
        },

        // ─── Sistem Mesajı Gönder ───
        async sendSystemMessage(content: string, type: 'SYSTEM' | 'SYSTEM_WARNING' = 'SYSTEM') {
            if (!this.socket || !this.activeRoom) return;

            return new Promise<void>((resolve, reject) => {
                this.socket?.emit('sendSystemMessage', {
                    tradeOfferId: this.activeRoom!.tradeOfferId,
                    content,
                    type,
                }, (response: { status: string; message?: string }) => {
                    if (response.status === 'ok') {
                        resolve();
                    } else {
                        reject(response.message);
                    }
                });
            });
        },

        // ─── REST API: Audit Loglar ───
        async fetchAuditLogs(page = 1) {
            this.auditLogsLoading = true;
            try {
                const adminChatService = useAdminChatService();
                const response = await adminChatService.getAuditLogs(page, this.auditLogsPagination.limit);

                if (response.success) {
                    this.auditLogs = (response.logs as AdminAuditLog[]) || [];
                    if (response.pagination) {
                        this.auditLogsPagination = response.pagination;
                    }
                }
            } catch (err) {
                console.error('[AdminChatStore] fetchAuditLogs error:', err);
            } finally {
                this.auditLogsLoading = false;
            }
        },

        async freezeRoom(roomId: string, reason: string, note: string) {
            try {
                const adminChatService = useAdminChatService();
                const response = await adminChatService.freezeRoom(roomId, { reason, note });

                if (response.success) {
                    this.isFrozen = true;
                    const room = this.rooms.find(r => r.id === roomId);
                    if (room && room.tradeOffer) room.tradeOffer.status = 'disputed';
                }

                return response;
            } catch (err) {
                console.error('[AdminChatStore] freezeRoom error:', err);
                throw err;
            }
        },

        async unfreezeRoom(roomId: string, note: string) {
            try {
                const adminChatService = useAdminChatService();
                const response = await adminChatService.unfreezeRoom(roomId, { note });

                if (response.success) {
                    this.isFrozen = false;
                    const room = this.rooms.find(r => r.id === roomId);
                    if (room && room.tradeOffer) room.tradeOffer.status = 'pending';
                }

                return response;
            } catch (err) {
                console.error('[AdminChatStore] unfreezeRoom error:', err);
                throw err;
            }
        },

        // ─── REST API: Uyarı Gönder ───
        async sendWarning(roomId: string, reason: string, note: string) {
            try {
                const adminChatService = useAdminChatService();
                const response = await adminChatService.sendWarning(roomId, { reason, note });
                return response;
            } catch (err) {
                console.error('[AdminChatStore] sendWarning error:', err);
                throw err;
            }
        },
    },
});
