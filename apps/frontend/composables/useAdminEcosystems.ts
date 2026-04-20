import { ref, computed, onMounted } from 'vue'

export const useAdminEcosystems = () => {
    const { $api } = useApi()
    const { $toast } = useNuxtApp()

    const ecosystems = ref<any[]>([])
    const auditLogs = ref<any[]>([])
    const loading = ref(false)
    const showLogs = ref(false)
    const selectedEco = ref<any>(null)
    const showOverrideModal = ref(false)
    const targetMember = ref<any>(null)
    const overrideScore = ref(100)
    const overrideReason = ref('')
    const submitting = ref(false)

    const totalPrivateStock = computed(() => ecosystems.value.reduce((s, e) => s + (e.stats?.totalStok || 0), 0))
    const totalInventoryValue = computed(() => ecosystems.value.reduce((s, e) => s + (e.stats?.totalValue || 0), 0))
    const recentViolations = computed(() => auditLogs.value.filter(l => l.severity !== 'INFO').length)

    const fetchData = async () => {
        loading.value = true
        try {
            const [ecoRes, logRes] = (await Promise.all([
                $api('/api/v1/admin/ecosystems'),
                $api('/api/v1/admin/ecosystems/logs')
            ])) as any[]
            ecosystems.value = ecoRes.ecosystems || ecoRes.data?.ecosystems || []
            auditLogs.value = logRes.logs || logRes.data?.logs || []
            if (selectedEco.value) {
                const updated = ecosystems.value.find(e => e.id === selectedEco.value.id)
                if (updated) selectedEco.value = updated
            }
        } catch (err) {
            $toast.error('Veriler yüklenemedi')
        } finally {
            loading.value = false
        }
    }

    const submitOverride = async () => {
        if (submitting.value) return
        submitting.value = true
        try {
            await $api('/api/v1/admin/ecosystems/trust-score', {
                method: 'POST',
                body: { vendorId: targetMember.value.id, newScore: overrideScore.value, reason: overrideReason.value }
            })
            $toast.success('TrustScore güncellendi')
            showOverrideModal.value = false
            await fetchData()
        } catch (err: any) {
            $toast.error(err.data?.error || 'Hata oluştu')
        } finally {
            submitting.value = false
        }
    }

    const removeMember = async (vendorId: string) => {
        if (!confirm('Üyeyi çıkarmak istediğinize emin misiniz?')) return
        try {
            await $api(`/api/v1/admin/ecosystems/members/${vendorId}`, { method: 'DELETE' })
            $toast.success('Üye çıkarıldı')
            await fetchData()
        } catch (err: any) {
            $toast.error(err.data?.error || 'Hata oluştu')
        }
    }

    onMounted(fetchData)

    return {
        ecosystems, auditLogs, loading, showLogs, selectedEco,
        showOverrideModal, targetMember, overrideScore, overrideReason, submitting,
        totalPrivateStock, totalInventoryValue, recentViolations,
        fetchData, submitOverride, removeMember
    }
}
