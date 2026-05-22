import { ref, computed, onMounted } from 'vue'
import { useBarterService } from '~/services/api/BarterService'
import { useAuthStore } from '~/stores/auth'

export const useBarterWallet = () => {
    const auth = useAuthStore()
    const barterService = useBarterService()
    
    const transactions = ref<Record<string, unknown>[]>([])
    const xpTransactions = ref<Record<string, unknown>[]>([])
    const loading = ref(true)
    const activeTab = ref('financial')

    const fetchInfo = async () => {
        loading.value = true
        try {
            const res = await barterService.getBarterInfo() as { success: boolean; data?: Record<string, unknown> }
            if (res.success && res.data) {
                const data = res.data
                if (auth.user) {
                    const userWallet = auth.user as unknown as { wallet?: Record<string, unknown> }
                    if (!userWallet.wallet) userWallet.wallet = {}
                    Object.assign(userWallet.wallet, {
                        balance: data.balance,
                        barterBalance: data.barterBalance,
                        barterCreditLimit: data.barterCreditLimit,
                        commissionXP: data.commissionXP,
                        adXP: data.adXP,
                        serviceXP: data.serviceXP
                    })
                }

                const currentBalance = Number(data.barterBalance || 0)
                const sortedTransactions = [...(data.transactions as Record<string, unknown>[] || [])].sort((a: Record<string, unknown>, b: Record<string, unknown>) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())

                let runningVal = currentBalance
                transactions.value = sortedTransactions.map(tx => {
                    const amount = Number(tx.amount)
                    let impact = 0
                    if (tx.type === 'CREDIT') impact = amount
                    else if (tx.type === 'DEBIT') impact = -amount
                    else if (tx.type === 'TRANSFER') {
                        const desc = (tx.description || '').toLowerCase()
                        impact = (desc.includes('gelen') || desc.includes('giren')) ? amount : -amount
                    }
                    const balanceSnapshot = runningVal
                    runningVal -= impact
                    return { ...tx, impact, balanceAfter: balanceSnapshot }
                })
                xpTransactions.value = data.xpTransactions || []
            }
        } catch {
            /* sessiz hata */
        } finally {
            loading.value = false
        }
    }

    const financialTransactions = computed(() => transactions.value.filter(tx => !tx.description.toLowerCase().includes('takas') && !tx.description.toLowerCase().includes('offer')))
    const tradeTransactions = computed(() => transactions.value.filter(tx => tx.description.toLowerCase().includes('takas') || tx.description.toLowerCase().includes('offer')))
    
    const currentTransactions = computed(() => {
        if (activeTab.value === 'financial') return financialTransactions.value
        if (activeTab.value === 'trade') return tradeTransactions.value
        return xpTransactions.value
    })

    onMounted(() => fetchInfo())

    return { auth, transactions, xpTransactions, loading, activeTab, currentTransactions, fetchInfo }
}
