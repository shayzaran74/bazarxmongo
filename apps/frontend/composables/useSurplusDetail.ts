// apps/frontend/composables/useSurplusDetail.ts

import { ref, onMounted } from 'vue'

interface SurplusSpec {
  label: string
  value: string
}

interface SurplusDetailItem {
  id: string
  title: string
  description?: string
  category?: string
  quantity: number
  unit: string
  unitPrice?: number
  status: string
  images?: string[]
  city?: string
  location?: string
  technicalSpecs?: Record<string, unknown>
  wantedCategories?: string[]
  tradeModes?: string[]
  companyId?: string
  company?: { id: string; name: string }
  createdAt?: string
}

export const useSurplusDetail = () => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast

  const item    = ref<SurplusDetailItem | null>(null)
  const loading = ref(true)
  const submitting = ref(false)
  const error404 = ref(false)

  const fetchDetail = async (id: string): Promise<void> => {
    loading.value = true
    error404.value = false
    try {
      const response = await $api<{ success: boolean; data: SurplusDetailItem }>(`/api/v1/surplus/${id}`)
      if (response.success) {
        item.value = response.data ?? null
      }
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 404) error404.value = true
    } finally {
      loading.value = false
    }
  }

  const contactOwner = async (): Promise<void> => {
    toast.info('İletişim özelliği yakında aktif edilecek.')
  }

  return { item, loading, submitting, error404, fetchDetail, contactOwner }
}
