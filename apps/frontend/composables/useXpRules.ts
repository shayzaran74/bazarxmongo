import { ref, computed, onMounted } from 'vue'
import { useAdminRulesService } from '~/services/api/AdminRulesService'

export const useXpRules = () => {
    const adminRulesService = useAdminRulesService()
    const { $toast: toast } = useNuxtApp()

    const activeTab = ref('distribution')
    const distRules = ref<any[]>([])
    const spendingLimits = ref<any[]>([])
    const loadingDistRules = ref(true)
    const loadingSpendingLimits = ref(true)
    const isSaving = ref(false)

    const isDistRuleModalOpen = ref(false)
    const isLimitModalOpen = ref(false)

    const distRuleForm = ref<any>({
        name: '',
        city: '',
        tier: '',
        commissionPct: 25,
        adPct: 25,
        servicePct: 50,
        priority: 0,
        isActive: true
    })

    const limitForm = ref<any>({
        tier: 'CORE',
        maxXpPerTransactionPct: 20,
        monthlyVolumeThreshold: 0,
        boostedDailyXpLimit: 0,
        isActive: true,
        isNew: false
    })

    const pctTotal = computed(() => {
        return Number(distRuleForm.value.commissionPct) + Number(distRuleForm.value.adPct) + Number(distRuleForm.value.servicePct)
    })

    const fetchDistRules = async () => {
        loadingDistRules.value = true
        try {
            const res: any = await adminRulesService.getXpDistributionRules()
            if (res.success) distRules.value = res.data
        } catch (error: any) {
            toast.error('Hata: ' + (error.data?.error || error.message))
        } finally {
            loadingDistRules.value = false
        }
    }

    const fetchSpendingLimits = async () => {
        loadingSpendingLimits.value = true
        try {
            const res: any = await adminRulesService.getSpendingLimitRules()
            if (res.success) spendingLimits.value = res.data
        } catch (error: any) {
            toast.error('Hata: ' + (error.data?.error || error.message))
        } finally {
            loadingSpendingLimits.value = false
        }
    }

    const saveDistRule = async () => {
        if (pctTotal.value !== 100) {
            toast.error('Yüzdelerin toplamı 100 olmalıdır!')
            return
        }
        isSaving.value = true
        try {
            const payload = { ...distRuleForm.value }
            if (!payload.city) delete payload.city
            if (!payload.tier) delete payload.tier
            const res: any = await adminRulesService.saveXpDistributionRule(payload)
            if (res.success) {
                toast.success('Dağıtım kuralı eklendi!')
                isDistRuleModalOpen.value = false
                fetchDistRules()
            }
        } catch (error: any) {
            toast.error('Kaydetme hatası: ' + (error.data?.error || error.message))
        } finally {
            isSaving.value = false
        }
    }

    const saveSpendingLimit = async () => {
        isSaving.value = true
        try {
            const res: any = await adminRulesService.saveSpendingLimitRule(limitForm.value.tier, limitForm.value)
            if (res.success) {
                toast.success('Limitleri güncellendi!')
                isLimitModalOpen.value = false
                fetchSpendingLimits()
            }
        } catch (error: any) {
            toast.error('Limit kaydetme hatası: ' + (error.data?.error || error.message))
        } finally {
            isSaving.value = false
        }
    }

    return {
        activeTab, distRules, spendingLimits, loadingDistRules, loadingSpendingLimits, isSaving,
        isDistRuleModalOpen, isLimitModalOpen, distRuleForm, limitForm, pctTotal,
        fetchDistRules, fetchSpendingLimits, saveDistRule, saveSpendingLimit,
        openDistRuleModal: () => {
            distRuleForm.value = {
                name: '', city: '', tier: '',
                commissionPct: 25, adPct: 25, servicePct: 50,
                priority: 0, isActive: true
            }
            isDistRuleModalOpen.value = true
        },
        openEditLimitModal: (limit: any) => {
            limitForm.value = { ...limit, isNew: false }
            isLimitModalOpen.value = true
        },
        openCreateLimitModal: () => {
            limitForm.value = {
                tier: 'CORE', maxXpPerTransactionPct: 20,
                monthlyVolumeThreshold: 0, boostedDailyXpLimit: 0,
                isActive: true, isNew: true
            }
            isLimitModalOpen.value = true
        }
    }
}
