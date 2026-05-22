import { ref, computed, onMounted } from 'vue'

export const useSurplusCategoryAttributes = (categoryId: string) => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast
  
  const category = ref<Record<string, unknown> | null>(null)
  const attributes = ref<Record<string, unknown>[]>([])
  const loading = ref(false)
  const showModal = ref(false)
  const editingAttribute = ref<Record<string, unknown> | null>(null)
  const optionsInput = ref('')

  const typeLabels: Record<string, string> = {
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
      const response = await $api<{ data: Record<string, unknown> }>(`/api/v1/admin/surplus-categories/${categoryId}`)
      category.value = response.data
    } catch {
      /* sessiz hata */
    }
  }

  // Fetch attributes with surplusCategoryId
  const fetchAttributes = async () => {
    loading.value = true
    try {
      const response = await $api<{ data: Record<string, unknown>[] }>('/api/v1/admin/category-attributes', {
        query: { surplusCategoryId: categoryId }
      })
      attributes.value = response.data || []
    } catch {
      /* sessiz hata */
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

  const openEditModal = (attr: Record<string, unknown>) => {
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
      const response = await $api<{ success: boolean }>(url, {
        method,
        body: { ...attrForm.value, surplusCategoryId: categoryId }
      })

      if (response.success) {
        toast.success(editingAttribute.value ? 'Özellik güncellendi!' : 'Özellik eklendi!')
        closeModal()
        fetchAttributes()
      }
    } catch (error: unknown) {
      toast.error((error as { data?: { error?: string } }).data?.error || 'Özellik kaydedilirken hata oluştu')
    }
  }

  const deleteAttribute = async (id: string) => {
    if (!confirm('Bu özelliği silmek istediğinize emin misiniz?')) return
    try {
      await $api(`/api/v1/admin/category-attributes/${id}`, { method: 'DELETE' })
      toast.success('Özellik silindi')
      fetchAttributes()
    } catch {
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
