import { ref } from 'vue'

export const usePremium = () => {
    const authStore = useAuthStore()
    const { $api } = useApi()
    const toast = useNuxtApp().$toast

    const loading = ref(false)

    const scrollToPricing = () => {
        const el = document.getElementById('pricing')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    const startPremium = async (plan: 'monthly' | 'yearly') => {
        if (!authStore.isLoggedIn) {
            toast.info('Lütfen önce giriş yapın')
            return navigateTo('/login?redirect=/premium')
        }

        const amount = plan === 'monthly' ? 99.00 : 828.00 // 69 * 12

        try {
            loading.value = true
            const response = await $api('/api/payments/premium/subscribe', {
                method: 'POST',
                body: { plan, amount }
            })
            if (response.success) {
                toast.success(response.message || 'Premium üyeliğiniz aktif edildi!')
                await authStore.fetchUser()
                setTimeout(() => navigateTo('/'), 2000)
            }
        } catch (error: any) {
            toast.error(error.data?.error || 'Ödeme işlemi sırasında bir hata oluştu')
        } finally {
            loading.value = false
        }
    }

    return { loading, scrollToPricing, startPremium }
}
