<template>
  <div class="min-h-screen bg-[#fafafa]">
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin/products" class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all">
            <ChevronLeftIcon class="h-5 w-5" />
          </NuxtLink>
          <div>
            <h1 class="text-xl font-black text-gray-900 uppercase italic italic leading-none">{{ isEditing ? 'Ürünü GÜNCELLE' : 'Yeni ÜRÜN EKLE' }}</h1>
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 italic">Katalog & Envanter Yönetimi</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button 
            :disabled="saving"
            class="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            @click="saveProduct"
          >
            <div v-if="saving" class="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
            {{ saving ? 'KAYDEDİLİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Identity -->
          <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Ürün Başlığı *</label>
              <input v-model="form.name" type="text" class="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-black focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner">
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Açıklama</label>
              <textarea v-model="form.description" rows="8" class="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none shadow-inner"></textarea>
            </div>
          </div>

          <ProductMediaManager :images="form.productImages" @upload="handleFileUpload" @remove="i => form.productImages.splice(i, 1)" @set-main="i => { const item = form.productImages.splice(i,1)[0]; form.productImages.unshift(item); form.image = item }" />
          
          <ProductPricingInventory v-model="form" />
          
          <ProductShipping v-model="form" />

          <ProductSEO v-model="form" />
        </div>

        <!-- Right Column -->
        <div class="space-y-8">
          <!-- Status -->
          <div class="bg-gray-900 rounded-3xl p-8 shadow-2xl text-white">
            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Ürün Durumu</h3>
            <select v-model="form.isActive" class="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 transition-all">
              <option :value="true" class="text-gray-900">AKTİF (YAYINDA)</option>
              <option :value="false" class="text-gray-900">TASLAK (GİZLİ)</option>
            </select>
          </div>

          <ProductOrganization 
            v-model="form"
            :main-categories="mainCategories"
            :sub1-categories="subCategories1"
            :sub2-categories="subCategories2"
            v-model:main-id="selectedMainCategory"
            v-model:sub1-id="selectedSubCategory1"
            v-model:sub2-id="selectedSubCategory2"
          />

          <!-- Internal Tags -->
          <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 class="text-sm font-black text-gray-900 uppercase italic mb-6">Etiketler & <span class="text-indigo-600">Arama</span></h3>
            <textarea v-model="form.tags" rows="3" placeholder="Virgülle ayırın..." class="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none"></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { useProductForm } from '~/composables/useProductForm'
import { useAdminProductService } from '~/services/api/AdminProductService'

import ProductMediaManager from '~/components/admin/products/ProductMediaManager.vue'
import ProductOrganization from '~/components/admin/products/ProductOrganization.vue'
import ProductPricingInventory from '~/components/admin/products/ProductPricingInventory.vue'
import ProductSEO from '~/components/admin/products/ProductSEO.vue'
import ProductShipping from '~/components/admin/products/ProductShipping.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const { $toast } = useNuxtApp()
const adminProductService = useAdminProductService()

const isEditing = computed(() => !!route.query.id)
const saving = ref(false)

// useProductForm kategorileri kendi içinde (onMounted) yükler; ayrıca burada çağırmaya gerek yok.
const {
  form,
  handleFileUpload,
  mainCategories,
  subCategories1,
  subCategories2,
  selectedMainCategory,
  selectedSubCategory1,
  selectedSubCategory2,
  handleMainCategoryChange,
  handleSubCategory1Change,
  handleSubCategory2Change,
  validateForm,
} = useProductForm({ productId: route.query.id })

// Kademeli kategori seçimi: ProductOrganization v-model ref'i günceller,
// alt kategori listelerinin ve form.categoryId'nin yeniden hesaplanması için handler'ları tetikle.
watch(selectedMainCategory, () => handleMainCategoryChange())
watch(selectedSubCategory1, () => handleSubCategory1Change())
watch(selectedSubCategory2, () => handleSubCategory2Change())

// Global ValidationPipe forbidNonWhitelisted aktif — yalnızca CreateAdminProductDto alanları gönderilir.
const buildPayload = () => ({
  name: form.name,
  description: form.description || '',
  brandName: form.brand || undefined,
  categoryId: form.categoryId || undefined,
  price: Number(form.price) || 0,
  stock: Number(form.stock) || 0,
  status: form.isActive ? 'ACTIVE' : 'DRAFT',
  sku: form.sku || undefined,
  barcode: form.barcode || undefined,
  modelCode: form.modelCode || undefined,
  images: Array.isArray(form.productImages) ? form.productImages : [],
  isFeatured: !!form.isFeatured,
  isSpecialOffer: !!form.isSpecialOffer,
  isFlashSale: !!form.isFlashSale,
})

const saveProduct = async () => {
  if (!validateForm()) return

  saving.value = true
  try {
    const payload = buildPayload()
    const res = isEditing.value
      ? await adminProductService.updateProduct(route.query.id, payload)
      : await adminProductService.createProduct(payload)

    if (res.success) {
      $toast.success(isEditing.value ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!')
      await navigateTo('/admin/products')
    } else {
      $toast.error(res.error || res.message || 'Ürün kaydedilemedi')
    }
  } catch (err) {
    const message = err?.data?.message || err?.data?.error || 'Ürün kaydedilirken bir hata oluştu'
    $toast.error(message)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* Hidden internal toggle for form visuals */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
