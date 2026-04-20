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

export const useTradeOffer = (props: any, emit: any) => {
  const { $api } = useApi()
  const myItems = ref<any[]>([])
  const submitting = ref(false)
  const legalAccepted = ref(false)
  const showLegalModal = ref(false)

  const formData = ref({
    fromCompanyId: '',
    toCompanyId: props.isCounter ? props.originalOffer?.fromCompanyId : props.item?.companyId,
    offeredItemId: props.isCounter ? props.originalOffer?.requestedItemId : '',
    requestedItemId: props.isCounter ? props.originalOffer?.offeredItemId : props.item?.id,
    offeredQuantity: props.isCounter ? props.originalOffer?.requestedQuantity : 0,
    requestedQuantity: props.isCounter ? props.originalOffer?.offeredQuantity : props.item?.quantity,
    cashDifference: props.isCounter ? -(props.originalOffer?.cashDifference ?? 0) : 0,
    message: ''
  })

  const selectedItem = computed(() =>
    myItems.value.find(it => it.id === formData.value.offeredItemId)
  )

  const selectedItemAvailable = computed(() => selectedItem.value?.availableQuantity ?? 0)
  const selectedItemUnit = computed(() => selectedItem.value?.unit ?? 'ADET')

  watch(() => formData.value.offeredItemId, (newVal) => {
    if (newVal && selectedItem.value && formData.value.offeredQuantity === 0) {
      formData.value.offeredQuantity = selectedItem.value.availableQuantity
    }
  })

  const fetchMyCompanyAndItems = async () => {
    try {
      // Cast to `any` — backend returns non-standard shape: { success, company } not { success, data }
      const compRes = (await $api<any>('/api/companies/me')) as any
      if (compRes.success && compRes.company) {
        formData.value.fromCompanyId = compRes.company.id
        const itemsRes = (await $api<any>('/api/surplus', {
          query: { companyId: compRes.company.id, status: 'active' }
        })) as any
        if (itemsRes.success) {
          myItems.value = (itemsRes.items || itemsRes.data || [])
            .map((item: any) => ({ ...item, availableQuantity: item.quantity - (item.blockedQuantity || 0) }))
            .filter((item: any) => item.availableQuantity > 0)
        }
      }
    } catch (e) {
      console.error('TradeOffer fetch error:', e)
    }
  }

  const acceptLegal = () => {
    legalAccepted.value = true
    showLegalModal.value = false
  }

  const submitOffer = async () => {
    const toast = useNuxtApp().$toast as any
    if (submitting.value) return
    if (!legalAccepted.value) { toast.error('Lütfen Dijital Takas Taahhütnamesini onaylayın.'); return }
    if (formData.value.offeredQuantity <= 0 || formData.value.requestedQuantity <= 0) {
      toast.error("Lütfen geçerli miktarlar girin (0'dan büyük olmalıdır)."); return
    }
    submitting.value = true
    try {
      const endpoint = props.isCounter ? `/api/offers/${props.originalOffer.id}/counter` : '/api/offers'
      const response = await $api(endpoint, { method: 'POST', body: { ...formData.value, legalAccepted: true } })
      if (response.success) {
        toast.success(props.isCounter ? 'Karşı teklifiniz gönderildi!' : 'Takas teklifiniz gönderildi!')
        emit('success')
      }
    } catch (error: any) {
      toast.error(error.data?.message || 'Teklif gönderilirken bir hata oluştu.')
    } finally {
      submitting.value = false
    }
  }

  const getMainImage = (item: any) => {
    if (item?.images?.length > 0) {
      const img = item.images[0]
      return typeof img === 'string' ? img : img.url
    }
    return '/placeholder-surplus.jpg'
  }

  onMounted(fetchMyCompanyAndItems)

  return {
    myItems, submitting, legalAccepted, showLegalModal,
    formData, selectedItem, selectedItemAvailable, selectedItemUnit,
    acceptLegal, submitOffer, getMainImage, LEGAL_TEXT
  }
}
