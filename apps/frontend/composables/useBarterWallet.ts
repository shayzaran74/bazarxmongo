import { ref, computed, onMounted } from 'vue'
import { useBarterService } from '~/services/api/BarterService'
import { useAuthStore } from '~/stores/auth'

export const useBarterWallet = () => {
    const auth = useAuthStore()
    const barterService = useBarterService()
    
    const transactions = ref<any[]>([])
    const xpTransactions = ref<any[]>([])
    const loading = ref(true)
    const activeTab = ref('financial')

    const fetchInfo = async () => {
        loading.value = true
        try {
            const res = await barterService.getBarterInfo() as any
            if (res.success) {
                if (auth.user) {
                    if (!(auth.user as any).wallet) (auth.user as any).wallet = {}
                    Object.assign((auth.user as any).wallet, {
                        balance: res.balance,
                        barterBalance: res.barterBalance,
                        barterCreditLimit: res.barterCreditLimit,
                        commissionXP: res.commissionXP,
                        adXP: res.adXP,
                        serviceXP: res.serviceXP
                    })
                }

                const currentBalance = Number(res.barterBalance)
                const sortedTransactions = [...(res.transactions || [])].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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
                xpTransactions.value = res.xpTransactions || []
            }
        } catch (err) {
            console.error('Barter fetch error:', err)
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
