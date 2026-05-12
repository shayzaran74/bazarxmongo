import { computed, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { navigateTo } from '#imports'
import { useProfileAccount } from './useProfileAccount'
import { useProfileLoyalty } from './useProfileLoyalty'
import { useProfileAddress } from './useProfileAddress'
import { useProfileSecurity } from './useProfileSecurity'
import { useWallet } from './useWallet'
import { 
  UserIcon, SparklesIcon, MapPinIcon, WalletIcon, 
  LockClosedIcon, ChartBarIcon, AdjustmentsHorizontalIcon 
} from '@heroicons/vue/24/outline'

export const useProfile = () => {
  const authStore = useAuthStore()
  const route = useRoute()
  const activeTab = ref(route.query.tab?.toString() || 'profile')
  const showMobileMenu = ref(false)

  const account = useProfileAccount()
  const loyalty = useProfileLoyalty()
  const addresses = useProfileAddress()
  const security = useProfileSecurity()
  const wallet = useWallet()

  const tabs = [
    { id: 'profile', name: 'Profil Bilgileri', icon: UserIcon },
    { id: 'loyalty', name: 'Sadakat & XP', icon: SparklesIcon },
    { id: 'addresses', name: 'Adreslerim', icon: MapPinIcon },
    { id: 'wallet', name: 'Cüzdan & İşlemler', icon: WalletIcon },
    { id: 'security', name: 'Güvenlik', icon: LockClosedIcon },
    { id: 'activity', name: 'Aktivite', icon: ChartBarIcon },
    { id: 'preferences', name: 'Tercihler', icon: AdjustmentsHorizontalIcon }
  ]

  const activeTabData = computed(() => 
    tabs.find(t => t.id === activeTab.value) || tabs[0]
  )

  const handleTabClick = (tabId: string) => {
    activeTab.value = tabId
    showMobileMenu.value = false
  }

  const handleLogout = async () => {
    await authStore.logout()
    navigateTo('/auth/login')
  }

  // Formatting helpers
  const formatDate = (date: string | Date) => {
    if (!date) return ''
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date))
  }

  const formatPriceNum = (val: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(val || 0)
  }

  const getInitials = (name: string) => {
    if (!name) return ''
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const transactions = ref([])
  const txLoading = ref(false)

  const loadWalletData = async () => {
    txLoading.value = true
    try {
      await wallet.fetchWallet()
      const res = await wallet.fetchTransactions({ limit: 10 })
      if (res.success && res.data) {
        transactions.value = res.data as any
      }
    } finally {
      txLoading.value = false
    }
  }

  return {
    // Auth
    user: computed(() => authStore.user),
    handleLogout,

    // UI State
    activeTab,
    tabs,
    activeTabData,
    showMobileMenu,
    handleTabClick,

    // Account
    ...account,
    getInitials,

    // Loyalty & Stats
    ...loyalty,

    // Addresses
    ...addresses,
    addressStore: addresses.addressStore,

    // Wallet
    wallet: wallet.wallet,
    transactions,
    txLoading,
    loadWalletData,

    // Security & Preferences
    ...security,

    // Helpers
    formatDate,
    formatPriceNum
  }
}
