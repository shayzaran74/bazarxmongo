import { ref, computed } from 'vue'
import { useAppImage } from '~/composables/useAppImage'

export const useProductGallery = (product: any) => {
  const { resolveImageUrl } = useAppImage()
  const selectedImage = ref<string | null>(null)

  const allImages = computed(() => {
    if (!product.value) return []
    if (product.value.images && product.value.images.length > 0) {
      return product.value.images.map((img: string) => resolveImageUrl(img))
    }
    const images: string[] = []
    if (product.value.image) images.push(resolveImageUrl(product.value.image))
    return images
  })

  const setInitialImage = () => {
    if (product.value?.image) {
      selectedImage.value = resolveImageUrl(product.value.image)
    }
  }

  return { selectedImage, allImages, setInitialImage, resolveImageUrl }
}
