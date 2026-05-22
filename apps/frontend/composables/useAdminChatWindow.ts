import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useAdminChatStore } from '~/stores/adminChat'
import type { AdminMessage, AdminChatRoom } from '@barterborsa/shared-types'

export const useAdminChatWindow = (props: { messages: AdminMessage[]; room: { userAId?: string } }, emit: { (e: 'system-message', content: string): void; (e: 'warning', data: { reason: string; note: string }): void; (e: 'freeze', data: { reason: string; note: string }): void; (e: 'unfreeze', data: { note: string }): void }) => {
  const store = useAdminChatStore()
  const scrollContainer = ref<HTMLElement | null>(null)

  // -- Modals & Actions --
  const showActionModal = ref(false)
  const actionType = ref<'system' | 'warning' | 'freeze' | 'unfreeze' | null>(null)
  const actionData = ref({
    reason: '',
    note: '',
    content: ''
  })

  // -- Pagination --
  const loadingMore = ref(false)
  const hasMoreMessages = ref(true)

  // -- Typing Status --
  const typingIndicator = computed(() => {
    const users = store.typingUsers
    const typingList = Object.values(users)
      .filter((data: { expires: number }) => data.expires > Date.now())
      .map((data: { username: string }) => data.username)

    if (typingList.length === 0) return null
    if (typingList.length === 1) return `${typingList[0]} YAZIYOR...`
    return `${typingList.length} KİŞİ YAZIYOR...`
  })

  // -- Scroll Logic --
  const scrollToBottom = (force = false) => {
    if (!scrollContainer.value) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150
    if (isAtBottom || force) {
      nextTick(() => {
        scrollContainer.value?.scrollTo({
          top: scrollContainer.value.scrollHeight,
          behavior: 'smooth'
        })
      })
    }
  }

  // -- Message Utils --
  const shouldShowDateSeparator = (msg: AdminMessage, index: number) => {
    if (index === 0) return true
    const prevMsg = props.messages[index - 1]
    return new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString()
  }

  const formatDateLabel = (isoDate: string) => {
    const date = new Date(isoDate)
    const now = new Date()
    if (date.toDateString() === now.toDateString()) return 'BUGÜN'
    const yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) return 'DÜN'
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }).toUpperCase()
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }

  const isSystemMessage = (msg: AdminMessage) => msg.type === 'SYSTEM' || msg.type === 'SYSTEM_WARNING'
  const isFromAdmin = (msg: AdminMessage) => msg.metadata?.fromAdmin === true

  const getMessageStyle = (msg: AdminMessage) => {
    if (msg.type === 'SYSTEM_WARNING') return 'bg-red-500/10 border-red-500/20 text-red-500'
    if (msg.type === 'SYSTEM') return 'bg-amber-500/10 border-amber-500/20 text-amber-500'
    if (msg.senderId === props.room.userAId) return 'bg-blue-500/10 border-blue-500/20 text-blue-400'
    return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
  }

  const getSenderLabel = (msg: AdminMessage) => {
    if (isFromAdmin(msg)) return '🛡️ BAZARX'
    if (msg.type === 'SYSTEM' || msg.type === 'SYSTEM_WARNING') return '⚙️ SİSTEM'
    if (msg.sender?.name) return msg.sender.name.toUpperCase()
    return 'BİLİNMEYEN'
  }

  // -- Risky Keyword Highlighting --
  const RISKY_PATTERNS = [
    /\d{10,11}/g,
    /[\w.-]+@[\w.-]+\.\w+/g,
    /whatsapp|telegram|instagram|banka|iban|hesap\s*no/gi
  ]

  const highlightRisky = (text: string) => {
    let result = text
    RISKY_PATTERNS.forEach(pattern => {
      result = result.replace(pattern, (match) => `<mark class="bg-red-500/20 text-red-500 px-1 rounded font-black">${match}</mark>`)
    })
    return result
  }

  // -- Moderation Actions --
  const openAction = (type: 'system' | 'warning' | 'freeze' | 'unfreeze') => {
    actionType.value = type
    actionData.value = { reason: '', note: '', content: '' }
    showActionModal.value = true
  }

  const submitAction = () => {
    if (actionType.value === 'system') {
      if (actionData.value.content.trim()) emit('system-message', actionData.value.content.trim())
    } else if (actionType.value === 'warning' || actionType.value === 'freeze') {
      if (actionData.value.reason) emit(actionType.value, { reason: actionData.value.reason, note: actionData.value.note })
    } else if (actionType.value === 'unfreeze') {
      emit('unfreeze', { note: actionData.value.note })
    }
    showActionModal.value = false
  }

  const isActionValid = computed(() => {
    if (actionType.value === 'system') return !!actionData.value.content?.trim()
    if (actionType.value === 'warning' || actionType.value === 'freeze') return !!actionData.value.reason?.trim()
    if (actionType.value === 'unfreeze') return true
    return false
  })

  // -- Pagination Logic --
  const loadMore = async () => {
    if (loadingMore.value || !hasMoreMessages.value) return
    loadingMore.value = true
    const oldHeight = scrollContainer.value?.scrollHeight || 0
    const count = await store.loadMoreMessages()
    if (count === 0) {
      hasMoreMessages.value = false
    } else {
      nextTick(() => {
        if (scrollContainer.value) {
          scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight - oldHeight
        }
      })
    }
    loadingMore.value = false
  }

  watch(() => props.messages, () => scrollToBottom(), { deep: true })
  watch(() => props.room.id, () => { hasMoreMessages.value = true })
  onMounted(() => scrollToBottom(true))

  return {
    scrollContainer, showActionModal, actionType, actionData, loadingMore, hasMoreMessages,
    typingIndicator, shouldShowDateSeparator, formatDateLabel, formatTime,
    isSystemMessage, isFromAdmin, getMessageStyle, getSenderLabel, highlightRisky,
    openAction, submitAction, isActionValid, loadMore
  }
}
