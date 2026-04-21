import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAddressStore } from '~/stores/address'
import { useWallet } from '~/composables/useWallet'
import { useI18n, useRuntimeConfig, useNuxtApp, navigateTo } from '#imports'
import {
  UserIcon, ShieldCheckIcon, ClockIcon, CogIcon,
  ShoppingBagIcon, StarIcon, WalletIcon, MapPinIcon
} from '@heroicons/vue/24/outline'

// Sub-composables
import { useProfileAccount } from '~/composables/useProfileAccount'
import { useProfileSecurity } from '~/composables/useProfileSecurity'
import { useProfileLoyalty } from '~/composables/useProfileLoyalty'
import { useProfileAddress } from '~/composables/useProfileAddress'

export const useProfile = () => {
  const authStore = useAuthStore()
  const addressStore = useAddressStore()
  const { t, locale } = useI18n()
  const { wallet, fetchWallet: fetchWalletData, fetchTransactions } = useWallet()

  // Tab Management
  const activeTab = ref('profile')
  const showMobileMenu = ref(false)
  
  const tabs = computed(() => [
    { id: 'profile', name: t('nav.profile'), icon: UserIcon },
    { id: 'loyalty', name: t('profile.loyalty'), icon: StarIcon },
    { id: 'addresses', name: t('profile.myAddresses'), icon: MapPinIcon },
    { id: 'wallet', name: t('profile.myWallet'), icon: WalletIcon },
    { id: 'orders', name: t('profile.myOrders'), icon: ShoppingBagIcon },
    { id: 'security', name: t('profile.security'), icon: ShieldCheckIcon },
    { id: 'activity', name: t('profile.activity'), icon: ClockIcon },
    { id: 'preferences', name: t('profile.preferences'), icon: CogIcon }
  ])

  const activeTabData = computed(() => tabs.value.find(t => t.id === activeTab.value))

  const handleTabClick = (tabId: string) => {
    if (tabId === 'orders') navigateTo('/orders')
    else activeTab.value = tabId
    showMobileMenu.value = false
  }

  // User State
  const user = computed(() => authStore.user)

  // Sub-composable initialization
  const account = useProfileAccount()
  const security = useProfileSecurity()
  const loyalty = useProfileLoyalty()
  const address = useProfileAddress()

  // Wallet Actions (Bridge)
  const transactions = ref<any[]>([])
  const txLoading = ref(false)

  const loadWalletData = async () => {
    txLoading.value = true
    try {
      await fetchWalletData()
      const txRes = await fetchTransactions({ limit: 5 })
      if (txRes.success && 'data' in txRes) transactions.value = txRes.data as any[]
    } catch (error) {
      console.error('Error loading wallet data:', error)
    } finally {
      txLoading.value = false
    }
  }

  // Helpers
  const getInitials = (text: string | null | undefined) => {
    if (!text) return '??'
    return text.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t('profile.unknown')
    return new Date(dateString).toLocaleDateString(locale.value === 'tr' ? 'tr-TR' : 'en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    })
  }

  const formatPriceNum = (price: number) => {
    return new Intl.NumberFormat(locale.value === 'tr' ? 'tr-TR' : 'en-US', { 
      style: 'currency', currency: 'TRY' 
    }).format(price)
  }

  const handleLogout = () => {
    authStore.logout()
    navigateTo('/auth/login')
  }

  return {
    // State & Base
    user, activeTab, tabs, activeTabData, showMobileMenu, wallet, addressStore,
    transactions, txLoading,
    
    // Sub-composable exports
    ...account,
    ...security,
    ...loyalty,
    ...address,

    // Actions & Helpers
    handleTabClick, loadWalletData, handleLogout,
    getInitials, formatDate, formatPriceNum
  }
}
