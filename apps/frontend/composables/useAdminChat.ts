export const useAdminChat = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const roomsLoading = ref(false)
  const messagesLoading = ref(false)
  const auditLogsLoading = ref(false)
  
  const rooms = ref<any[]>([])
  const activeRoom = ref<any>(null)
  const activeRoomId = ref<string | null>(null)
  const messages = ref<any[]>([])
  const isConnected = ref(true)
  const filterRisky = ref(false)
  const sortByRisk = ref(false)
  const isFrozen = ref(false)
  
  const auditLogs = ref<any[]>([])
  const pagination = reactive({ page: 1, total: 0, limit: 10 })
  const auditLogsPagination = reactive({ page: 1, total: 0, limit: 10 })

  const filteredRooms = computed(() => {
    let list = rooms.value
    if (filterRisky.value) {
      list = list.filter((r: any) => (r.riskScore || 0) > 50)
    }
    if (sortByRisk.value) {
      list = [...list].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
    }
    return list
  })

  const fetchRooms = async (page = 1) => {
    roomsLoading.value = true
    pagination.page = page
    try {
      const res = await $api<any>('/api/admin/chat/rooms', {
        query: { page, limit: pagination.limit }
      })
      const response = res as any
      rooms.value = response.data || []
      pagination.total = response.total || rooms.value.length
    } catch { /* ignore */ } finally {
      roomsLoading.value = false
    }
  }

  const fetchAuditLogs = async (page = 1) => {
    auditLogsLoading.value = true
    auditLogsPagination.page = page
    try {
      const res = await $api<any>('/api/admin/chat/audit-logs', {
        query: { page, limit: auditLogsPagination.limit }
      })
      auditLogs.value = res.data || []
    } catch { /* ignore */ } finally {
      auditLogsLoading.value = false
    }
  }

  const joinRoom = async (room: any) => {
    activeRoom.value = room
    activeRoomId.value = room.id
    messagesLoading.value = true
    try {
      const res = await $api<any>(`/api/admin/chat/rooms/${room.id}/messages`)
      messages.value = res.data || []
      isFrozen.value = !!room.isFrozen
    } catch { /* ignore */ } finally {
      messagesLoading.value = false
    }
  }

  const leaveRoom = () => {
    activeRoom.value = null
    activeRoomId.value = null
    messages.value = []
  }

  const setSearch = (q: string) => {
    // Implement socket based search or local search
    console.log('Searching for:', q)
  }

  const toggleRiskyFilter = () => (filterRisky.value = !filterRisky.value)
  const toggleSortByRisk = () => (sortByRisk.value = !sortByRisk.value)

  const sendSystemMessage = async (content: string) => {
    if (!activeRoomId.value) return false
    try {
      await $api(`/api/admin/chat/rooms/${activeRoomId.value}/system-message`, {
        method: 'POST', body: { content }
      })
      return true
    } catch { return false }
  }

  const sendWarning = async (reason: string, note?: string) => {
    if (!activeRoomId.value) return false
    try {
      await $api(`/api/admin/chat/rooms/${activeRoomId.value}/warning`, {
        method: 'POST', body: { reason, note }
      })
      return true
    } catch { return false }
  }

  const freezeRoom = async (reason: string, note?: string) => {
    if (!activeRoomId.value) return false
    try {
      await $api(`/api/admin/chat/rooms/${activeRoomId.value}/freeze`, {
        method: 'POST', body: { reason, note }
      })
      isFrozen.value = true
      return true
    } catch { return false }
  }

  const unfreezeRoom = async (note?: string) => {
    if (!activeRoomId.value) return false
    try {
      await $api(`/api/admin/chat/rooms/${activeRoomId.value}/unfreeze`, {
        method: 'POST', body: { note }
      })
      isFrozen.value = false
      return true
    } catch { return false }
  }

  const formatTime = (date: string) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  const initSocket = () => { console.log('Socket initialized') }
  const destroySocket = () => { console.log('Socket destroyed') }

  return {
    roomsLoading, pagination, activeRoom, activeRoomId, messages, messagesLoading,
    isConnected, filterRisky, sortByRisk, isFrozen, filteredRooms,
    auditLogs, auditLogsLoading, auditLogsPagination,
    initSocket, destroySocket, fetchRooms, fetchAuditLogs, joinRoom, leaveRoom, setSearch,
    toggleRiskyFilter, toggleSortByRisk, sendSystemMessage, sendWarning, freezeRoom, unfreezeRoom,
    formatTime
  }
}
