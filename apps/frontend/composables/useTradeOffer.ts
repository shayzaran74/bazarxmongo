// apps/frontend/composables/useTradeOffer.ts

import { ref, computed, watch, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

export const LEGAL_TEXT = `BAZARX DİJİTAL TAKAS VE TESLİM TAAHHÜTNAMESİ

1. TARAFLAR VE KONU: İşbu taahhütname, BazarX platformu üzerinden gerçekleştirilen dairesel veya karşılıklı takas işlemlerinde; gönderici firmanın mal teslimini, alıcı firmanın kabul şartlarını ve platformun "Güvenli Takas Havuzu" (X-Secure Step) işleyişini düzenler.

2. X-SECURE STEP VE NAKİT BLOKE:
* İşlem hacminin %20'si oranındaki tutar, "Teminat Bedeli" olarak BazarX hesabında bloke edilir.
* Bu bedel, işlemin 5. aşaması başarıyla tamamlandığında, ilgili Tier seviyesine ait hizmet komisyonu kesildikten sonra kullanıcıya iade edilir.

3. YERİNDE STOK VE TESLİM TAAHHÜDÜ:
* Gönderici, takasa konu olan ürünlerin mülkiyetinin kendisine ait olduğunu, ürünlerin beyan edilen teknik özelliklere sahip olduğunu ve kendi deposunda (on-site) sevkiyata hazır bulunduğunu beyan eder.

4. CAYMA VE TAZMİNAT:
* Takas süreci başladıktan sonra, geçerli bir mücbir sebep olmaksızın sevkiyatı durduran tarafın %20'lik Nakit Blokesi irat kaydedilir.

5. DİJİTAL ONAYIN BAĞLAYICILIĞI:
* İşbu formun dijital olarak onaylanması, 6098 sayılı Türk Borçlar Kanunu uyarınca ıslak imzalı taahhütname hükmündedir.

6. KVKK: Veriler yalnızca eşleşme ve işlem güvenliği için işlenir. 12 ay sonra anonimleştirilir.`

interface TradeOfferProps {
  isCounter?: boolean
  originalOffer?: {
    id: string
    fromCompanyId?: string
    requestedItemId?: string
    offeredItemId?: string
    requestedQuantity?: number
    offeredQuantity?: number
    cashDifference?: number
  }
  item?: {
    id: string
    companyId?: string
    quantity?: number
  }
}

interface SurplusListItem {
  id: string
  title: string
  quantity: number
  blockedQuantity?: number
  unit?: string
  images?: string[]
  availableQuantity: number
}

interface CompanyResponse {
  success: boolean
  company?: { id: string }
  data?: { id: string }
}

interface SurplusListResponse {
  success: boolean
  items?: SurplusListItem[]
  data?: SurplusListItem[]
}

interface SelectedOfferItem {
  surplusItemId: string
  quantity: number
}

interface OfferFormData {
  fromCompanyId: string
  toCompanyId: string | undefined
  offeredItems: SelectedOfferItem[]
  requestedItems: SelectedOfferItem[]
  cashAmount: number
  cashDirection: string
  message: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useTradeOffer = (props: TradeOfferProps) => {
  const { $api } = useApi()
  const nuxt      = useNuxtApp()
  const myItems    = ref<SurplusListItem[]>([])
  const submitting = ref(false)
  const legalAccepted  = ref(false)
  const showLegalModal = ref(false)

  const formData = ref<OfferFormData>({
    fromCompanyId:   '',
    toCompanyId:     props.isCounter ? props.originalOffer?.fromCompanyId : props.item?.companyId,
    offeredItems:    [],
    requestedItems:  props.item?.id
      ? [{ surplusItemId: props.item.id, quantity: props.item.quantity ?? 1 }]
      : [],
    cashAmount:   0,
    cashDirection: 'NONE',
    message:     '',
  })

  const selectedItems = computed((): SurplusListItem[] =>
    formData.value.offeredItems
      .map(o => myItems.value.find(it => it.id === o.surplusItemId))
      .filter(Boolean) as SurplusListItem[]
  )

  const totalOfferedValue = computed((): number =>
    selectedItems.value.reduce((acc, it) => acc + (it.quantity ?? 0) * (it.availableQuantity > 0 ? 1 : 0), 0)
  )

  const selectedItem = computed((): SurplusListItem | undefined => selectedItems.value[0])
  const selectedItemAvailable = computed((): number => selectedItem.value?.availableQuantity ?? 0)
  const selectedItemUnit      = computed((): string => selectedItem.value?.unit ?? 'ADET')

  watch(() => formData.value.offeredItems, (newVal) => {
    if (newVal.length === 0) {
      formData.value.offeredItems = []
    }
  }, { deep: true })

  const fetchMyCompanyAndItems = async (): Promise<void> => {
    try {
      const compRes = await $api<CompanyResponse>('/api/v1/companies/me')
      const company = (compRes as CompanyResponse).company ?? (compRes as { data?: { id: string } }).data
      if (compRes.success && company) {
        formData.value.fromCompanyId = (company as { id: string }).id
        const itemsRes = await $api<SurplusListResponse>('/api/v1/surplus', {
          query: { companyId: (company as { id: string }).id, status: 'active' },
        })
        if (itemsRes.success) {
          const raw = (itemsRes as SurplusListResponse).items ?? (itemsRes as { data?: SurplusListItem[] }).data ?? []
          myItems.value = (raw as SurplusListItem[])
            .map(item => ({ ...item, availableQuantity: item.quantity - (item.blockedQuantity ?? 0) }))
            .filter(item => item.availableQuantity > 0)
        }
      }
    } catch { /* hata filtresi tarafından işlenir */ }
  }

  const acceptLegal = (): void => {
    legalAccepted.value = true
    showLegalModal.value = false
  }

  const emit = defineEmits<{
    success: []
    close: []
  }>()

  const submitOffer = async (): Promise<void> => {
    const toast = nuxt.$toast as { error: (msg: string) => void; success: (msg: string) => void } | undefined
    if (submitting.value) return
    if (!legalAccepted.value) { toast?.error('Lütfen Dijital Takas Taahhütnamesini onaylayın.'); return }
    if (formData.value.offeredItems.length === 0) {
      toast?.error('Lütfen en az bir ürün seçin.'); return
    }
    if (formData.value.requestedItems.length === 0) {
      toast?.error('Lütfen en az bir istenen ürün belirtin.'); return
    }
    const totalOfferedQty = formData.value.offeredItems.reduce((a, o) => a + o.quantity, 0)
    if (totalOfferedQty <= 0) {
      toast?.error('Miktar sıfırdan büyük olmalıdır.'); return
    }
    submitting.value = true
    try {
      const endpoint = props.isCounter
        ? `/api/v1/offers/${props.originalOffer!.id}/counter`
        : '/api/v1/offers'
      const body: Record<string, unknown> = {
        toCompanyId:     formData.value.toCompanyId,
        offeredItems:    formData.value.offeredItems,
        requestedItems:  formData.value.requestedItems,
        cashAmount:      formData.value.cashAmount,
        cashDirection:   formData.value.cashDirection,
        message:         formData.value.message,
        legalAccepted:   true,
      }
      const response = await $api<{ success: boolean }>(endpoint, { method: 'POST', body })
      if (response.success) {
        toast?.success(props.isCounter ? 'Karşı teklifiniz gönderildi!' : 'Takas teklifiniz gönderildi!')
        emit('success')
      }
    } catch (error: unknown) {
      const msg = (error as { data?: { message?: string } })?.data?.message ?? 'Teklif gönderilirken bir hata oluştu.'
      toast?.error(msg)
    } finally {
      submitting.value = false
    }
  }

  const getMainImage = (item: SurplusListItem): string => {
    if (item?.images?.length) {
      const img = item.images[0]
      return typeof img === 'string' ? img : (img as { url?: string })?.url ?? '/placeholder-surplus.jpg'
    }
    return '/placeholder-surplus.jpg'
  }

  onMounted(fetchMyCompanyAndItems)

  return {
    myItems, submitting, legalAccepted, showLegalModal,
    formData, selectedItems, selectedItem, selectedItemAvailable, selectedItemUnit,
    acceptLegal, submitOffer, getMainImage, LEGAL_TEXT,
  }
}
