// apps/frontend/composables/useSurplusForm.ts

import { ref, watch } from 'vue'
import type { SurplusItem } from '~/types/surplus'

interface SurplusFormState {
  companyId:        string
  title:            string
  description:      string
  category:         string
  materialType:     string
  quantity:         number
  unit:             string
  unitPrice:        number
  images:           string[]
  location:         string
  wantedCategories: string[]
  tradeModes:       string[]
  technicalSpecs:   Record<string, unknown>
}

interface SurplusCategory {
  id:       string
  name:     string
  parentId: string | null
  slug?:    string
}

interface SurplusAttribute {
  name:    string
  type:    string
  options?: string[]
}

interface PriceAdvisorResponse {
  success:     boolean
  suggestion?: number
  min?:        number
  max?:        number
}

function mapToPilotCity(location: string | null | undefined): string {
  if (!location) return 'ISTANBUL'
  const cityPart = location.split('/')[0].trim().toUpperCase()
  
  if (cityPart.includes('İSTANBUL') || cityPart.includes('ISTANBUL')) return 'ISTANBUL'
  if (cityPart.includes('ANKARA')) return 'ANKARA'
  if (cityPart.includes('İZMİR') || cityPart.includes('IZMIR')) return 'IZMIR'
  if (cityPart.includes('HATAY')) return 'HATAY'
  
  return 'ISTANBUL'
}

