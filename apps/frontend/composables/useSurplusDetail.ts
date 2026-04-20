import { ref, onMounted } from 'vue'

export const useSurplusDetail = () => {
    const { $api } = useApi()
    const toast = useNuxtApp().$toast

    const item = ref<any>(null)
    const chains = ref<any[]>([])
    const loading = ref(true)
    const submitting = ref(false)

    const fetchDetail = async (id: string) => {
        loading.value = true
        try {
            const response = await $api<any>(`/api/v1/surplus/${id}`) as any
            if (response.success) {
                item.value = response.item || response.data?.item || response.data
                await fetchChainsData(id)
            }
        } catch (e) {
            console.error('Fetch surplus error:', e)
        } finally {
            loading.value = false
        }
    }

    const fetchChainsData = async (id: string) => {
        try {
            const response = await $api<any>(`/api/v1/surplus/${id}/chains`) as any
            if (response.success) chains.value = (response.chains || response.data?.chains || []) as any[]
        } catch (e) {
            console.error('Fetch chains error:', e)
        }
    }

    const contactOwner = async () => {
        toast.info('İletişim özelliği yakında aktif edilecek.')
    }

    return { item, chains, loading, submitting, fetchDetail, contactOwner }
}
