import { ref } from 'vue'

export interface SubscriptionPlan {
  id: string
  tier: string
  monthlyFee: number
  annualFee: number | null
  menuCredit: number
  breakeven: number
  benefits: string[]
}

export const usePremium = () => {
    const authStore = useAuthStore()
    const { $api } = useApi()
    const toast = useNuxtApp().$toast

    const loading = ref(false)
    const plans = ref<SubscriptionPlan[]>([])
    const myMembership = ref<any>(null)

    const scrollToPricing = () => {
        const el = document.getElementById('pricing')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchPlans = async () => {
        try {
            const response = await $api<{ success: boolean; data: SubscriptionPlan[] }>('/api/v1/subscriptions/plans')
            if (response.success && response.data) {
                plans.value = response.data
            }
        } catch {
            // fallback: boş bırak, UI hardcoded data gösterir
        }
    }

    const fetchMembership = async () => {
        if (!authStore.isLoggedIn) return
        try {
            const response = await $api<{ success: boolean; data: any }>('/api/v1/subscriptions/me')
            if (response.success && response.data) {
                myMembership.value = response.data
            }
        } catch {
            // ignore
        }
    }

    const startPremium = async (planId: string) => {
        if (!authStore.isLoggedIn) {
            toast.info('Lütfen önce giriş yapın')
            return navigateTo('/login?redirect=/premium')
        }

        const plan = plans.value.find(p => p.id === planId)
        const amount = plan?.monthlyFee ?? 0

        try {
            loading.value = true
            const response = await $api('/api/v1/subscriptions/subscribe', {
                method: 'POST',
                body: { tier: plan?.tier, annual: false }
            })
            if (response.success) {
                toast.success(response.message || 'Premium üyeliğiniz aktif edildi!')
                await authStore.fetchUser()
                await fetchMembership()
                setTimeout(() => navigateTo('/'), 2000)
            }
        } catch (error: unknown) {
            toast.error((error as { data?: { error?: string } }).data?.error || 'Ödeme işlemi sırasında bir hata oluştu')
        } finally {
            loading.value = false
        }
    }

    return { loading, plans, myMembership, scrollToPricing, fetchPlans, fetchMembership, startPremium }
}
