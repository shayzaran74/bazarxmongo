import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  socket: Socket | null;
  init: (userId: string) => void;
  disconnect: () => void;
  clearUnread: () => void;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  socket: null,

  init: (userId: string) => {
    if (get().socket?.connected) return;

    console.log('Connecting to notification socket for user:', userId);
    const socket = io(SOCKET_URL, {
      query: { userId },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Notification socket connected');
    });

    socket.on('notification', (data: Notification) => {
      console.log('New notification received:', data);
      const { notifications, addNotification } = get();
      if (notifications.some(n => n.id === data.id)) return;
      addNotification(data);
    });

    socket.on('disconnect', () => {
      console.log('Notification socket disconnected');
    });

    set({ socket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null });
  },

  clearUnread: () => set({ unreadCount: 0 }),

  addNotification: (notification) => {
    set((state) => {
      if (state.notifications.some(n => n.id === notification.id)) return state;
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    });
  },
}));
