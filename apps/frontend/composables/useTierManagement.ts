import { ref, onMounted } from 'vue'

export const useTierManagement = () => {
    const { $api } = useApi()
    const toast = useNuxtApp().$toast

    const tiers = ref<any[]>([])
    const loading = ref(true)
    const showModal = ref(false)
    const isEditing = ref(false)
    const submitting = ref(false)
    
    const form = ref<any>({
        tier: 'BRONZE',
        commissionCash: 2.5,
        commissionBarter: 3.5,
        burnRate: 0.5,
        annualFee: 1000,
        listingLimit: 100,
        excelBatchLimit: 50,
        apiRatePerMin: 60,
        archiveAfterDays: 365,
        imageCountPerListing: 5,
        roiRate: 1.2,
        xpMultiplier: 1.0
    })

    const fetchData = async () => {
        loading.value = true
        try {
            const data = await $api<any>('/api/v1/admin/tiers')
            if (data.success) tiers.value = (data.data || []) as any[]
        } catch (err) {
            console.error('Fetch tiers error:', err)
        } finally {
            loading.value = false
        }
    }

    const saveTier = async () => {
        submitting.value = true
        try {
            const payload = { ...form.value }
            // Remove unnecessary fields
            const cleanPayload: any = { ...payload }
            delete cleanPayload.createdAt
            delete cleanPayload.updatedAt
            delete cleanPayload._stats
            delete cleanPayload._count

            await $api('/api/v1/admin/tiers', {
                method: 'POST',
                body: cleanPayload
            })
            toast.success('Kural başarıyla kaydedildi')
            showModal.value = false
            fetchData()
        } catch (error: any) {
            toast.error(error.data?.error || 'Kural kaydedilemedi')
        } finally {
            submitting.value = false
        }
    }

    const openEdit = (tier: any) => {
        const data = { ...tier }
        // Convert Decimal objects if any
        Object.keys(data).forEach(key => {
            if (typeof data[key] === 'object' && data[key]?.$numberDecimal) {
                data[key] = parseFloat(data[key].$numberDecimal)
            }
        })
        form.value = data
        isEditing.value = true
        showModal.value = true
    }

    onMounted(fetchData)

    return {
        tiers, loading, showModal, isEditing, submitting, form,
        fetchData, saveTier, openEdit
    }
}
