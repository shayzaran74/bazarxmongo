import { ref, watch } from 'vue'
import { useAuthStore, useRuntimeConfig, useNuxtApp } from '#imports'
import { userService } from '~/services/userService'
import type { UserProfileUpdate } from '@barterborsa/shared-types'
import { useI18n } from 'vue-i18n'

export const useProfileAccount = () => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const { t } = useI18n()
  const { $toast: toast } = useNuxtApp()

  const profileLoading = ref(false)
  const profileForm = ref<UserProfileUpdate>({
    firstName: '', lastName: '', phoneNumber: '', district: '', neighborhood: ''
  })

  const showAvatarModal = ref(false)
  const avatarUploading = ref(false)
  const avatarPreview = ref<string | null>(null)
  const avatarFile = ref<File | null>(null)

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

  const updateProfile = async () => {
    profileLoading.value = true
    try {
      const res = await userService.updateProfile(profileForm.value)
      if (res.success && res.data) {
        authStore.user = res.data.user
        toast.success(t('profile.profileUpdatedSuccess'))
      }
    } catch (error) {
      toast.error(t('profile.profileUpdateError'))
    } finally {
      profileLoading.value = false
    }
  }

  return {
    profileLoading, profileForm, showAvatarModal, avatarUploading, avatarPreview,
    getAvatarUrl, handleAvatarChange, uploadAvatar, updateProfile
  }
}
