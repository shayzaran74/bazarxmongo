import { ref } from 'vue'
import { userService } from '~/services/userService'
import { useNuxtApp } from '#imports'
import { useI18n } from 'vue-i18n'

export const useProfileSecurity = () => {
  const { t } = useI18n()
  const { $toast: toast } = useNuxtApp()

  const passwordLoading = ref(false)
  const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
  
  const preferences = ref({ emailNotifications: true, smsNotifications: true })

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

  const savePreferences = () => {
    toast.success(t('profile.profileUpdatedSuccess'))
  }

  return { passwordLoading, passwordForm, preferences, changePassword, savePreferences }
}
