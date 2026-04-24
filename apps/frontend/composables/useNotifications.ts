// composables/useNotifications.ts
import { useNotificationStore } from '~/stores/notification'
import { io, Socket } from 'socket.io-client'
import type { Notification } from '~/stores/notification'

export const useNotifications = () => {
  const notificationStore = useNotificationStore()
  const authStore = useAuthStore()
  const { $toast } = useNuxtApp() as any

  const notifications = computed(() => notificationStore.notifications)
  const unreadCount = computed(() => notificationStore.unreadCount)
  const loading = computed(() => notificationStore.loading)
  const hasMore = computed(() => notificationStore.hasMore)

  // Dropdown state
  const showDropdown = ref(false)

  // Socket.io bağlantısı (sadece notification için lightweight)
  let notifSocket: Socket | null = null

  const connectSocket = () => {
    if (!authStore.isLoggedIn || notifSocket?.connected) return

    const config = useRuntimeConfig()

    const socketBase = (config.public.socketUrl as string) ||
      (process.client ? window.location.origin : config.public.apiBase as string)

    notifSocket = io(socketBase, {
      path: '/socket.io/',
      withCredentials: true,
      transports: ['polling', 'websocket'],
      auth: { token: authStore.token || useCookie('access_token').value },
      reconnection: true,
      reconnectionAttempts: 5,
    })

    notifSocket.on('notification', (data: Notification) => {
      notificationStore.addRealtime(data)
      // Toast göster
      $toast.info(data.title || data.message, {
        onClick: () => {
          if (data.link) navigateTo(data.link)
        }
      })
    })

    notifSocket.on('connect_error', () => {
      // Sessizce ignore — polling fallback çalışır
    })
  }

  const disconnectSocket = () => {
    if (notifSocket) {
      notifSocket.disconnect()
      notifSocket = null
    }
  }

  const init = async () => {
    if (!authStore.isLoggedIn) return
    await Promise.all([
      notificationStore.fetchNotifications(true),
      notificationStore.fetchUnreadCount(),
    ])
    connectSocket()
  }

  const loadMore = () => notificationStore.fetchNotifications()
  const markAsRead = (id: string) => notificationStore.markAsRead(id)
  const markAllAsRead = () => notificationStore.markAllAsRead()

  const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value
    if (showDropdown.value) {
      // Açıldığında tüm okunmamışları okundu say
      notificationStore.markAllAsRead()
    }
  }

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Az önce'
    if (minutes < 60) return `${minutes} dakika önce`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} saat önce`
    return new Date(iso).toLocaleDateString('tr-TR')
  }

  onMounted(() => {
    if (process.client) {
      init()
    }
  })
  onUnmounted(disconnectSocket)

  return {
    notifications, unreadCount, loading, hasMore,
    showDropdown,
    init, loadMore, markAsRead, markAllAsRead,
    toggleDropdown, formatTime,
  }
}
