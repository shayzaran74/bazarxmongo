<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900">
          💰 Wallet System Test
        </h1>
        <p class="text-gray-600 mt-2">
          Test all payment methods and wallet functionality
        </p>
      </div>

      <!-- Current Balance -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Current Balance
        </h2>
        <div class="text-3xl font-bold text-green-600">
          {{ formatPrice(balance) }}
        </div>
        <button
          class="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          @click="refreshBalance"
        >
          🔄 Refresh Balance
        </button>
      </div>

      <!-- Payment Method Tests -->
      <div class="grid md:grid-cols-3 gap-6 mb-6">
        <!-- Bank Transfer -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            🏦 Bank Transfer Test
          </h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              v-model.number="testAmounts.bankTransfer"
              type="number"
              min="1"
              step="1"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100"
            >
          </div>
          <button
            :disabled="!testAmounts.bankTransfer || testAmounts.bankTransfer <= 0"
            class="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="testBankTransfer"
          >
            Test Bank Transfer
          </button>
        </div>

        <!-- EFT -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            💳 EFT Test
          </h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              v-model.number="testAmounts.eft"
              type="number"
              min="1"
              step="1"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="100"
            >
            <p class="text-xs text-gray-500 mt-1">
              + 2₺ EFT fee
            </p>
          </div>
          <button
            :disabled="!testAmounts.eft || testAmounts.eft <= 0"
            class="w-full bg-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="testEFT"
          >
            Test EFT
          </button>
        </div>

        <!-- Credit Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            💳 Credit Card Test
          </h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              v-model.number="testAmounts.creditCard"
              type="number"
              min="1"
              step="1"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="100"
            >
            <p class="text-xs text-gray-500 mt-1">
              + 3% + 1₺ card fee
            </p>
          </div>
          <button
            :disabled="!testAmounts.creditCard || testAmounts.creditCard <= 0"
            class="w-full bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="testCreditCard"
          >
            Test Credit Card
          </button>
        </div>
      </div>

      <!-- Wallet Transfer Test -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          💸 Wallet Transfer Test
        </h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Amount to Transfer</label>
            <input
              v-model.number="transferAmount"
              type="number"
              min="0.01"
              step="0.01"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="10.00"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              v-model="transferDescription"
              type="text"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Test transfer"
            >
          </div>
        </div>
        <button
          :disabled="!transferAmount || transferAmount <= 0 || !transferDescription"
          class="mt-4 bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="testWalletTransfer"
        >
          Test Wallet Transfer
        </button>
      </div>

      <!-- Recent Transactions -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Recent Transactions
          </h3>
          <button
            class="text-blue-600 hover:text-blue-800 text-sm"
            @click="fetchTransactions"
          >
            🔄 Refresh
          </button>
        </div>

        <div
          v-if="transactions.length === 0"
          class="text-center py-8 text-gray-500"
        >
          No transactions yet
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <div
            v-for="transaction in transactions"
            :key="transaction.id"
            class="flex items-center justify-between p-3 border rounded-lg"
            :class="{
              'border-green-200 bg-green-50': transaction.type === 'CREDIT',
              'border-red-200 bg-red-50': transaction.type === 'DEBIT'
            }"
          >
            <div>
              <p
                class="font-medium"
                :class="{
                  'text-green-800': transaction.type === 'CREDIT',
                  'text-red-800': transaction.type === 'DEBIT'
                }"
              >
                {{ transaction.type === 'CREDIT' ? '+' : '-' }}{{ formatPrice(transaction.amount) }}
              </p>
              <p class="text-sm text-gray-600">
                {{ transaction.description }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatDate(transaction.createdAt) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">
                {{ formatPrice(transaction.balanceAfter) }}
              </p>
              <p class="text-xs text-gray-500">
                Balance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Layout
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Page meta
useHead({
  title: 'Wallet System Test - E-Commerce Platform',
  meta: [
    { name: 'description', content: 'Test comprehensive wallet system functionality' }
  ]
})

// State
const balance = ref(0)
const transactions = ref([])
const testAmounts = ref({
  bankTransfer: 100,
  eft: 100,
  creditCard: 100
})
const transferAmount = ref(10)
const transferDescription = ref('Test transfer')

// Composables
const authStore = useAuthStore()
const { $api } = useApi()
const toast = useNuxtApp().$toast

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('tr-TR')
}

const refreshBalance = async () => {
  try {
    const response = await $api('/api/wallet')

    if (response.success) {
      balance.value = response.data.balance
    }
  } catch (error) {
    toast.error('Failed to refresh balance')
  }
}

const fetchTransactions = async () => {
  try {
    const response = await $api('/api/wallet/transactions?limit=10')

    if (response.success) {
      transactions.value = response.data
    }
  } catch (error) {
    toast.error('Failed to fetch transactions')
  }
}

// Test functions
const testBankTransfer = () => {
  const amount = testAmounts.value.bankTransfer
  const reference = `TEST-BT-${Date.now()}`
  const url = `/payment/bank-transfer?amount=${amount}&reference=${reference}`
  window.open(url, '_blank')
}

const testEFT = () => {
  const amount = testAmounts.value.eft
  const reference = `TEST-EFT-${Date.now()}`
  const url = `/payment/eft?amount=${amount}&reference=${reference}`
  window.open(url, '_blank')
}

const testCreditCard = () => {
  const amount = testAmounts.value.creditCard
  const url = `/payment/credit-card?amount=${amount}`
  window.open(url, '_blank')
}

const testWalletTransfer = async () => {
  try {
    const response = await $api('/api/wallet/transfer', {
      method: 'POST',
      body: {
        amount: transferAmount.value,
        description: transferDescription.value,
        reference: `TEST-TRANSFER-${Date.now()}`
      }
    })

    if (response.success) {
      toast.success('Wallet transfer successful!')
      await refreshBalance()
      await fetchTransactions()
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    toast.error(error.message || 'Transfer failed')
  }
}

// Initialize
onMounted(async () => {
  await authStore.init()
  if (!authStore.isLoggedIn) {
    await navigateTo('/login')
    return
  }

  await refreshBalance()
  await fetchTransactions()
})
</script>