export const useSurplusForm = (item: SurplusItem | null = null) => {
  const { $api }           = useApi()
  const toast              = useNuxtApp().$toast
  const { resolveImageUrl } = useAppImage()

  const loading    = ref(false)
  const submitting = ref(false)
  const newImageUrl = ref('')

  const formData = ref<SurplusFormState>({
    companyId:        '',
    title:            '',
    description:      '',
    category:         '',
    materialType:     '',
    quantity:         0,
    unit:             'KG',
    unitPrice:        0,
    images:           [],
    location:         '',
    wantedCategories: [],
    tradeModes:       ['barter'],
    technicalSpecs:   {},
  })

  const surplusCategories    = ref<SurplusCategory[]>([])
  const mainCategories       = ref<SurplusCategory[]>([])
  const subCategories1       = ref<SurplusCategory[]>([])
  const subCategories2       = ref<SurplusCategory[]>([])
  const selectedMainCategory = ref('')
  const selectedSubCategory1 = ref('')
  const selectedSubCategory2 = ref('')
  const surplusAttributes    = ref<SurplusAttribute[]>([])
  const technicalSpecsList   = ref<Array<{ key: string; value: string }>>([{ key: '', value: '' }])

  const priceAdvisorData    = ref<PriceAdvisorResponse | null>(null)
  const priceAdvisorLoading = ref(false)
  let advisorTimer: ReturnType<typeof setTimeout> | null = null

  const units = ['KG', 'ADET', 'METRE', 'TON', 'PAKET', 'PALET']
  const tradeModeOptions = [
    { value: 'barter', label: 'Sadece Takas',  desc: 'Sadece ürün karşılığı takas kabul edilir.' },
    { value: 'cash',   label: 'Sadece Satış',  desc: 'Ürün sadece nakit ödeme ile satılır.' },
    { value: 'mixed',  label: 'Karma Takas',   desc: 'Ürün + Nakit farkı şeklinde takas kabul edilir.' },
  ]

  const initialize = async (): Promise<void> => {
    loading.value = true
    try {
      await fetchCategoriesData()
      if (item) {
        formData.value = {
          ...formData.value,
          ...item,
          quantity:         Number(item.quantity || 0),
          unitPrice:        Number(item.unitPrice || 0),
          images:           [...(item.images ?? [])],
          wantedCategories: [...(item.wantedCategories ?? [])],
          tradeModes:       [...(item.tradeModes ?? ['barter'])],
          technicalSpecs:   (item.technicalSpecs as Record<string, unknown>) ?? {},
        }
        technicalSpecsList.value = Object.entries(formData.value.technicalSpecs).map(([key, value]) => ({
          key,
          value: String(value),
        }))
        if (technicalSpecsList.value.length === 0) technicalSpecsList.value = [{ key: '', value: '' }]
        await syncCategoriesFromItem()
      } else {
        await fetchMyCompany()
      }
    } finally {
      loading.value = false
    }
  }

  const fetchCategoriesData = async (): Promise<void> => {
    const res = await $api<SurplusCategory[]>('/api/v1/surplus/categories', { query: { all: true } })
    if (res.success && res.data) {
      surplusCategories.value = res.data
      mainCategories.value    = res.data.filter(c => !c.parentId)
    }
  }

  const fetchMyCompany = async (): Promise<void> => {
    const res = await $api<{ success: boolean; company?: { id?: string; city?: string; district?: string } }>('/api/v1/companies/me')
    if (res.success && res.company) {
      formData.value.companyId = res.company.id ?? ''
      formData.value.location  = `${res.company.city ?? ''} / ${res.company.district ?? ''}`.trim()
    }
  }

  const syncCategoriesFromItem = async (): Promise<void> => {
    // category alanı ID veya isim olabilir (backend ID saklar) — ikisini de dene
    const main = mainCategories.value.find(
      c => c.id === formData.value.category || c.name === formData.value.category
    )
    if (main) {
      selectedMainCategory.value  = main.id
      formData.value.category     = main.name  // görüntüleme için isme normalize et
      subCategories1.value        = surplusCategories.value.filter(c => c.parentId === main.id)
      const sub1 = subCategories1.value.find(
        c => c.id === formData.value.materialType || c.name === formData.value.materialType
      )
      if (sub1) {
        selectedSubCategory1.value = sub1.id
        subCategories2.value       = surplusCategories.value.filter(c => c.parentId === sub1.id)
        const sub2 = subCategories2.value.find(
          c => c.id === formData.value.materialType || c.name === formData.value.materialType
        )
        if (sub2) selectedSubCategory2.value = sub2.id
      }
      await fetchSurplusAttributes(selectedSubCategory2.value || selectedSubCategory1.value || selectedMainCategory.value)
    }
  }

  const handleMainCategoryChange = (): void => {
    selectedSubCategory1.value = ''
    selectedSubCategory2.value = ''
    subCategories1.value       = surplusCategories.value.filter(c => c.parentId === selectedMainCategory.value)
    subCategories2.value       = []
    updateCategoryNames()
    fetchSurplusAttributes(selectedMainCategory.value)
  }

  const handleSubCategory1Change = (): void => {
    selectedSubCategory2.value = ''
    subCategories2.value       = surplusCategories.value.filter(c => c.parentId === selectedSubCategory1.value)
    updateCategoryNames()
    fetchSurplusAttributes(selectedSubCategory1.value || selectedMainCategory.value)
  }

  const updateCategoryNames = (): void => {
    const main = mainCategories.value.find(c => c.id === selectedMainCategory.value)
    const sub1 = subCategories1.value.find(c => c.id === selectedSubCategory1.value)
    const sub2 = subCategories2.value.find(c => c.id === selectedSubCategory2.value)
    formData.value.category     = main?.name ?? ''
    formData.value.materialType = sub2?.name ?? sub1?.name ?? ''
  }

  const fetchSurplusAttributes = async (categoryId: string): Promise<void> => {
    if (!categoryId) return
    try {
      const res = await $api<SurplusAttribute[]>(`/api/v1/surplus/categories/${categoryId}/attributes`)
      if (res.success && res.data) {
        surplusAttributes.value = res.data
        res.data.forEach(attr => {
          if (formData.value.technicalSpecs[attr.name] === undefined) {
            formData.value.technicalSpecs[attr.name] =
              attr.type === 'checkbox'    ? false :
              attr.type === 'multiselect' ? []    : ''
          }
        })
      }
    } catch {
      surplusAttributes.value = []
    }
  }

  const checkMarketPrice = (): void => {
    if (!formData.value.title || formData.value.title.length < 3) {
      priceAdvisorData.value = null
      return
    }
    if (advisorTimer) clearTimeout(advisorTimer)
    advisorTimer = setTimeout(async () => {
      priceAdvisorLoading.value = true
      try {
        const res = await $api<PriceAdvisorResponse>('/api/v1/price-advisor/check', {
          query: { title: formData.value.title, price: formData.value.unitPrice },
        })
        if (res.success) priceAdvisorData.value = res
      } catch {
        priceAdvisorData.value = null
      } finally {
        priceAdvisorLoading.value = false
      }
    }, 1500)
  }

  watch(() => [formData.value.title, formData.value.unitPrice], checkMarketPrice)

  const processFiles = async (files: File[]): Promise<void> => {
    const limit = 5 - (formData.value.images?.length ?? 0)
    for (const file of files.slice(0, limit)) {
      if (file.size > 5 * 1024 * 1024) continue
      const data = new FormData()
      data.append('file', file)
      const res = await $api<{ success: boolean; url?: string; data?: { publicUrl?: string } }>('/api/v1/upload?type=product', {
        method: 'POST',
        body:   data,
      })
      const uploadedUrl = res.url ?? res.data?.publicUrl
      if (res.success && uploadedUrl) formData.value.images.push(uploadedUrl)
    }
  }

  const submitForm = async (): Promise<boolean> => {
    if (!formData.value.title || !formData.value.category || !formData.value.quantity) {
      toast.error('Lütfen zorunlu alanları doldurun')
      return false
    }

    submitting.value = true
    try {
      const finalSpecs = { ...formData.value.technicalSpecs }
      technicalSpecsList.value.forEach(s => {
        if (s.key.trim()) finalSpecs[s.key.trim()] = s.value.trim()
      })

      const payload = {
        title:            formData.value.title,
        description:      formData.value.description,
        categoryId:       selectedSubCategory2.value || selectedSubCategory1.value || selectedMainCategory.value,
        category:         formData.value.category,
        quantity:         Number(formData.value.quantity),
        unit:             formData.value.unit,
        unitPrice:        Number(formData.value.unitPrice),
        images:           formData.value.images,
        city:             mapToPilotCity(formData.value.location),
        materialType:     formData.value.materialType,
        location:         formData.value.location,
        technicalSpecs:   finalSpecs,
        tradeModes:       formData.value.tradeModes,
        wantedCategories: formData.value.wantedCategories,
      }

      const url    = item ? `/api/v1/surplus/${item.id}` : '/api/v1/surplus'
      const method = item ? 'PATCH'                     : 'POST'
      const res    = await $api<{ success: boolean }>(url, { method, body: payload })

      if (res.success) {
        toast.success(item ? 'İlan güncellendi!' : 'İlanınız onaya gönderildi!')
        return true
      }
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message ?? 'İşlem sırasında hata oluştu'
      toast.error(msg)
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
    processFiles, submitForm, resolveImageUrl,
  }
}
