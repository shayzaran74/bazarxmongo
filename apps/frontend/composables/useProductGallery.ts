import { ref, computed } from 'vue'
import { useAppImage } from '~/composables/useAppImage'

export const useProductGallery = (product: any) => {
  const { resolveImageUrl } = useAppImage()
  const selectedImage = ref<string | null>(null)

  const allImages = computed(() => {
    if (!product.value) return []
    const imgs: string[] = []
    // 1. images dizisi
    if (Array.isArray(product.value.images) && product.value.images.length) {
      imgs.push(...product.value.images)
    }
    // 2. Tek image alanı
    if (product.value.image) imgs.push(resolveImageUrl(product.value.image))
    // 3. media dizisi (Prisma media tablosu)
    if (Array.isArray(product.value.media) && product.value.media.length) {
      imgs.push(...product.value.media.map((m: { url: string }) => resolveImageUrl(m.url)))
    }
    // 4. productMedia dizisi (alternatif ad)
    if (Array.isArray(product.value.productMedia) && product.value.productMedia.length) {
      imgs.push(...product.value.productMedia.map((m: { url: string }) => resolveImageUrl(m.url)))
    }
    return [...new Set(imgs.filter(Boolean))]
  })

  const setInitialImage = () => {
    if (product.value?.image) {
      selectedImage.value = resolveImageUrl(product.value.image)
    }
  }

  return { selectedImage, allImages, setInitialImage, resolveImageUrl }
}
