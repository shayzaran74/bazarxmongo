export const useAdminCategories = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const categories = ref<any[]>([])
  const loading = ref(false)
  const showModal = ref(false)
  const editingCategory = ref<any>(null)
  const expandedCategories = ref<string[]>([])
  const imagePreview = ref<string | null>(null)

  const categoryForm = ref<any>({
    id: '',
    name: '',
    slug: '',
    description: '',
    parentId: null,
    image: '',
    status: 'ACTIVE',
    type: 'GENERAL',
    order: 0,
  })

  const fetchCategories = async () => {
    loading.value = true
    try {
      const res = await $api<any>('/api/listings/categories')
      categories.value = res.data || []
    } catch {
      $toast.error('Kategoriler yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const toggleExpanded = (id: string) => {
    const index = expandedCategories.value.indexOf(id)
    if (index === -1) expandedCategories.value.push(id)
    else expandedCategories.value.splice(index, 1)
  }

  const handleFileUpload = async (event: any) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Preview
    const reader = new FileReader()
    reader.onload = (e) => (imagePreview.value = e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload logic usually goes here or in save
    // For now we set image name or handle in saveCategory
    categoryForm.value.image = file.name
  }

  const resetForm = () => {
    categoryForm.value = {
      id: '',
      name: '',
      slug: '',
      description: '',
      parentId: null,
      image: '',
      status: 'ACTIVE',
      type: 'GENERAL',
      order: 0,
    }
    imagePreview.value = null
    editingCategory.value = null
  }

  const saveCategory = async () => {
    const data = categoryForm.value
    try {
      if (data.id) {
        await $api(`/api/admin/categories/${data.id}`, {
          method: 'PUT',
          body: data
        })
      } else {
        await $api('/api/admin/categories', {
          method: 'POST',
          body: data
        })
      }
      $toast.success('Kategori kaydedildi')
      showModal.value = false
      resetForm()
      fetchCategories()
    } catch {
      $toast.error('Kaydedilemedi')
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return
    try {
      await $api(`/api/admin/categories/${id}`, { method: 'DELETE' })
      $toast.success('Kategori silindi')
      fetchCategories()
    } catch {
      $toast.error('Silinemedi')
    }
  }

  return {
    categories, loading, showModal, editingCategory, expandedCategories, categoryForm, imagePreview,
    fetchCategories, toggleExpanded, saveCategory, deleteCategory, handleFileUpload, resetForm
  }
}
