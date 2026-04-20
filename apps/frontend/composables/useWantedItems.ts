import { ref, computed, onMounted, watch } from 'vue'
import { useCategoryService } from '~/services/api/CategoryService'
import { useWantedItemService } from '~/services/api/WantedItemService'

export const useWantedItems = () => {
    const wantedItemService = useWantedItemService()
    const categoryService = useCategoryService()
    const authStore = useAuthStore()
    const toast = useNuxtApp().$toast

    const wantedItems = ref<any[]>([])
    const categories = ref<any[]>([])
    const loading = ref(true)
    const showAddModal = ref(false)
    const submitting = ref(false)
    const isEditing = ref(false)
    const editingItemId = ref<string | null>(null)

    const formData = ref({
        categoryId: '',
        listingType: 'BUY',
        type: 'PRODUCT',
        minPrice: null,
        maxPrice: null,
        keywordsText: '',
        description: ''
    })

    const selectedMainCategory = ref('')
    const selectedSubCategory1 = ref('')
    const selectedSubCategory2 = ref('')

    const activeCount = computed(() => wantedItems.value.filter(i => i.isActive !== false).length)
    const uniqueCategories = computed(() => new Set(wantedItems.value.map(i => i.categoryId)).size)

    const fetchData = async () => {
        loading.value = true
        try {
            const [itemsRes, catsRes] = await Promise.all([
                wantedItemService.getMyItems(),
                categoryService.getCategories()
            ]) as [any, any]
            
            if (itemsRes.success) wantedItems.value = (itemsRes.data || []) as any[]
            if (catsRes.success) categories.value = (catsRes.data || []) as any[]
        } catch (e) {
            console.error('Fetch data error:', e)
        } finally {
            loading.value = false
        }
    }

    const submitItem = async () => {
        submitting.value = true
        try {
            const keywords = formData.value.keywordsText.split(',').map(k => k.trim()).filter(k => k)
            const payload = { ...formData.value, keywords }
            
            if (isEditing.value && editingItemId.value) {
                await wantedItemService.updateItem(editingItemId.value, payload)
                toast.success('İstek güncellendi!')
            } else {
                await wantedItemService.createItem(payload)
                toast.success('Yeni istek oluşturuldu!')
            }
            closeModal()
            fetchData()
        } catch (e: any) {
            toast.error(e.data?.error || 'Bir hata oluştu')
        } finally {
            submitting.value = false
        }
    }

    const closeModal = () => {
        showAddModal.value = false
        isEditing.value = false
        editingItemId.value = null
        selectedMainCategory.value = ''; selectedSubCategory1.value = ''; selectedSubCategory2.value = ''
        formData.value = { categoryId: '', listingType: 'BUY', type: 'PRODUCT', minPrice: null, maxPrice: null, keywordsText: '', description: '' }
    }

    onMounted(async () => {
        await authStore.init()
        if (authStore.isAuthenticated) fetchData()
    })

    return {
        wantedItems, categories, loading, showAddModal, submitting, isEditing,
        formData, selectedMainCategory, selectedSubCategory1, selectedSubCategory2,
        activeCount, uniqueCategories,
        fetchData, submitItem, closeModal
    }
}
