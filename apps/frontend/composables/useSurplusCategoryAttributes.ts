import { ref, computed, onMounted } from 'vue'

export const useSurplusCategoryAttributes = (categoryId: string) => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast
  
  const category = ref<any>(null)
  const attributes = ref<any[]>([])
  const loading = ref(false)
  const showModal = ref(false)
  const editingAttribute = ref<any>(null)
  const optionsInput = ref('')

  const typeLabels: any = {
    text: 'Metin',
    number: 'Sayı',
    select: 'Tekli Seçim',
    multiselect: 'Çoklu Seçim',
    checkbox: 'Onay Kutusu'
  }

  const defaultForm = {
    name: '',
    label: '',
    type: 'text',
    options: null as string[] | null,
    unit: '',
    placeholder: '',
    isRequired: false,
    isActive: true,
    isFilterable: true,
    order: 0
  }

  const attrForm = ref({ ...defaultForm })

  const parsedOptions = computed(() => {
    if (!optionsInput.value) return []
    return optionsInput.value.split(',').map(o => o.trim()).filter(Boolean)
  })

  // Fetch surplus category info
  const fetchCategory = async () => {
    try {
      const response: any = await $api(`/api/v1/admin/surplus-categories/${categoryId}`)
      category.value = response.data
    } catch (error) {
      console.error('Fetch Surplus Category Error:', error)
    }
  }

  // Fetch attributes with surplusCategoryId
  const fetchAttributes = async () => {
    loading.value = true
    try {
      const response: any = await $api('/api/v1/admin/category-attributes', {
        query: { surplusCategoryId: categoryId }
      })
      attributes.value = response.data || []
    } catch (error) {
      console.error('Fetch Surplus Attributes Error:', error)
    } finally {
      loading.value = false
    }
  }

  const openCreateModal = () => {
    editingAttribute.value = null
    attrForm.value = { ...defaultForm, order: attributes.value.length }
    optionsInput.value = ''
    showModal.value = true
  }

  const openEditModal = (attr: any) => {
    editingAttribute.value = attr
    attrForm.value = { ...attr }
    optionsInput.value = attr.options?.join(', ') || ''
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    editingAttribute.value = null
  }

  const saveAttribute = async () => {
    try {
      if (['select', 'multiselect'].includes(attrForm.value.type)) {
        attrForm.value.options = parsedOptions.value
      } else {
        attrForm.value.options = null
      }

      const url = editingAttribute.value
        ? `/api/v1/admin/category-attributes/${editingAttribute.value.id}`
        : '/api/v1/admin/category-attributes'
      const method = editingAttribute.value ? 'PUT' : 'POST'

      // Important: Use surplusCategoryId in body
      const response: any = await $api(url, {
        method,
        body: { ...attrForm.value, surplusCategoryId: categoryId }
      })

      if (response.success) {
        toast.success(editingAttribute.value ? 'Özellik güncellendi!' : 'Özellik eklendi!')
        closeModal()
        fetchAttributes()
      }
    } catch (error: any) {
      console.error('Save Surplus Attribute Error:', error)
      toast.error(error.data?.error || 'Özellik kaydedilirken hata oluştu')
    }
  }

  const deleteAttribute = async (id: string) => {
    if (!confirm('Bu özelliği silmek istediğinize emin misiniz?')) return
    try {
      await $api(`/api/v1/admin/category-attributes/${id}`, { method: 'DELETE' })
      toast.success('Özellik silindi')
      fetchAttributes()
    } catch (error) {
      console.error('Delete Surplus Attribute Error:', error)
      toast.error('Özellik silinirken hata oluştu')
    }
  }

  onMounted(() => {
    fetchCategory()
    fetchAttributes()
  })

  return {
    category, attributes, loading, showModal, editingAttribute, optionsInput, attrForm, typeLabels, parsedOptions,
    openCreateModal, openEditModal, closeModal, saveAttribute, deleteAttribute
  }
}
