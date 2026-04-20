import { ref, computed } from 'vue'
import { debounce } from 'lodash-es'
import { iller } from '~/assets/css/data/component/iller'

export const useAdminSideAds = () => {
  const { $api } = useApi()
  const nuxtApp = useNuxtApp()
  const route = useRoute()
  
  const loading = ref(false)
  const saving = ref(false)
  const sideAds = ref<any[]>([])
  
  const localLeftAds = ref<any[]>([])
  const localRightAds = ref<any[]>([])
  
  const currentEcosystem = computed(() => (route.query.ecosystem as string) || 'GLOBAL')

  const fetchAds = async () => {
    loading.value = true
    try {
      const res: any = await $api(`/api/admin/side-ads?ecosystem=${currentEcosystem.value}`)
      sideAds.value = res.data || []
      localLeftAds.value = sideAds.value.filter(ad => ad.side === 'LEFT').sort((a, b) => a.order - b.order)
      localRightAds.value = sideAds.value.filter(ad => ad.side === 'RIGHT').sort((a, b) => a.order - b.order)
    } catch (e) {
      nuxtApp.$toast.error('Reklamlar yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const deleteAd = async (id: string) => {
    if (!confirm('Bu reklamı silmek istediğinize emin misiniz?')) return
    try {
      await $api(`/api/admin/side-ads/${id}`, { method: 'DELETE' })
      nuxtApp.$toast.success('Reklam silindi')
      await fetchAds()
    } catch (e) {
      nuxtApp.$toast.error('Hata oluştu')
    }
  }

  const handleDragEnd = async () => {
    const updatedAds = [
      ...localLeftAds.value.map((ad, idx) => ({ ...ad, order: idx })),
      ...localRightAds.value.map((ad, idx) => ({ ...ad, order: idx }))
    ]
    try {
      await Promise.all(updatedAds.map(ad => $api(`/api/admin/side-ads/${ad.id}`, { method: 'PUT', body: ad })))
      nuxtApp.$toast.success('Sıralama güncellendi')
    } catch (e) {
      console.error('Reorder update failed')
    }
  }

  const parseLocationsToTags = (locations: any[]) => {
    if (!locations || locations.length === 0) return { city: '', district: '' }
    const tags = locations.map(l => l.tag)
    const districtTag = tags.find(t => t.includes('-'))
    if (districtTag) {
      const [city, district] = districtTag.split('-')
      return { city, district }
    }
    return { city: tags[0] || '', district: '' }
  }

  return {
    loading, saving, sideAds, localLeftAds, localRightAds, currentEcosystem,
    fetchAds, deleteAd, handleDragEnd, parseLocationsToTags
  }
}
