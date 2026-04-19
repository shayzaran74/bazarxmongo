import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { userService } from '~/services/userService'
import type { Address, LoyaltyStatus, LoyaltyHistoryItem, UserProfileStats, WalletTransaction, UserProfileUpdate } from '@barterborsa/shared-types'
import { useAddressStore } from '~/stores/address'
import { useWallet } from '~/composables/useWallet'
import {
  UserIcon, ShieldCheckIcon, ClockIcon, CogIcon,
  ShoppingBagIcon, StarIcon, WalletIcon, MapPinIcon
} from '@heroicons/vue/24/outline'

export const useProfile = () => {
  const authStore = useAuthStore()
  const addressStore = useAddressStore()
  const { t, locale } = useI18n()
  const config = useRuntimeConfig()
  const { $toast: toast } = useNuxtApp()
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
  const profileLoading = ref(false)
  const profileForm = ref<UserProfileUpdate>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    district: '',
    neighborhood: ''
  })

  // Watch for authStore user changes to update profileForm
  watch(() => authStore.user, (user) => {
    if (user) {
      profileForm.value = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: (user as any).phoneNumber || '',
        district: user.district || '',
        neighborhood: user.regionName || ''
      }
    }
  }, { immediate: true })

  // Avatar Management
  const showAvatarModal = ref(false)
  const avatarUploading = ref(false)
  const avatarPreview = ref<string | null>(null)
  const avatarFile = ref<File | null>(null)

  const getAvatarUrl = (avatar: string | null) => {
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    return `${config.public.apiBase}${avatar}`
  }

  const handleAvatarChange = (file: File) => {
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
    showAvatarModal.value = true
  }

  const uploadAvatar = async () => {
    if (!avatarFile.value) return
    avatarUploading.value = true
    try {
      const formData = new FormData()
      formData.append('file', avatarFile.value)

      const uploadRes = await userService.uploadAvatar(formData)

      if (uploadRes.success && uploadRes.data?.url) {
        const profileRes = await userService.updateProfile({ avatarUrl: uploadRes.data.url } as any)

        if (profileRes.success && authStore.user) {
          authStore.user.avatar = uploadRes.data.url
          toast.success(t('profile.profileUpdatedSuccess'))
          showAvatarModal.value = false
        }
      }
    } catch (error) {
      toast.error(t('profile.profileUpdateError'))
    } finally {
      avatarUploading.value = false
    }
  }

  // Profile Update
  const updateProfile = async () => {
    profileLoading.value = true
    try {
      const res = await userService.updateProfile(profileForm.value)
      if (res.success && res.data) {
        // Full update from backend response
        authStore.user = res.data.user
        toast.success(t('profile.profileUpdatedSuccess'))
      }
    }
 catch (error) {
      toast.error(t('profile.profileUpdateError'))
    } finally {
      profileLoading.value = false
    }
  }

  // Loyalty State
  const loyaltyStatus = ref<LoyaltyStatus | null>(null)
  const loyaltyHistory = ref<LoyaltyHistoryItem[]>([])
  const loyaltyHistoryLoading = ref(false)
  const userTierData = ref<unknown>(null)

  const loyaltyStatusMapped = computed(() => {
    if (!loyaltyStatus.value) return null
    const d = loyaltyStatus.value
    return {
      tier: d.rank || 'Bronze',
      xp: d.xp || 0,
      nextTier: 'Silver', // Placeholder logic 
      nextTierXP: 1000,
      progress: Math.min((d.xp || 0) / 1000 * 100, 100),
      message: 'Keep going!'
    }
  })

  const fetchLoyaltyData = async () => {
    loyaltyHistoryLoading.value = true
    try {
      const [statusRes, historyRes, tierRes] = await Promise.all([
        userService.fetchLoyaltyStatus(),
        userService.fetchLoyaltyHistory(),
        userService.fetchUserTier()
      ])
      if (statusRes.success && statusRes.data) loyaltyStatus.value = statusRes.data
      if (historyRes.success && historyRes.data) loyaltyHistory.value = historyRes.data
      if (tierRes.success && tierRes.data) userTierData.value = tierRes.data
    } catch (error) {
      console.error('Error fetching loyalty data:', error)
    } finally {
      loyaltyHistoryLoading.value = false
    }
  }

  // Wallet State
  const transactions = ref<WalletTransaction[]>([])
  const txLoading = ref(false)

  const loadWalletData = async () => {
    txLoading.value = true
    try {
      await fetchWalletData()
      const txRes = await fetchTransactions({ limit: 5 })
      if (txRes.success && 'data' in txRes && Array.isArray(txRes.data)) {
        transactions.value = txRes.data
      }
    } catch (error) {
      console.error('Error loading wallet data:', error)
    } finally {
      txLoading.value = false
    }
  }

  // Security State
  const passwordLoading = ref(false)
  const passwordForm = ref({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  })

  const changePassword = async () => {
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      toast.error(t('profile.passwordsNotMatch') || 'Şifreler eşleşmiyor')
      return
    }
    passwordLoading.value = true
    try {
      const data = await userService.changePassword({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      })
      if (data.success) {
        toast.success(t('profile.passwordChangedSuccess'))
        passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
      }
    } catch (error) {
      toast.error(t('profile.passwordChangedError'))
    } finally {
      passwordLoading.value = false
    }
  }

  // Activity & Stats
  const userStats = ref<UserProfileStats | null>(null)
  const fetchUserStats = async () => {
    try {
      const data = await userService.fetchUserStats()
      if (data.success && data.data) userStats.value = data.data.stats
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Preferences
  const preferences = ref({ 
    emailNotifications: true, 
    smsNotifications: true 
  })
  const savePreferences = () => {
    toast.success(t('profile.profileUpdatedSuccess'))
  }

  // Addresses
  const showAddressModal = ref(false)
  const isEditingAddress = ref(false)
  const addressForm = ref<Address>({ 
    id: '', 
    userId: '',
    name: '', 
    city: '', 
    district: '', 
    address: '',
    isDefault: false 
  })

  const openAddressModal = (address: Address | null = null) => {
    if (address) {
      isEditingAddress.value = true
      addressForm.value = { ...address }
    } else {
      isEditingAddress.value = false
      addressForm.value = { 
        id: '', 
        userId: '',
        name: '', 
        city: '', 
        district: '', 
        address: '',
        isDefault: false 
      }
    }
    showAddressModal.value = true
  }

  const saveAddress = async () => {
    const res = isEditingAddress.value
      ? await addressStore.updateAddress(String(addressForm.value.id), addressForm.value as unknown as Parameters<typeof addressStore.updateAddress>[1])
      : await addressStore.addAddress(addressForm.value as unknown as Parameters<typeof addressStore.addAddress>[0])
    
    if (res?.success) {
      toast.success(isEditingAddress.value ? t('profile.addressUpdatedSuccess') : t('profile.addressAddedSuccess'))
      showAddressModal.value = false
    } else {
      toast.error(res?.error || t('common.error'))
    }
  }

  const deleteAddress = async (id: string) => {
    if (!confirm(t('profile.deleteConfirm'))) return
    const res = await addressStore.deleteAddress(id)
    if (res?.success) toast.success(t('profile.addressDeletedSuccess'))
  }

  // Helpers
  const getInitials = (text: string | null | undefined) => {
    if (!text) return '??'
    return text.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t('profile.unknown')
    return new Date(dateString).toLocaleDateString(locale.value === 'tr' ? 'tr-TR' : 'en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatPriceNum = (price: number) => {
    return new Intl.NumberFormat(locale.value === 'tr' ? 'tr-TR' : 'en-US', { 
      style: 'currency', 
      currency: 'TRY' 
    }).format(price)
  }

  const handleLogout = () => {
    authStore.logout()
    navigateTo('/login')
  }

  return {
    // State
    user,
    activeTab,
    tabs,
    activeTabData,
    showMobileMenu,
    profileLoading,
    profileForm,
    showAvatarModal,
    avatarUploading,
    avatarPreview,
    loyaltyStatusMapped,
    loyaltyHistory,
    loyaltyHistoryLoading,
    userTierData,
    wallet,
    transactions,
    txLoading,
    passwordLoading,
    passwordForm,
    userStats,
    preferences,
    showAddressModal,
    isEditingAddress,
    addressForm,
    addressStore,

    // Actions
    handleTabClick,
    handleAvatarChange,
    uploadAvatar,
    updateProfile,
    fetchLoyaltyData,
    loadWalletData,
    changePassword,
    fetchUserStats,
    savePreferences,
    openAddressModal,
    saveAddress,
    deleteAddress,
    handleLogout,

    // Helpers
    getAvatarUrl,
    getInitials,
    formatDate,
    formatPriceNum
  }
}
