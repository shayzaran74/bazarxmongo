import { ref, computed } from 'vue'
import { iller } from '~/assets/css/data/component/iller'

export const useAdminBanners = () => {
    const config = useRuntimeConfig()
    const { $api } = useApi()
    const { $toast: toast } = useNuxtApp()
    const route = useRoute()

    const banners = ref<any[]>([])
    const loading = ref(true)
    const saving = ref(false)
    const deleting = ref(false)
    const uploading = ref(false)
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const isEditing = ref(false)
    const editingBannerId = ref<string | number | null>(null)
    const bannerToDelete = ref<any>(null)
    const imagePreview = ref<string | null>(null)

    const defaultFormData = {
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        order: 0,
        isActive: true,
        startDate: '',
        endDate: '',
        ecosystems: ['GLOBAL'],
        position: 'home_top',
        locationTags: { city: '', district: '' }
    }

    const formData = ref<any>({ ...defaultFormData })

    const currentEcosystem = computed(() => route.query.ecosystem || 'GLOBAL')
    const cityList = computed(() => Object.keys(iller))
    const districtList = computed(() => {
        if (formData.value.locationTags?.city && (iller as any)[formData.value.locationTags.city]) {
            return (iller as any)[formData.value.locationTags.city]
        }
        return []
    })

    const parseLocationsToTags = (locations: any[]) => {
        if (!locations || locations.length === 0) return { city: '', district: '' }
        const tags = locations.map((l: any) => l.tag)
        const districtTag = tags.find((t: string) => t.includes('-'))
        if (districtTag) {
            const [city, district] = districtTag.split('-')
            return { city, district }
        }
        return { city: tags[0] || '', district: '' }
    }

    const fetchBanners = async () => {
        loading.value = true
        try {
            const res: any = await $api(`/api/v1/admin/banners?ecosystem=${currentEcosystem.value}`)
            if (res.success) {
                banners.value = res.data
            }
        } catch (error) {
            console.error('Fetch error:', error)
            toast.error('Bannerlar yüklenemedi')
        } finally {
            loading.value = false
        }
    }

    const saveBanner = async () => {
        saving.value = true
        try {
            const payload = {
                ...formData.value,
                description: formData.value.description || null,
                linkUrl: formData.value.linkUrl || null,
                startDate: formData.value.startDate || null,
                endDate: formData.value.endDate || null
            }

            const endpoint = isEditing.value ? `/api/v1/admin/banners/${editingBannerId.value}` : '/api/v1/admin/banners'
            const method = isEditing.value ? 'PUT' : 'POST'

            const res: any = await $api(endpoint, { method, body: payload })
            if (res.success) {
                toast.success(isEditing.value ? 'Güncellendi' : 'Oluşturuldu')
                showModal.value = false
                fetchBanners()
            }
        } catch (error) {
            toast.error('Kaydedilemedi')
        } finally {
            saving.value = false
        }
    }

    const deleteBanner = async () => {
        if (!bannerToDelete.value) return
        deleting.value = true
        try {
            const res: any = await $api(`/api/v1/admin/banners/${bannerToDelete.value.id}`, { method: 'DELETE' })
            if (res.success) {
                toast.success('Silindi')
                showDeleteModal.value = false
                fetchBanners()
            }
        } catch (error) {
            toast.error('Silinemedi')
        } finally {
            deleting.value = false
        }
    }

    const toggleStatus = async (banner: any) => {
        try {
            const res: any = await $api(`/api/v1/admin/banners/${banner.id}`, {
                method: 'PUT',
                body: { isActive: !banner.isActive }
            })
            if (res.success) {
                toast.success('Durum güncellendi')
                fetchBanners()
            }
        } catch (error) {
            toast.error('Girişim başarısız')
        }
    }

    const handleUpload = async (file: File) => {
        if (!file) return
        uploading.value = true
        imagePreview.value = URL.createObjectURL(file)
        try {
            const uploadData = new FormData()
            uploadData.append('file', file)
            const res: any = await $api('/api/v1/upload?type=banner', { method: 'POST', body: uploadData })
            if (res.success) {
                formData.value.imageUrl = res.url
                toast.success('Görsel yüklendi')
            }
        } catch (error) {
            toast.error('Yükleme hatası')
            imagePreview.value = null
        } finally {
            uploading.value = false
        }
    }

    return {
        banners, loading, saving, deleting, uploading, 
        showModal, showDeleteModal, isEditing, formData,
        imagePreview, cityList, districtList,
        fetchBanners, saveBanner, deleteBanner, toggleStatus, handleUpload,
        openCreateModal: () => {
            isEditing.value = false
            formData.value = { ...defaultFormData, locationTags: { city: '', district: '' } }
            imagePreview.value = null
            showModal.value = true
        },
        editBanner: (banner: any) => {
            isEditing.value = true
            editingBannerId.value = banner.id
            formData.value = {
                ...banner,
                startDate: banner.startDate ? banner.startDate.slice(0, 16) : '',
                endDate: banner.endDate ? banner.endDate.slice(0, 16) : '',
                locationTags: parseLocationsToTags(banner.locations)
            }
            imagePreview.value = null
            showModal.value = true
        }
    }
}
