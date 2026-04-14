<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <h1 class="text-3xl font-bold mb-6">
      Product Test Page
    </h1>

    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">
        Route Information
      </h2>
      <p><strong>Route Path:</strong> {{ route.path }}</p>
      <p><strong>Route Params:</strong> {{ JSON.stringify(route.params) }}</p>
      <p><strong>Product ID:</strong> {{ route.params.id }}</p>

      <div class="mt-6">
        <h2 class="text-xl font-semibold mb-4">
          Test Links
        </h2>
        <ul class="space-y-2">
          <li>
            <NuxtLink
              to="/products/d6f137ab-f685-4465-9f7c-db518b8c5a90"
              class="text-blue-600 hover:text-blue-800 underline"
            >
              PlayStation 5 Product Page
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/products"
              class="text-blue-600 hover:text-blue-800 underline"
            >
              All Products Page
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="mt-6">
        <h2 class="text-xl font-semibold mb-4">
          Direct API Test
        </h2>
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          :disabled="loading"
          @click="testApi"
        >
          {{ loading ? 'Testing...' : 'Test Product API' }}
        </button>

        <div
          v-if="apiResult"
          class="mt-4 p-4 bg-gray-100 rounded"
        >
          <h3 class="font-semibold">
            API Result:
          </h3>
          <pre class="text-sm overflow-auto">{{ apiResult }}</pre>
        </div>

        <div
          v-if="apiError"
          class="mt-4 p-4 bg-red-100 text-red-700 rounded"
        >
          <h3 class="font-semibold">
            API Error:
          </h3>
          <p>{{ apiError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { $api } = useApi()
const loading = ref(false)
const apiResult = ref(null)
const apiError = ref(null)

const testApi = async () => {
  loading.value = true
  apiResult.value = null
  apiError.value = null

  try {
    const response = await $api('/api/products/d6f137ab-f685-4465-9f7c-db518b8c5a90')
    apiResult.value = JSON.stringify(response, null, 2)
  } catch (error) {
    apiError.value = error.message || 'API request failed'
    console.error('API test error:', error)
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Product Test - E-Commerce Platform'
})
</script>