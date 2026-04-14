<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <NuxtLink
              to="/vendor/products"
              class="text-gray-500 hover:text-gray-700 mr-4"
            >
              <ChevronLeftIcon class="h-5 w-5" />
            </NuxtLink>
            <h1 class="text-xl font-semibold text-gray-900">
              {{ isEditing ? 'Ürünü Düzenle' : 'Ürün Ekle' }}
            </h1>
            <div
              v-if="!isEditing"
              class="ml-4 flex items-center"
            >
              <span class="text-xs text-gray-500">Veya</span>
              <NuxtLink
                to="/vendor/products"
                class="ml-2 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Toplu Excel Yükle →
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <NuxtLink
              to="/vendor/products"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              İptal
            </NuxtLink>
            <button
              :disabled="saving"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              @click="handleSave"
            >
              {{ saving ? 'Kaydediliyor...' : 'Kaydet' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductForm
        ref="productFormRef"
        user-role="vendor"
        :product-id="productId"
        @save="handleSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import ProductForm from '~/components/forms/ProductForm.vue'
import type { Product, ApiResponse } from '@barterborsa/shared-types'

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

const route = useRoute()
const isEditing = computed(() => !!route.query.id)
const saving = ref(false)
const productFormRef = ref<InstanceType<typeof ProductForm> | null>(null)

const productId = computed(() => route.query.id as string | undefined)

const handleSave = async () => {
  if (!productFormRef.value) return
  
  saving.value = true
  try {
    const isValid = await productFormRef.value.saveProduct()
    if (!isValid) return
    
    const formData = productFormRef.value.form
    const toast = useNuxtApp().$toast
    
    // Client-side validation for Price Floor
    if (formData.minMarketPrice && formData.price < formData.minMarketPrice) {
      toast.error(`Ürün fiyatı (${formData.price} TL), belirlenen taban fiyattan (${formData.minMarketPrice} TL) düşük olamaz.`)
      return
    }

    const { $api } = useApi()
    const url = isEditing.value 
      ? `/api/vendors/products/${route.query.id}`
      : '/api/vendors/products'
    
    const method = isEditing.value ? 'PUT' : 'POST'
    
    const payload = {
      ...formData,
      image: formData.image || (formData.productImages?.[0]) || 'https://placehold.co/300x300?text=Ürün+Resmi',
      description: formData.description || '',
      maxPurchasePerMember: formData.maxPurchasePerMember || 0
    }

    const response = await $api<ApiResponse<Product>>(url, {
      method,
      body: payload
    })

    if (response.success) {
      toast.success(isEditing.value ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!')
      await navigateTo('/vendor/products')
    }
  } catch (err: unknown) {
    console.error('Error saving product:', err)
    const toast = useNuxtApp().$toast
    const errorMessage = (err as { data?: { error?: string } })?.data?.error || 'Ürün kaydedilirken bir hata oluştu'
    toast.error(errorMessage)
  } finally {
    saving.value = false
  }
}
</script>
