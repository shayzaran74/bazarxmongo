import { ref, computed, watch } from 'vue'

export const useSurplusForm = (item: any = null) => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast
  const { resolveImageUrl } = useAppImage()

  const loading = ref(false)
  const submitting = ref(false)
  const newImageUrl = ref('')

  const formData = ref({
    companyId: '',
    title: '',
    description: '',
    category: '',
    materialType: '',
    quantity: 0,
    unit: 'KG',
    unitPrice: 0,
    images: [] as string[],
    location: '',
    wantedCategories: [] as string[],
    tradeModes: ['barter'],
    technicalSpecs: {} as Record<string, any>
  })

  // Category State
  const surplusCategories = ref<any[]>([])
  const mainCategories = ref<any[]>([])
  const subCategories1 = ref<any[]>([])
  const subCategories2 = ref<any[]>([])
  const selectedMainCategory = ref('')
  const selectedSubCategory1 = ref('')
  const selectedSubCategory2 = ref('')
  const surplusAttributes = ref<any[]>([])

  // Technical Specs List (for dynamic inputs)
  const technicalSpecsList = ref([{ key: '', value: '' }])

  // Price Advisor State
  const priceAdvisorData = ref<any>(null)
  const priceAdvisorLoading = ref(false)
  let advisorTimer: any = null

  const units = ['KG', 'ADET', 'METRE', 'TON', 'PAKET', 'PALET']
  const tradeModeOptions = [
    { value: 'barter', label: 'Sadece Takas', desc: 'Sadece ürün karşılığı takas kabul edilir.' },
    { value: 'cash', label: 'Sadece Satış', desc: 'Ürün sadece nakit ödeme ile satılır.' },
    { value: 'mixed', label: 'Karma Takas', desc: 'Ürün + Nakit farkı şeklinde takas kabul edilir.' }
  ]

  // Initialize Data
  const initialize = async () => {
    loading.value = true
    try {
      await fetchCategoriesData()
      if (item) {
        formData.value = {
          ...formData.value,
          ...item,
          images: [...(item.images || [])],
          wantedCategories: [...(item.wantedCategories || [])],
          tradeModes: [...(item.tradeModes || ['barter'])],
          technicalSpecs: item.technicalSpecs || {}
        }
        technicalSpecsList.value = Object.entries(formData.value.technicalSpecs).map(([key, value]) => ({ key, value }))
        if (technicalSpecsList.value.length === 0) technicalSpecsList.value = [{ key: '', value: '' }]
        
        // Match Categories
        await syncCategoriesFromItem()
      } else {
        await fetchMyCompany()
      }
    } finally {
      loading.value = false
    }
  }

  const fetchCategoriesData = async () => {
    const res = await $api('/api/surplus/categories', { query: { all: true } })
    if (res.success) {
      surplusCategories.value = res.data
      mainCategories.value = surplusCategories.value.filter(c => !c.parentId)
    }
  }

  const fetchMyCompany = async () => {
    const res = await $api('/api/companies/me')
    if (res.success && res.company) {
      formData.value.companyId = res.company.id
      formData.value.location = `${res.company.city} / ${res.company.district}`
    }
  }

  const syncCategoriesFromItem = async () => {
    const main = mainCategories.value.find(c => c.name === formData.value.category)
    if (main) {
      selectedMainCategory.value = main.id
      subCategories1.value = surplusCategories.value.filter(c => c.parentId === main.id)
      const sub1 = subCategories1.value.find(c => c.name === formData.value.materialType)
      if (sub1) {
        selectedSubCategory1.value = sub1.id
        subCategories2.value = surplusCategories.value.filter(c => c.parentId === sub1.id)
        const sub2 = subCategories2.value.find(c => c.name === formData.value.materialType)
        if (sub2) selectedSubCategory2.value = sub2.id
      }
      await fetchSurplusAttributes(selectedSubCategory2.value || selectedSubCategory1.value || selectedMainCategory.value)
    }
  }

  const handleMainCategoryChange = () => {
    selectedSubCategory1.value = ''
    selectedSubCategory2.value = ''
    subCategories1.value = surplusCategories.value.filter(c => c.parentId === selectedMainCategory.value)
    subCategories2.value = []
    updateCategoryNames()
    fetchSurplusAttributes(selectedMainCategory.value)
  }

  const handleSubCategory1Change = () => {
    selectedSubCategory2.value = ''
    subCategories2.value = surplusCategories.value.filter(c => c.parentId === selectedSubCategory1.value)
    updateCategoryNames()
    fetchSurplusAttributes(selectedSubCategory1.value || selectedMainCategory.value)
  }

  const updateCategoryNames = () => {
    const main = mainCategories.value.find(c => c.id === selectedMainCategory.value)
    const sub1 = subCategories1.value.find(c => c.id === selectedSubCategory1.value)
    const sub2 = subCategories2.value.find(c => c.id === selectedSubCategory2.value)
    formData.value.category = main?.name || ''
    formData.value.materialType = sub2?.name || sub1?.name || ''
  }

  const fetchSurplusAttributes = async (categoryId: string) => {
    if (!categoryId) return
    const res = await $api(`/api/surplus/categories/${categoryId}/attributes`)
    if (res.success) {
      surplusAttributes.value = res.data
      res.data.forEach((attr: any) => {
        if (formData.value.technicalSpecs[attr.name] === undefined) {
          formData.value.technicalSpecs[attr.name] = attr.type === 'checkbox' ? false : attr.type === 'multiselect' ? [] : ''
        }
      })
    }
  }

  // Price Advisor
  const checkMarketPrice = () => {
    if (!formData.value.title || formData.value.title.length < 3) {
      priceAdvisorData.value = null
      return
    }
    if (advisorTimer) clearTimeout(advisorTimer)
    advisorTimer = setTimeout(async () => {
      priceAdvisorLoading.value = true
      try {
        const res = await $api('/api/price-advisor/check', {
          query: { title: formData.value.title, price: formData.value.unitPrice }
        })
        if (res.success) priceAdvisorData.value = res
      } finally {
        priceAdvisorLoading.value = false
      }
    }, 1500)
  }

  watch(() => [formData.value.title, formData.value.unitPrice], checkMarketPrice)

  // Media Logic
  const processFiles = async (files: File[]) => {
    const limit = 5 - (formData.value.images?.length || 0)
    for (const file of files.slice(0, limit)) {
      if (file.size > 5 * 1024 * 1024) continue
      const data = new FormData()
      data.append('image', file)
      const res = await $api(`/api/upload?type=product`, { method: 'POST', body: data })
      if (res.success) formData.value.images.push(res.url)
    }
  }

  const submitForm = async () => {
    submitting.value = true
    try {
      // Merge custom specs
      const finalSpecs = { ...formData.value.technicalSpecs }
      technicalSpecsList.value.forEach(s => {
        if (s.key.trim()) finalSpecs[s.key.trim()] = s.value.trim()
      })
      
      const url = item ? `/api/surplus/${item.id}` : '/api/surplus'
      const method = item ? 'PATCH' : 'POST'
      const res = await $api(url, { method, body: { ...formData.value, technicalSpecs: finalSpecs } })
      
      if (res.success) {
        toast.success(item ? 'İlan güncellendi!' : 'İlanınız onaya gönderildi!')
        return true
      }
    } catch (e) {
      toast.error('İşlem sırasında hata oluştu')
    } finally {
      submitting.value = false
    }
    return false
  }

  return {
    formData, loading, submitting, newImageUrl,
    mainCategories, subCategories1, subCategories2,
    selectedMainCategory, selectedSubCategory1, selectedSubCategory2,
    surplusAttributes, technicalSpecsList,
    priceAdvisorData, priceAdvisorLoading,
    units, tradeModeOptions, surplusCategories,
    initialize, handleMainCategoryChange, handleSubCategory1Change, 
    processFiles, submitForm, resolveImageUrl
  }
}
