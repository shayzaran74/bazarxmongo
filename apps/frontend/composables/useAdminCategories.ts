import { ref, computed } from 'vue'
import type { Category } from '@barterborsa/shared-types'

export const useAdminCategories = () => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast

  const categories = ref<Category[]>([])
  const loading = ref(false)
  const showModal = ref(false)
  const editingCategory = ref<any>(null)
  const expandedCategories = ref<(number | string)[]>([])
  const uploading = ref(false)
  const imagePreview = ref<string | null>(null)

  const defaultForm = {
    name: '',
    description: '',
    slug: '',
    icon: 'Squares2X2Icon',
    image: '',
    colorFrom: 'from-blue-400',
    colorTo: 'to-amber-500',
    hoverColor: 'group-hover:text-gray-600',
    shadowColor: 'shadow-gray-200',
    parentId: null as number | string | null,
    order: 0,
    isActive: true,
    badgeText: '',
    badgeColor: '#ef4444'
  }

  const categoryForm = ref({ ...defaultForm })

  const fetchCategories = async () => {
    loading.value = true
    try {
      const res: any = await $api('/api/admin/categories', { query: { includeChildren: true } })
      if (res.success) categories.value = res.data
    } finally { loading.value = false }
  }

  const toggleExpanded = (id: number | string) => {
    if (expandedCategories.value.includes(id)) {
      expandedCategories.value = expandedCategories.value.filter(catId => catId !== id)
    } else {
      expandedCategories.value.push(id)
    }
  }

  const saveCategory = async () => {
    try {
      const method = editingCategory.value ? 'PUT' : 'POST'
      const url = editingCategory.value ? `/api/admin/categories/${editingCategory.value.id}` : '/api/admin/categories'
      const res: any = await $api(url, { method, body: categoryForm.value })
      if (res.success) {
        toast.success('Başarıyla kaydedildi')
        showModal.value = false
        await fetchCategories()
      }
    } catch (e: any) {
      toast.error(e.data?.error || 'Hata oluştu')
    }
  }

  const deleteCategory = async (id: number | string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    try {
      const res: any = await $api(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (res.success) {
        toast.success('Silindi')
        await fetchCategories()
      }
    } catch { toast.error('Silinirken hata oluştu') }
  }

  const handleFileUpload = async (file: File) => {
    uploading.value = true
    imagePreview.value = URL.createObjectURL(file)
    try {
      const body = new FormData()
      body.append('file', file)
      const res: any = await $api('/api/upload?type=category', { method: 'POST', body })
      if (res.success) categoryForm.value.image = res.url
    } finally { uploading.value = false }
  }

  return {
    categories, loading, showModal, editingCategory, expandedCategories, categoryForm, uploading, imagePreview,
    fetchCategories, toggleExpanded, saveCategory, deleteCategory, handleFileUpload,
    resetForm: () => { categoryForm.value = { ...defaultForm }; editingCategory.value = null; imagePreview.value = null }
  }
}
