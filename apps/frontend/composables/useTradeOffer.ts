// apps/frontend/composables/useTradeOffer.ts

import { ref, computed, watch, onMounted } from 'vue'
import { useNuxtApp } from '#app'
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

interface OfferFormData {
  fromCompanyId: string
  toCompanyId: string | undefined
  offeredItemId: string
  requestedItemId: string | undefined
  offeredQuantity: number
  requestedQuantity: number | undefined
  cashDifference: number
  message: string
}

export const useTradeOffer = (props: TradeOfferProps, emit: (event: string) => void) => {
  const { $api } = useApi()
  const myItems    = ref<SurplusListItem[]>([])
  const submitting = ref(false)
  const legalAccepted  = ref(false)
  const showLegalModal = ref(false)

  const formData = ref<OfferFormData>({
    fromCompanyId:     '',
    toCompanyId:       props.isCounter ? props.originalOffer?.fromCompanyId : props.item?.companyId,
    offeredItemId:     props.isCounter ? (props.originalOffer?.requestedItemId ?? '') : '',
    requestedItemId:   props.isCounter ? props.originalOffer?.offeredItemId    : props.item?.id,
    offeredQuantity:   props.isCounter ? (props.originalOffer?.requestedQuantity ?? 0) : 0,
    requestedQuantity: props.isCounter ? props.originalOffer?.offeredQuantity : props.item?.quantity,
    cashDifference:    props.isCounter ? -(props.originalOffer?.cashDifference ?? 0) : 0,
    message: '',
  })

  const selectedItem = computed((): SurplusListItem | undefined =>
    myItems.value.find(it => it.id === formData.value.offeredItemId)
  )

  const selectedItemAvailable = computed((): number => selectedItem.value?.availableQuantity ?? 0)
  const selectedItemUnit      = computed((): string => selectedItem.value?.unit ?? 'ADET')

  watch(() => formData.value.offeredItemId, (newVal) => {
    if (newVal && selectedItem.value && formData.value.offeredQuantity === 0) {
      formData.value.offeredQuantity = selectedItem.value.availableQuantity
    }
  })

  const fetchMyCompanyAndItems = async (): Promise<void> => {
    try {
      const compRes = await $api<CompanyResponse>('/api/v1/companies/me')
      const company = (compRes as CompanyResponse).company ?? compRes.data
      if (compRes.success && company) {
        formData.value.fromCompanyId = company.id
        const itemsRes = await $api<SurplusListResponse>('/api/v1/surplus', {
          query: { companyId: company.id, status: 'active' },
        })
        if (itemsRes.success) {
          const raw = (itemsRes as SurplusListResponse).items ?? itemsRes.data ?? []
          myItems.value = raw
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

  const submitOffer = async (): Promise<void> => {
    const toast = useNuxtApp().$toast as { error: (msg: string) => void; success: (msg: string) => void }
    if (submitting.value) return
    if (!legalAccepted.value) { toast.error('Lütfen Dijital Takas Taahhütnamesini onaylayın.'); return }
    if (formData.value.offeredQuantity <= 0 || (formData.value.requestedQuantity ?? 0) <= 0) {
      toast.error("Lütfen geçerli miktarlar girin (0'dan büyük olmalıdır)."); return
    }
    submitting.value = true
    try {
      const endpoint = props.isCounter
        ? `/api/v1/offers/${props.originalOffer!.id}/counter`
        : '/api/v1/offers'
      const response = await $api<{ success: boolean }>(endpoint, {
        method: 'POST',
        body: { ...formData.value, legalAccepted: true },
      })
      if (response.success) {
        toast.success(props.isCounter ? 'Karşı teklifiniz gönderildi!' : 'Takas teklifiniz gönderildi!')
        emit('success')
      }
    } catch (error: unknown) {
      const msg = (error as { data?: { message?: string } })?.data?.message ?? 'Teklif gönderilirken bir hata oluştu.'
      toast.error(msg)
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
    formData, selectedItem, selectedItemAvailable, selectedItemUnit,
    acceptLegal, submitOffer, getMainImage, LEGAL_TEXT,
  }
}
