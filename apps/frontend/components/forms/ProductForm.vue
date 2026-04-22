<script setup lang="ts">
import { useProductForm } from '#imports'

// Props
const props = defineProps({
  userRole: { type: String, required: true },
  productId: { type: String, default: null },
  initialData: { type: Object, default: () => ({}) }
})

defineEmits(['save'])

// ViewModel
const vm = useProductForm({
  productId: props.productId,
  initialData: props.initialData
})

const {
  form,
  sections,
  flags,
  activeSection,
  isEditing,
  foundCatalogProduct,
  isBarcodeChecking,
  newImageUrl,
  categoryAttributes,
  mainCategories,
  subCategories1,
  subCategories2,
  selectedMainCategory,
  selectedSubCategory1,
  selectedSubCategory2,
  scrollToSection,
  isSectionComplete,
  handleFileUpload,
  addImageUrl,
  removeImage,
  setAsMain,
  handleMainCategoryChange,
  handleSubCategory1Change,
  handleSubCategory2Change,
  validateForm
} = vm

// Exposed Methods
defineExpose({
  form,
  saveProduct: async () => {
    return validateForm()
  }
})
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-6">
    <!-- Left: Navigation (Sticky) -->
    <ProductFormNavigation
      :sections="sections"
      :active-section="activeSection"
      :is-section-complete="isSectionComplete"
      @navigate="scrollToSection"
    />

    <!-- Right: Form Content -->
    <div class="flex-1 space-y-8 pb-24 text-black">
      <!-- 1. Identity -->
      <ProductFormIdentity
        v-model:barcode="form.barcode"
        v-model:model-code="form.modelCode"
        :product-id="productId"
        :is-barcode-checking="isBarcodeChecking"
        :found-catalog-product="foundCatalogProduct"
      />

      <!-- 2. Basic Info -->
      <ProductFormBasics
        v-model:name="form.name"
        v-model:brand="form.brand"
        v-model:product-type="form.productType"
        v-model:selected-main-category="selectedMainCategory as any"
        v-model:selected-sub-category1="selectedSubCategory1 as any"
        v-model:selected-sub-category2="selectedSubCategory2 as any"
        :found-catalog-product="foundCatalogProduct"
        :is-editing="isEditing"
        :main-categories="mainCategories as any"
        :sub-categories1="subCategories1 as any"
        :sub-categories2="subCategories2 as any"
        @change:main-category="handleMainCategoryChange"
        @change:sub-category1="handleSubCategory1Change"
        @change:sub-category2="handleSubCategory2Change"
      />

      <!-- 3. Dynamic Attributes -->
      <ProductFormAttributes
        v-model:technical-specifications="form.technicalSpecifications"
        :category-attributes="categoryAttributes"
        :found-catalog-product="foundCatalogProduct"
        :is-editing="isEditing"
      />

      <!-- 4. Content & Specs -->
      <ProductFormContent
        v-model:description="form.description"
        v-model:technical-specifications-raw="form.technicalSpecificationsRaw"
        :found-catalog-product="foundCatalogProduct"
        :is-editing="isEditing"
      />

      <!-- 5. Media -->
      <ProductFormMedia
        v-model:new-image-url="newImageUrl"
        :product-images="form.productImages"
        :found-catalog-product="foundCatalogProduct"
        :is-editing="isEditing"
        @upload="handleFileUpload"
        @add-image-url="addImageUrl"
        @remove-image="removeImage"
        @set-as-main="setAsMain"
      />

      <!-- 6. Listing Details -->
      <ProductFormInventory
        v-model:price="form.price"
        v-model:compare-at-price="form.compareAtPrice"
        v-model:cost-per-item="form.costPerItem"
        v-model:stock="form.stock"
        v-model:sku="form.sku"
        v-model:track-inventory="form.trackInventory"
        v-model:continue-selling-out-of-stock="form.continueSellingOutOfStock"
        :product-id="productId"
      />

      <!-- 7. Logistics -->
      <ProductFormLogistics
        v-model:requires-shipping="form.requiresShipping"
        v-model:weight="form.weight"
        v-model:volume="form.volume"
      />

      <!-- 8. BazarX Private -->
      <ProductFormEcosystem
        v-if="userRole === 'admin' || userRole === 'vendor'"
        v-model:visibility="form.visibility"
        v-model:min-market-price="form.minMarketPrice"
        v-model:max-purchase-per-member="form.maxPurchasePerMember"
      />

      <!-- 9. Marketing & Visibility -->
      <ProductFormMarketing
        v-model:badge-text="form.badgeText"
        v-model:badge-color="form.badgeColor"
        v-model:meta-title="form.metaTitle"
        v-model:meta-description="form.metaDescription"
        v-model:handle="form.handle"
        v-model:form="form as any"
        :flags="flags as any"
      />

      <!-- Bottom Button (Floating on Mobile) -->
      <div class="fixed bottom-0 left-0 right-0 lg:hidden p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-50">
        <button
          class="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-200"
          @click="$emit('save')"
        >
          {{ isEditing ? 'ÜRÜNÜ GÜNCELLE' : 'ÜRÜNÜ YAYINLA' }}
        </button>
      </div>
    </div>
  </div>
</template>