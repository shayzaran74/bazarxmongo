<template>
  <div class="product-detail-page py-8 lg:py-20">
    <div v-if="loading" class="container mx-auto px-4 space-y-12 animate-pulse">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div class="aspect-square bg-slate-100 rounded-[3rem]" />
        <div class="space-y-6">
          <div class="h-4 bg-slate-100 rounded w-1/4" />
          <div class="h-12 bg-slate-100 rounded w-3/4" />
          <div class="h-4 bg-slate-100 rounded w-full" />
          <div class="h-20 bg-slate-100 rounded w-full" />
        </div>
      </div>
    </div>

    <div v-else-if="product" class="container mx-auto px-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        <!-- Left: Gallery -->
        <div class="lg:sticky lg:top-32">
          <ProductGallery 
            :images="product.images || [product.image]" 
            :product-name="product.name"
          />
        </div>

        <!-- Right: Info -->
        <div class="space-y-10">
          <ProductBreadcrumb 
            :category="product.category" 
            :product-name="product.name" 
          />
          
          <ProductInfo :product="product" />

          <div class="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
            <UiButton size="lg" class="flex-grow group" @click="handleAddToCart">
              <Icon name="heroicons:shopping-bag" class="w-5 h-5 mr-3 group-hover:bounce" />
              {{ $t('products.detail.addToCart') }}
            </UiButton>
            <UiButton variant="secondary" size="lg" class="flex-grow group">
              {{ $t('products.detail.buyNow') }}
              <Icon name="heroicons:arrow-right" class="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
            </UiButton>
          </div>

          <!-- Vendor Card -->
          <div v-if="product.vendor" class="bg-slate-50 rounded-[2.5rem] p-8 flex items-center justify-between border border-white">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-white rounded-2xl p-2 shadow-sm flex items-center justify-center">
                <img :src="product.vendor.logo || '/images/vendor-fallback.png'" class="max-w-full max-h-full object-contain" />
              </div>
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ $t('products.detail.vendor') }}</p>
                <h4 class="text-xl font-display font-black text-slate-800 italic tracking-tighter">{{ product.vendor.businessName || 'Satıcı' }}</h4>
              </div>
            </div>
            <NuxtLink :to="`/vendors/${product.vendor.slug}`">
              <UiButton variant="ghost" size="sm">{{ $t('products.detail.visitStore') }}</UiButton>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Bottom: Tabs/Description -->
      <div class="mt-20 lg:mt-32 pt-20 border-t border-slate-100">
        <div class="max-w-4xl mx-auto space-y-12 text-center lg:text-left">
          <h3 class="text-3xl font-display font-black text-slate-800 italic tracking-tighter leading-none">
            {{ $t('products.detail.description') }}
          </h3>
          <div class="prose prose-slate max-w-none text-slate-500 font-medium leading-relaxed" v-html="product.description" />
        </div>
      </div>
      
      <!-- Bottom: Related Products -->
      <div class="mt-20 lg:mt-32">
        <div class="flex items-center justify-between mb-12">
          <h3 class="text-3xl font-display font-black text-slate-800 italic tracking-tighter leading-none">
            {{ $t('products.detail.relatedProducts') }}
          </h3>
        </div>
        <ProductGrid :products="relatedProducts" :loading="loadingRelated" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { product, loading, relatedProducts, loadingRelated, fetchRelated } = useProduct(slug)
const { $toast } = useNuxtApp()
const { t } = useI18n()

onMounted(async () => {
  await fetchRelated()
})

function handleAddToCart() {
  $toast.success(t('products.detail.addToCartSuccess') || 'Ürün sepete eklendi!')
}

useAppSeo({
  title: product.value?.name,
  description: product.value?.shortDescription || product.value?.description?.substring(0, 160),
  image: product.value?.image
})
</script>
