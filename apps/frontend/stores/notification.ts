// stores/notification.ts
import { defineStore } from 'pinia'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  link?: string
  isRead: boolean
  metadata?: Record<string, unknown>
  createdAt: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  hasMore: boolean
  page: number
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    hasMore: true,
    page: 1,
  }),

  getters: {
    unread: (state) => state.notifications.filter(n => !n.isRead),
    recent: (state) => state.notifications.slice(0, 10),
  },

  actions: {
    async fetchNotifications(reset = false) {
      if (reset) {
        this.page = 1
        this.notifications = []
        this.hasMore = true
      }

      if (!this.hasMore) return

      this.loading = true
      try {
        const { $api } = useApi()
        const res: any = await $api('/api/notifications', {
          query: { page: this.page, limit: 20 }
        })

        // API standard: { success: boolean, data: [], meta: {} }
        const items = (res.data || []) as Notification[]
        this.notifications = reset ? items : [...this.notifications, ...items]
        this.hasMore = items.length === 20
        if (items.length > 0) this.page++
      } catch { /* ignore */ } finally {
        this.loading = false
      }
    },

    async fetchUnreadCount() {
      try {
        const { $api } = useApi()
        const res: any = await $api('/api/notifications/unread-count')
        this.unreadCount = res.data || 0
      } catch { /* ignore */ }
    },

    async markAsRead(id: string) {
      const notif = this.notifications.find(n => n.id === id)
      if (!notif || notif.isRead) return

      notif.isRead = true
      this.unreadCount = Math.max(0, this.unreadCount - 1)

      try {
        const { $api } = useApi()
        await $api(`/api/notifications/${id}/read`, { method: 'POST' })
      } catch {
        // Rollback
        notif.isRead = false
        this.unreadCount++
      }
    },

    async markAllAsRead() {
      const unreadIds = this.notifications
        .filter(n => !n.isRead)
        .map(n => n.id)

      if (!unreadIds.length) return

      this.notifications.forEach(n => { n.isRead = true })
      this.unreadCount = 0

      try {
        const { $api } = useApi()
        await $api('/api/notifications/read-all', { method: 'POST' })
      } catch {
        // Rollback
        await this.fetchNotifications(true)
        await this.fetchUnreadCount()
      }
    },

    // Socket.io üzerinden gelen anlık bildirimi ekle
    addRealtime(notification: Notification) {
      this.notifications.unshift(notification)
      if (!notification.isRead) {
        this.unreadCount++
      }
    },
  }
})
