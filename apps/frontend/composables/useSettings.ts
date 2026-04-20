import { ref, watch, onMounted } from 'vue'

export const useSettings = () => {
    const authStore = useAuthStore()
    const toast = useNuxtApp().$toast
    const loading = ref(false)

    const formData = ref({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const fetchUserData = () => {
        if (authStore.user) {
            formData.value.firstName = authStore.user.firstName || ''
            formData.value.lastName = authStore.user.lastName || ''
            formData.value.email = authStore.user.email || ''
            formData.value.phoneNumber = authStore.user.phoneNumber || ''
        }
    }

    const updateProfile = async () => {
        loading.value = true
        try {
            await (authStore as any).updateProfile({
                firstName: formData.value.firstName,
                lastName: formData.value.lastName,
                phoneNumber: formData.value.phoneNumber
            })
            toast.success('Profil başarıyla güncellendi')
        } catch (error: any) {
            toast.error(error.data?.error || 'Profil güncellenemedi')
        } finally {
            loading.value = false
        }
    }

    const changePassword = async () => {
        if (formData.value.newPassword !== formData.value.confirmPassword) {
            toast.error('Yeni şifreler eşleşmiyor')
            return
        }
        loading.value = true
        try {
            await (authStore as any).changePassword({
                oldPassword: formData.value.currentPassword,
                newPassword: formData.value.newPassword
            })
            toast.success('Şifre başarıyla değiştirildi')
            formData.value.currentPassword = ''
            formData.value.newPassword = ''
            formData.value.confirmPassword = ''
        } catch (error: any) {
            toast.error(error.data?.error || 'Şifre değiştirilemedi')
        } finally {
            loading.value = false
        }
    }

    onMounted(fetchUserData)

    return { formData, loading, updateProfile, changePassword }
}
