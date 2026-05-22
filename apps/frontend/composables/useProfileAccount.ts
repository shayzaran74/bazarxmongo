import { ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { userService } from '~/services/userService'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'

export const useProfileAccount = () => {
  const authStore = useAuthStore()
  const { t } = useI18n()
  const toast = useToast()

  const profileLoading = ref(false)
  const profileForm = ref<any>({
    firstName: '', lastName: '', phoneNumber: '', city: '', district: '', gender: '',
    companyName: '', taxNumber: '', taxOffice: ''
  })

  const showAvatarModal = ref(false)
  const avatarUploading = ref(false)
  const avatarPreview = ref<string | null>(null)
  const avatarFile = ref<File | null>(null)

  watch(() => authStore.user, (user) => {
    if (user) {
      const p = (user as any).profile || {}
      profileForm.value = {
        firstName: user.firstName || p.firstName || '',
        lastName: user.lastName || p.lastName || '',
        phoneNumber: (user as any).phoneNumber || (user as any).phone || p.phone || '',
        city: p.city || '',
        district: p.district || '',
        gender: p.gender || '',
        companyName: (user as any).vendor?.company?.name || '',
        taxNumber: (user as any).vendor?.company?.taxNumber || '',
        taxOffice: (user as any).vendor?.company?.taxOffice || '',
      }
    }
  }, { immediate: true, deep: true })

  const getAvatarUrl = (avatar: string | null) => {
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    return `/uploads/avatars/${avatar}`
  }

  const handleAvatarChange = (file: File) => {
    avatarFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const uploadAvatar = async () => {
    if (!avatarFile.value) return
    avatarUploading.value = true
    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile.value)
      const res = await userService.uploadAvatar(formData)
      if (res.success && res.data) {
        if (authStore.user) {
          authStore.user.avatar = res.data.url
          if ((authStore.user as any).profile) {
            (authStore.user as any).profile.avatar = res.data.url
          }
        }
        toast.success(t('profile.avatarUpdatedSuccess'))
        showAvatarModal.value = false
      }
    } catch (error) {
      toast.error(t('profile.avatarUpdateError'))
    } finally {
      avatarUploading.value = false
    }
  }

  const updateProfile = async () => {
    profileLoading.value = true
    try {
      // Boş değerleri temizle
      const cleanData = Object.fromEntries(
        Object.entries(profileForm.value).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      )

      const res = await userService.updateProfile(cleanData as any)

      if (res.success && res.data) {
        // Mevcut kullanıcı verisini ezmek yerine merge et
        if (authStore.user && res.data.user) {
          Object.assign(authStore.user, res.data.user)
        } else {
          authStore.user = res.data.user
        }
        toast.success(t('profile.profileUpdatedSuccess'))
      }
    } catch (error: any) {
      console.error('[useProfileAccount] HATA:', error)
      const message = error.response?._data?.message || t('profile.profileUpdateError')
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      profileLoading.value = false
    }
  }

  return {
    profileLoading,
    profileForm,
    showAvatarModal,
    avatarUploading,
    avatarPreview,
    avatarFile,
    getAvatarUrl,
    handleAvatarChange,
    uploadAvatar,
    updateProfile
  }
}
