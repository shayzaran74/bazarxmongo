<template>
  <div class="space-y-8">
    <!-- Calculator Card -->
    <div class="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
      <!-- Main Header -->
      <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <component
              :is="activeCalculatorIcon"
              class="w-7 h-7"
            />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">
              {{ activeCalculatorName }}
            </h2>
            <p class="text-sm text-gray-500">
              {{ activeCalculatorDesc }}
            </p>
          </div>
        </div>

        <!-- Calculator Selector Pills -->
        <div class="flex bg-gray-200/50 p-1 rounded-xl">
          <button
            v-for="(calc, key) in calculators"
            :key="key"
            :class="{ 'bg-white text-orange-600 shadow-sm': activeCalculator === key, 'text-gray-500 hover:text-gray-700': activeCalculator !== key }"
            class="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap"
            @click="activeCalculator = key"
          >
            {{ calc.shortName }}
          </button>
        </div>
      </div>

      <div class="p-8">
        <!-- 1. COMMISSION CALCULATOR -->
        <div
          v-show="activeCalculator === 'commission'"
          class="animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <!-- Title -->
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ platforms.find(p => p.id ===
                selectedPlatform)?.name }} Komisyon Hesaplama
            </h2>
            <p class="text-gray-500 mt-2">
              {{ platforms.find(p => p.id === selectedPlatform)?.name }} ürün
              komisyonlarını en doğru ve kolay şekilde hesaplamak için aşağıdaki komisyon hesaplama
              aracını kullanabilirsiniz.
            </p>
          </div>

          <!-- Platform Tabs - Matching Reference Image -->
          <div class="flex flex-wrap justify-center gap-3 mb-10 border-b border-gray-200 pb-6">
            <button
              v-for="p in platforms"
              :key="p.id"
              :class="{
                'bg-orange-500 text-white shadow-lg': selectedPlatform === p.id,
                'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600': selectedPlatform !== p.id
              }"
              class="flex items-center gap-2 py-2.5 px-5 rounded-full text-sm font-bold transition-all duration-200"
              @click="selectedPlatform = p.id"
            >
              <span
                class="w-5 h-5 rounded"
                :class="getPlatformColor(p.id)"
              />
              {{ p.name }}
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <!-- Left Side - Form Inputs -->
            <div class="space-y-6">
              <!-- Category / Commission -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Ürün Kategorisi /
                  Komisyon</label>
                <select
                  v-model="selectedCategoryRate"
                  class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900"
                >
                  <option
                    v-for="cat in currentPlatformCategories"
                    :key="cat.name"
                    :value="cat.rate"
                  >
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <!-- Commission Rate Display -->
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 font-medium">Komisyon Oranı:</span>
                  <span class="text-xl font-bold text-orange-600">%{{ selectedCategoryRate }}</span>
                </div>
              </div>

              <!-- Purchase Price -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Alış Fiyatı</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                  <input
                    v-model.number="costPrice"
                    type="number"
                    class="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900"
                    placeholder="0"
                  >
                </div>
              </div>

              <!-- Sale Price -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Satış Fiyatı</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                  <input
                    v-model.number="price"
                    type="number"
                    class="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900"
                    placeholder="0"
                  >
                </div>
              </div>

              <!-- KDV Rate -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">KDV Miktarı</label>
                <div class="flex gap-2">
                  <button
                    v-for="rate in [20, 10, 1]"
                    :key="rate"
                    :class="{ 'bg-orange-500 text-white': kdvRate === rate, 'bg-white border border-gray-300 text-gray-600 hover:border-orange-300': kdvRate !== rate }"
                    class="flex-1 py-2.5 rounded-lg font-bold transition-colors"
                    @click="kdvRate = rate"
                  >
                    %{{ rate }}
                  </button>
                  <button
                    :class="{ 'bg-orange-500 text-white': showCustomKdv, 'bg-white border border-gray-300 text-gray-600 hover:border-orange-300': !showCustomKdv }"
                    class="flex-1 py-2.5 rounded-lg font-bold transition-colors"
                    @click="showCustomKdv = !showCustomKdv"
                  >
                    Diğer
                  </button>
                </div>
                <input
                  v-if="showCustomKdv"
                  v-model.number="kdvRate"
                  type="number"
                  class="w-full mt-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                  placeholder="Özel KDV oranı..."
                >
              </div>

              <!-- Shipping Cost -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Kargo Ücreti</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                  <input
                    v-model.number="shippingCost"
                    type="number"
                    class="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900"
                    placeholder="0"
                  >
                  <label class="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <input
                      v-model="kdvIncluded"
                      type="checkbox"
                      class="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    >
                    KDV Dahil
                  </label>
                </div>
              </div>

              <!-- Shipping Responsibility -->
              <div class="flex gap-3">
                <button
                  :class="{ 'bg-orange-50 border-orange-500 text-orange-700': shippingPayer === 'seller', 'bg-white border-gray-300 text-gray-600': shippingPayer !== 'seller' }"
                  class="flex-1 py-3 px-4 border rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  @click="shippingPayer = 'seller'"
                >
                  <span
                    class="w-4 h-4 rounded-full border-2"
                    :class="shippingPayer === 'seller' ? 'border-orange-500 bg-orange-500' : 'border-gray-400'"
                  />
                  Kargo Satıcıya Ait
                </button>
                <button
                  :class="{ 'bg-orange-50 border-orange-500 text-orange-700': shippingPayer === 'buyer', 'bg-white border-gray-300 text-gray-600': shippingPayer !== 'buyer' }"
                  class="flex-1 py-3 px-4 border rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  @click="shippingPayer = 'buyer'"
                >
                  <span
                    class="w-4 h-4 rounded-full border-2"
                    :class="shippingPayer === 'buyer' ? 'border-orange-500 bg-orange-500' : 'border-gray-400'"
                  />
                  Kargo Alıcıya Ait
                </button>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-4">
                <button
                  class="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  @click="resetForm"
                >
                  <ArrowPathIcon class="w-5 h-5" />
                  Temizle
                </button>
                <button
                  class="flex-1 py-3 px-6 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg"
                >
                  Hesapla
                </button>
              </div>
            </div>

            <!-- Right Side - Results -->
            <div class="space-y-6">
              <!-- Results Card -->
              <div
                class="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 rounded-2xl p-6"
              >
                <div class="flex items-center gap-3 mb-6">
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center"
                    :class="getPlatformBgColor(selectedPlatform)"
                  >
                    <CalculatorIcon class="w-5 h-5 text-white" />
                  </div>
                  <h3 class="font-bold text-gray-900">
                    {{ platforms.find(p => p.id ===
                      selectedPlatform)?.name }} Hesaplama Sonucu
                  </h3>
                </div>

                <div class="space-y-4">
                  <div class="flex justify-between items-center py-3 border-b border-orange-200/50">
                    <span class="text-gray-600">Satış Fiyatı <span class="text-orange-600">(KDV
                      Dahil)</span></span>
                    <span class="font-bold text-gray-900 text-lg">₺{{ formatNumber(price || 0)
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center py-3 border-b border-orange-200/50">
                    <span class="text-gray-600">Satış Fiyatı <span class="text-orange-600">(KDV
                      Hariç)</span></span>
                    <span class="font-bold text-gray-900 text-lg">₺{{
                      formatNumber(priceExcludingVat) }}</span>
                  </div>
                  <div class="flex justify-between items-center py-3 border-b border-orange-200/50">
                    <span class="text-gray-600">Komisyon Tutarı <span class="text-orange-600">(%{{
                      selectedCategoryRate }})</span></span>
                    <span class="font-bold text-red-500 text-lg">-₺{{ formatNumber(commissionAmount)
                    }}</span>
                  </div>
                  <div
                    v-if="shippingPayer === 'seller'"
                    class="flex justify-between items-center py-3 border-b border-orange-200/50"
                  >
                    <span class="text-gray-600">Kargo Ücreti</span>
                    <span class="font-bold text-red-500 text-lg">-₺{{ formatNumber(shippingCost ||
                      0) }}</span>
                  </div>
                  <div
                    class="flex justify-between items-center py-4 bg-white rounded-xl px-4 mt-4 shadow-sm"
                  >
                    <span class="font-bold text-gray-900 text-lg">Net Kazanç</span>
                    <span
                      class="font-black text-2xl"
                      :class="netEarnings >= 0 ? 'text-green-600' : 'text-red-600'"
                    >₺{{
                      formatNumber(netEarnings) }}</span>
                  </div>
                </div>
              </div>

              <!-- Promo Card -->
              <div
                class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white flex items-center gap-6"
              >
                <div class="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpenIcon class="w-10 h-10 text-white" />
                </div>
                <div>
                  <p class="text-purple-200 text-sm mb-1">
                    ÜCRETSİZ
                  </p>
                  <h4 class="font-bold text-lg mb-3">
                    {{ platforms.find(p => p.id ===
                      selectedPlatform)?.name }} satışlarınızı artırmak için ücretsiz e-kitabımızı
                    indirin!
                  </h4>
                  <button
                    class="bg-white text-purple-700 py-2 px-4 rounded-lg font-bold text-sm hover:bg-purple-50 transition-colors"
                  >
                    Ücretsiz İndirin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. DESI CALCULATOR -->
        <div
          v-show="activeCalculator === 'desi'"
          class="animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div class="space-y-6">
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">En (cm)</label>
                  <input
                    v-model.number="desiWidth"
                    type="number"
                    class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                    placeholder="0"
                  >
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Boy (cm)</label>
                  <input
                    v-model.number="desiLength"
                    type="number"
                    class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                    placeholder="0"
                  >
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Yükseklik (cm)</label>
                  <input
                    v-model.number="desiHeight"
                    type="number"
                    class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                    placeholder="0"
                  >
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Bölen Katsayısı (Standart:
                  3000)</label>
                <select
                  v-model="desiDivisor"
                  class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option :value="3000">
                    Yurtiçi Standart (3000)
                  </option>
                  <option :value="5000">
                    Uluslararası (5000)
                  </option>
                </select>
              </div>
            </div>

            <div
              class="bg-gray-50 rounded-2xl p-6 lg:p-8 flex flex-col justify-center border border-gray-100 text-center"
            >
              <h3 class="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">
                HESAPLANAN DESİ
              </h3>
              <div class="text-5xl font-black text-orange-600 mb-4">
                {{ calculatedDesi }}
              </div>
              <p class="text-sm text-gray-500">
                Formül: (En x Boy x Yükseklik) / {{ desiDivisor }}
              </p>
            </div>
          </div>
        </div>

        <!-- 3. SHIPPING FEE CALCULATOR -->
        <div
          v-show="activeCalculator === 'shipping'"
          class="animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <p class="text-gray-500 mb-6 bg-blue-50 p-4 rounded-xl text-sm border border-blue-100">
            <InformationCircleIcon class="w-5 h-5 inline-block mr-1 text-blue-500 -mt-0.5" />
            Kargo fiyatları firmalar arası değişiklik gösterir. Aşağıdaki hesaplama ortalama piyasa
            değerlerine göre tahmini bir sonuç verir.
          </p>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Gönderi Desisi veya Ağırlığı
                  (kg)</label>
                <div class="relative">
                  <input
                    v-model.number="shippingDesi"
                    type="number"
                    class="w-full pl-4 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                    placeholder="Örn: 5"
                  >
                  <span
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold"
                  >Desi/Kg</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Gönderi Tipi</label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    :class="{ 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500': shippingType === 'standard', 'bg-white border-gray-200 text-gray-600 hover:border-orange-300': shippingType !== 'standard' }"
                    class="p-3 border rounded-xl text-sm font-bold transition-all"
                    @click="shippingType = 'standard'"
                  >
                    Standart
                  </button>
                  <button
                    :class="{ 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500': shippingType === 'express', 'bg-white border-gray-200 text-gray-600 hover:border-orange-300': shippingType !== 'express' }"
                    class="p-3 border rounded-xl text-sm font-bold transition-all"
                    @click="shippingType = 'express'"
                  >
                    Hızlı / Express
                  </button>
                </div>
              </div>
            </div>

            <div
              class="bg-gray-50 rounded-2xl p-6 lg:p-8 flex flex-col justify-center border border-gray-100"
            >
              <div class="space-y-4">
                <div class="flex items-center justify-between text-gray-600">
                  <span class="font-medium">Baz Fiyat (1-5 Desi)</span>
                  <span class="font-bold text-gray-900">{{ formatCurrency(baseShippingPrice) }}</span>
                </div>
                <div
                  v-if="shippingDesi > 5"
                  class="flex items-center justify-between text-gray-600"
                >
                  <span class="font-medium">Ek Desi Ücreti</span>
                  <span class="font-bold text-gray-900">+{{ formatCurrency(extraShippingCost)
                  }}</span>
                </div>
                <div
                  v-if="shippingType === 'express'"
                  class="flex items-center justify-between text-orange-600"
                >
                  <span class="font-medium">Express Hizmet Farkı</span>
                  <span class="font-bold">+{{ formatCurrency(expressFee) }}</span>
                </div>
                <div class="h-px bg-gray-200 my-4" />
                <div class="flex items-center justify-between">
                  <span class="block text-xl font-black text-gray-900">Tahmini Kargo</span>
                  <span class="text-3xl font-black text-green-600">{{
                    formatCurrency(totalShippingCost) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. VAT (KDV) CALCULATOR -->
        <div
          v-show="activeCalculator === 'vat'"
          class="animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Tutar (TL)</label>
                <div class="relative">
                  <input
                    v-model.number="vatAmount"
                    type="number"
                    class="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                    placeholder="1000"
                  >
                  <span
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold"
                  >TL</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">KDV Oranı</label>
                <div class="flex gap-2">
                  <button
                    v-for="rate in [1, 10, 20]"
                    :key="rate"
                    :class="{ 'bg-orange-600 text-white': vatRate === rate, 'bg-gray-100 text-gray-600 hover:bg-gray-200': vatRate !== rate }"
                    class="flex-1 py-3 rounded-xl font-bold transition-colors"
                    @click="vatRate = rate"
                  >
                    %{{ rate }}
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Hesaplama Türü</label>
                <select
                  v-model="vatType"
                  class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="exclude">
                    KDV Hariç -> Dahil Hesapla
                  </option>
                  <option value="include">
                    KDV Dahil -> Hariç Hesapla
                  </option>
                </select>
              </div>
            </div>

            <div
              class="bg-gray-50 rounded-2xl p-6 lg:p-8 flex flex-col justify-center border border-gray-100"
            >
              <div class="space-y-4">
                <template v-if="vatType === 'exclude'">
                  <div class="flex items-center justify-between text-gray-600">
                    <span class="font-medium">KDV Hariç Tutar</span>
                    <span class="font-bold text-gray-900">{{ formatCurrency(vatAmount || 0)
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between text-orange-600">
                    <span class="font-medium">KDV Tutarı (%{{ vatRate }})</span>
                    <span class="font-bold">+{{ formatCurrency(calculatedVat) }}</span>
                  </div>
                  <div class="h-px bg-gray-200 my-4" />
                  <div class="flex items-center justify-between">
                    <span class="block text-xl font-black text-gray-900">KDV Dahil Toplam</span>
                    <span class="text-3xl font-black text-green-600">{{ formatCurrency((vatAmount ||
                      0) + calculatedVat) }}</span>
                  </div>
                </template>

                <template v-else>
                  <div class="flex items-center justify-between text-gray-600">
                    <span class="font-medium">KDV Dahil Tutar</span>
                    <span class="font-bold text-gray-900">{{ formatCurrency(vatAmount || 0)
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between text-orange-600">
                    <span class="font-medium">İçindeki KDV (%{{ vatRate }})</span>
                    <span class="font-bold">{{ formatCurrency(calculatedInnerVat) }}</span>
                  </div>
                  <div class="h-px bg-gray-200 my-4" />
                  <div class="flex items-center justify-between">
                    <span class="block text-xl font-black text-gray-900">KDV Hariç Tutar</span>
                    <span class="text-3xl font-black text-green-600">{{ formatCurrency((vatAmount ||
                      0) - calculatedInnerVat) }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info / Docs Section -->
    <div
      v-if="currentDocContent"
      class="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 lg:p-10"
    >
      <div class="flex items-center gap-3 mb-6">
        <InformationCircleIcon class="w-6 h-6 text-orange-500" />
        <h3 class="text-lg font-bold text-gray-900">
          {{ currentDocTitle }}
        </h3>
      </div>
      <div class="prose prose-orange max-w-none text-sm text-gray-600 whitespace-pre-line leading-relaxed">
        {{ currentDocContent }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, useRuntimeConfig, useFetch } from '#imports'
import { 
    CalculatorIcon, 
    InformationCircleIcon, 
    TruckIcon, 
    CubeIcon, 
    ScaleIcon, 
    ArrowPathIcon, 
    BookOpenIcon 
} from '@heroicons/vue/24/outline'
const config = useRuntimeConfig()

// Expose setCalculator for parent component to use via ref
defineExpose({
    setCalculator: (key) => { activeCalculator.value = key }
})

const { data: dynamicData } = await useFetch('/api/dynamic/contents?category=help', {
    baseURL: config.public.apiBase
})

const getDynamicDoc = (key, fallback) => {
    if (!dynamicData.value?.success) return fallback
    const item = dynamicData.value.data.find(d => d.key === key)
    return item ? item.content : fallback
}

// Global settings
const activeCalculator = ref('commission')

const calculators = {
    commission: {
        name: 'Komisyon Hesaplama',
        shortName: 'Komisyon',
        icon: CalculatorIcon,
        desc: 'Pazar yerlerine göre net kazancınızı hesaplayın'
    },
    desi: {
        name: 'Desi Hesaplama',
        shortName: 'Desi (Hacim)',
        icon: CubeIcon,
        desc: 'Kargo hacimsel ağırlığını hesaplayın'
    },
    shipping: {
        name: 'Kargo Ücreti Hesaplama',
        shortName: 'Kargo Ücreti',
        icon: TruckIcon,
        desc: 'Tahmini gönderim maliyetlerini hesaplayın'
    },
    vat: {
        name: 'KDV Hesaplama',
        shortName: 'KDV',
        icon: ScaleIcon,
        desc: 'Vergi dahil ve hariç tutarları hesaplayın'
    }
}

const activeCalculatorName = computed(() => calculators[activeCalculator.value].name)
const activeCalculatorDesc = computed(() => calculators[activeCalculator.value].desc)
const activeCalculatorIcon = computed(() => calculators[activeCalculator.value].icon)

// ------------------- COMMISSION LOGIC -------------------
const price = ref(0)
const costPrice = ref(0)
const shippingCost = ref(0)
const selectedPlatform = ref('trendyol')
const selectedCategoryRate = ref(10)
const kdvRate = ref(20)
const showCustomKdv = ref(false)
const kdvIncluded = ref(true)
const shippingPayer = ref('seller')

const platforms = [
    { id: 'trendyol', name: 'Trendyol' },
    { id: 'n11', name: 'n11' },
    { id: 'hepsiburada', name: 'Hepsiburada' },
    { id: 'amazon', name: 'Amazon' },
    { id: 'ciceksepeti', name: 'Çiçeksepeti' },
    { id: 'ticaritakas', name: 'TicariTakas' }
]

const categoryRates = {
    ticaritakas: [{ name: 'Genel / Diğer', rate: 10 }, { name: 'Giyim & Moda', rate: 20 }, { name: 'Elektronik', rate: 5 }, { name: 'Ev & Yaşam', rate: 15 }],
    amazon: [{ name: 'Mobilya', rate: 20 }, { name: 'Elektronik & Bilgisayar', rate: 6 }, { name: 'Giyim', rate: 15 }, { name: 'Kişisel Bakım', rate: 10 }, { name: 'Diğer Her Şey', rate: 15 }],
    trendyol: [{ name: 'Elektronik', rate: 10 }, { name: 'Moda & Giyim', rate: 20 }, { name: 'Ayakkabı & Çanta', rate: 22 }, { name: 'Ev & Yaşam', rate: 18 }, { name: 'Kozmetik', rate: 16 }],
    hepsiburada: [{ name: 'Telefon', rate: 5 }, { name: 'Bilgisayar', rate: 9 }, { name: 'Elektronik Aksesuar', rate: 18 }, { name: 'Giyim & Ayakkabı', rate: 18 }, { name: 'Mobilya', rate: 22 }, { name: 'Altın & Mücevher', rate: 4 }],
    n11: [{ name: 'Bilgisayar', rate: 6 }, { name: 'Telefon Aksesuarları', rate: 12 }, { name: 'Giyim', rate: 20 }, { name: 'Kozmetik', rate: 13 }, { name: 'Mücevher & Saat', rate: 15 }],
    ciceksepeti: [{ name: 'Tasarım Çiçek', rate: 30 }, { name: 'Yenebilir Çiçek', rate: 15 }, { name: 'Hediyelik Eşya', rate: 20 }, { name: 'Kişisel Bakım', rate: 15 }]
}

const currentPlatformCategories = computed(() => categoryRates[selectedPlatform.value] || [])
watch(selectedPlatform, () => {
    if (currentPlatformCategories.value.length > 0) selectedCategoryRate.value = currentPlatformCategories.value[0].rate
}, { immediate: true })

// Price excluding VAT
const priceExcludingVat = computed(() => {
    if (!price.value) return 0
    return price.value / (1 + kdvRate.value / 100)
})

const commissionAmount = computed(() => price.value ? (price.value * selectedCategoryRate.value) / 100 : 0)

const netEarnings = computed(() => {
    let earnings = (price.value || 0) - commissionAmount.value - (costPrice.value || 0)
    if (shippingPayer.value === 'seller') {
        earnings -= (shippingCost.value || 0)
    }
    return earnings
})

// Platform color helpers
const getPlatformColor = (id) => {
    const colors = {
        trendyol: 'bg-orange-500',
        n11: 'bg-purple-600',
        hepsiburada: 'bg-orange-400',
        amazon: 'bg-yellow-500',
        ciceksepeti: 'bg-pink-500',
        ticaritakas: 'bg-blue-600'
    }
    return colors[id] || 'bg-gray-500'
}

const getPlatformBgColor = (id) => {
    const colors = {
        trendyol: 'bg-orange-500',
        n11: 'bg-purple-600',
        hepsiburada: 'bg-orange-400',
        amazon: 'bg-yellow-500',
        ciceksepeti: 'bg-pink-500',
        ticaritakas: 'bg-blue-600'
    }
    return colors[id] || 'bg-gray-500'
}

const resetForm = () => {
    price.value = 0
    costPrice.value = 0
    shippingCost.value = 0
    kdvRate.value = 20
    showCustomKdv.value = false
    kdvIncluded.value = true
    shippingPayer.value = 'seller'
}

const formatNumber = (value) => {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

// ------------------- DESI LOGIC -------------------
const desiWidth = ref(0)
const desiLength = ref(0)
const desiHeight = ref(0)
const desiDivisor = ref(3000)

const calculatedDesi = computed(() => {
    const res = (desiWidth.value * desiLength.value * desiHeight.value) / desiDivisor.value
    return res > 0 ? res.toFixed(2) : '0.00'
})

// ------------------- SHIPPING LOGIC -------------------
const shippingDesi = ref(1)
const shippingType = ref('standard')

const baseShippingPrices = [{ max: 1, price: 45 }, { max: 5, price: 65 }, { max: 10, price: 85 }, { max: 20, price: 120 }, { max: 30, price: 160 }]
const baseShippingPrice = computed(() => {
    const found = baseShippingPrices.find(p => shippingDesi.value <= p.max)
    return found ? found.price : 180 // Base for > 30 items
})
const extraShippingCost = computed(() => {
    if (shippingDesi.value > 30) return (shippingDesi.value - 30) * 5 // 5 TL per extra desi
    return 0
})
const expressFee = computed(() => shippingType.value === 'express' ? (baseShippingPrice.value + extraShippingCost.value) * 0.4 : 0)
const totalShippingCost = computed(() => baseShippingPrice.value + extraShippingCost.value + expressFee.value)

// ------------------- VAT LOGIC -------------------
const vatAmount = ref(100)
const vatRate = ref(20)
const vatType = ref('exclude') // exclude: +KDV ekle, include: İçinden KDV çıkar

const calculatedVat = computed(() => (vatAmount.value || 0) * (vatRate.value / 100))
const calculatedInnerVat = computed(() => {
    const val = vatAmount.value || 0
    // Formula: Price * (Rate / (100 + Rate))
    return val * (vatRate.value / (100 + vatRate.value))
})

// ------------------- DOCS CONTENT -------------------

// NOTE: Since I cant put massive strings easily in one go, I will put the previously used full strings back for commission.
// For the new ones, I will use the extracted text.

// I will re-inject the FULL strings from previous steps during "HelpCalculators" final compilation or just use placeholders if too large differently.
// Actually, I should use the full strings I read in previous steps.

const docContents = {
    commission: {
        title: computed(() => platforms.find(p => p.id === selectedPlatform.value)?.name + ' Komisyon Detayları'),
        content: computed(() => {
            const map = {
                ticaritakas: getDynamicDoc('doc-commission-ticaritakas', "TicariTakas, satıcı dostu politikalarıyla düşük komisyon oranları sunar. Kategorilere göre değişen oranlar genellikle %5 ile %20 arasındadır. Detaylı bilgi için satıcı panelini ziyaret ediniz."),
                amazon: getDynamicDoc('doc-commission-amazon', `Amazon Komisyonu Nedir? Amazon komisyonu, satıcıların platform üzerindeki satışlarından alınan bir ücrettir. Bu ücret, satılan ürünün türüne, kategorisine ve bazen de satış fiyatına göre farklılık gösterebilmektedir.\n\nAmazon Komisyon Oranları Ne Kadardır? Amazon, satış yapılan ürünün kategorisine bağlı olarak %6'dan %20'ye kadar değişen komisyon oranları uygulamaktadır. Bu oranlar, ürünün kategorisine, belirlenen fiyat aralığına ve satıcının türüne göre farklılık göstermektedir. Örneğin, mobilya kategorisinde %20, elektronik ve bilgisayarlar için %6, giyim için %15 gibi oranlar mevcuttur. Amazon komisyonlarına ait detaylı bilgi için Amazon ücretlendirme sayfasını ziyaret edebilirsiniz.\n\nAmazon Neden Komisyon Alıyor? Amazon, satıcıların platform üzerindeki satışlarından komisyon alarak, bu geliri platformun işletilmesi, bakımı, güçlü pazarlama faaliyetleri, lojistik/depolama hizmetleri, müşteri hizmetleri, güvenlik, sürekli teknolojik yenilik ve gelişmeler gibi çeşitli hizmetlerin finansmanında kullanır. Bu komisyon sistemi, Amazon'un geniş müşteri tabanına erişim sağladığı satıcılar için değerli hizmetler sunarken, aynı zamanda şirketin kârlılığını ve uzun vadeli sürdürülebilirliğini de desteklemektedir.\n\nAmazon Komisyonları Neden Değişkenlik Gösteriyor? Amazon komisyonlarının değişkenlik göstermesinin birkaç temel sebebi bulunmaktadır. Bu farklılıkların ana nedenleri arasında ürün kategorilerinin çeşitliliği, satış fiyatlarının farklılıkları ve coğrafi konumlar yer almaktadır. Ayrıca, her bir ürün kategorisi, farklı işlem maliyetleri, rekabet durumu ve kâr marjlarına göre belirlenen ayrı bir komisyon oranına sahiptir.\n\nAmazon Komisyonu Nasıl Hesaplanır? Amazon'da komisyon hesaplama, ürün kategorisine bağlı olarak değişen oranlar üzerinden yapılır. Örneğin, elektronik kategorisinde %8 komisyon oranı varsa ve ürününüz 500 TL ise, komisyon tutarı 500 TL x %8 = 40 TL olacaktır.\n\nAmazon Ne Kadar Komisyon Alıyor? Amazon'da her ürün kategorisi için farklı komisyon oranları uygulanmaktadır. Bu oranlar genellikle %6 ile %45 arasında değişirken, en sık rastlanan oranlar yaklaşık %15 civarındadır. Kitaplar, elektronik ürünler ve giysiler gibi bazı kategoriler, daha düşük ya da daha yüksek oranlara tabii olabilmektedir. Ek olarak, Amazon, çeşitli coğrafi bölgelerde faaliyet gösterirken, bu bölgelere göre değişen komisyon oranları belirleyebilmektedir.\n\nAmazon FBA Kullanımının Komisyon Üzerindeki Etkisi Nedir? Amazon FBA (Fulfillment by Amazon), Amazon'un depolama, paketleme ve nakliye hizmetleri için kullanılan bir hizmettir. FBA kullanmak, doğrudan komisyon oranlarınızı etkilemez; ancak ek maliyetler getirir. Bu hizmet için Amazon, depolama ücretleri ve her ürünün sevkiyatı için işlem ücretleri almaktadır. Dolayısıyla, FBA kullanımı toplam maliyetinizi artırabilir, ancak bu hizmet sayesinde lojistik süreçlerini yönetmeniz kolaylaşır ayrıca, daha hızlı teslimat gibi avantajları da beraberinde getirir.`),
                trendyol: getDynamicDoc('doc-commission-trendyol', `Trendyol Komisyonu Nedir?Trendyol komisyonu, Trendyol pazar yerinde satılan her ürün üzerinden satıcıdan alınan hizmet bedelidir. Bu komisyon, Trendyol’un sağladığı altyapı, ödeme ve kargo entegrasyonu, müşteri erişimi ve pazaryeri görünürlüğü gibi hizmetlerin karşılığı olarak alınır.\n\nTrendyol Komisyon Oranları Nelerdir?Trendyol’da komisyon oranı, satılan ürünün ait olduğu kategoriye göre değişkenlik gösterir. Genel aralık, %5 ile %30 arasındadır. Örnek vermek gerekirse, elektronik ürünlerde oranlar %6-%15 aralığındadır. Moda, giyim, ayakkabı ve çanta gibi kategorilerde ise bu oranlar %10-%25 aralüğında değişmektedir.\n\nTrendyol Satıcı Komisyonunu Hesaplamak için Hangi Formül Kullanılır?Trendyol'da satış yapmak istiyor veya halihazırda yapıyorsanız, satıcı komisyonunu hesaplamak için "Komisyon = Satış Fiyatı x Komisyon Oranı" formülünü kullanabilirsiniz.\n\nTrendyol Komisyon Kesintisi Nasıl Tahsil Edilmektedir?Satıcılara yapılacak olan ödemeler, kayıtlı banka hesabına havale edilir. Trendyol tarafından gerçekleştirilen komisyon kesintileri için satıcılarla bir e-arşiv faturası paylaşılır. Bu süreçte Trendyol komisyon ücreti tahsil etme işlemleri tamamlanır. Herhangi bir siparişin iadesi gerçekleşirse, kesilen komisyon ücreti otomatik olarak satıcıya iade edilir.\n\nTrendyol Komisyonuna Kargo Dahil mi?Trendyol, ürün satış fiyatı üzerinden komisyon ve hizmet bedeli olmak üzere bazı ana giderleri kesmektedir. Ürün satış fiyatı üzerinden kesilen giderler gibi kargo ücreti de platform tarafından kesilir. Böylelikle satış fiyatından kalan tutar, banka hesabınıza yatırılır. Hesaplamalar sonucu belirlenen KDV tutarını ise ay sonunda devlete ödemeniz gerekir.\n\nTrendyol Komisyon İndirimi Uyguluyor mu?Trendyol’da satıcılara yönelik kalıcı bir komisyon indirimi uygulaması bulunmaz ve komisyon oranları kategori bazlı olarak herkese standart şekilde uygulanır.\n\nTrendyol Komisyon Hesaplama Nasıl Yapılır?Trendyol komisyonu, satılan ürünün KDV hariç satış fiyatı üzerinden belirlenir ve bu nedenle doğru bir fiyatlandırma için KDV hesaplama sürecinin dikkate alınması gerekir. Komisyon tutarı, ürünün bu net fiyatının kategoriye ait komisyon oranı ile çarpılmasıyla elde edilir. Örneğin 500 TL’lik bir ürünün komisyon oranı %10 ise satıcıdan 50 TL komisyon kesilir. Bu yüzden fiyatlandırma yaparken ürünün kategorisi, komisyon oranı ve KDV ayrımı birlikte değerlendirilmelidir.\n\nTrendyol'da Komisyon Nasıl Ödenir?Trendyol’da bir satış tamamlandıktan ve sipariş süreci onaylandıktan sonra, sözleşmede belirtilen süre içinde ilgili kategorinin komisyon oranı uygulanır ve bu tutar satış bedelinden düşülerek satıcıya ödeme yapılır.\n\nTrendyol Komisyonu Ürün Başına mı Alır?Trendyol, satıcılardan aldığı komisyon oranlarını ürün başına temin eder. Ayrıca her ürün kategorisi için farklı komisyon oranları bulunur.\n\nTrendyol’da Ürün Satışında Faturayı Kim Kesiyor?Trendyol üzerinden satış yapan işletmeler, mali mühüre sahip olmalıdır. Yalnızca bu sayede e-Fatura işlemleri gerçekleştirilebilir. İşletmelerin mali mühüre sahip olması için, Gelir İdaresi Başkanlığı (GİB)’na başvurması gerekir. Trendyol üzerinden gerçekleştirilen satışlardan sonra, Gelir İdaresi Başkanlığı tarafından sağlanan online e-Fatura kesme portalı veya özel entegrasyonlar ile e-Fatura uygulaması aracılığında fatura kesim işlemleri yapılabilir.\n\nKampanya Dönemlerinde Trendyol Komisyon Oranları Değişir mi?Hayır, Trendyol’un belirlediği komisyon oranlarını kampanya dönemlerinde değişmez. Komisyon oranları kategori bazlı olarak belirlenir ve kampanyalardan bağımsız şekilde uygulanır.`),
                hepsiburada: getDynamicDoc('doc-commission-hepsiburada', `Hepsiburada Komisyonu Nedir?Hepsiburada komisyonu, satıcıların Hepsiburada platformu üzerindeki ürün satışlarından alınan bir bedeldir. Bu oran, genellikle ürünün satış değerine göre ayarlanır ve Hepsiburada'nın sunduğu hizmetlerin karşılığı olarak alınır.\n\nHepsiburada Komisyon Oranları Nelerdir?2023 yılında Hepsiburada'da satılan ürünler için komisyon oranları aşağıdaki gibidir:Altın %4, aksesuarlar, çantalar, ayakkabılar ve giysiler %18, parfümler %15, spor ve dış, mekan ürünleri %5 ile %13, taraftar ürünleri ve cep telefonları %18, cep telefonları %4,5 ile %7, bilgisayarlar %6 ile %15, fotoğraf makinesi ve kameralar %5 ile %15, oto aksesuarları %9 ile %18, televizyonlar %6, anne ve bebek ürünleri %12,5 ile %16, cilt bakımı ve makyaj ürünleri %15, petshop ürünleri %13 ile %15, sağlık ve kişisel bakım ürünleri %15, ev bakımı ve temel tüketim ürünleri %12,5, bahçe ürünleri %9 ile %20, yapı market ürünleri %14 ile %18, ev tekstili, mobilya ve züccaciye %18, mobilyada %22, oyuncaklar %16, cep telefonu aksesuarları %12,5 ile %23, film, kitap, müzik ve kırtasiye ürünleri %8,5 ile %15, oyun konsolları %5 ile %15, hobi oyunlar %16, NON Smart TV ürünler %10 ile %20, dijital ürünler %8,5 ile %10.\n\nNeden Hepsiburada Komisyon Hesaplama Aracını Kullanmalıyım?Hepsiburada komisyon hesaplama aracı, satıcılara, satışlarını yönetmeleri için ihtiyaç duydukları tüm bilgileri tek bir yerde sunar. Bu araç, satış komisyonunu doğru bir şekilde hesaplar, satıcıların gelirlerini ve fiyat politikalarını belirlemelerine yardımcı olur. Ayrıca Hepsiburada komisyon hesaplama aracı, satış işlemlerinin takibini kolaylaştırarak, satıcıların satışlarını daha doğru, daha verimli ve daha kârlı bir şekilde yönetmelerine yardımcı olur.\n\nHepsiburada Komisyonu Nasıl Ödenir?Hepsiburada'da komisyon ücreti, satış işlemi gerçekleştiğinde otomatik olarak tahsil edilir. Satıcıların herhangi bir işlem yapmasına gerek yoktur.\n\nHepsiburada Komisyonu Ürün Başına mı Alır?Evet. Hepsiburada komisyonu, ürün başına alınmaktadır. Hepsiburada gibi e-ticaret platformları, genellikle satıcıların her bir ürün için ödediği komisyonu, ürünün KDV dahil satış fiyatı üzerinden hesaplar ve tahsil eder.\n\nHepsiburada’da Ürün Sattıktan Sonra Faturayı Kim Kesiyor?Hepsiburada'da satış yapan satıcılar, ürün satışlarının faturasını kendileri kesmektedirler. Ancak satıcısının Hepsiburada olduğu ürünlere ait faturalar, Hepsiburada tarafından kesilmektedir.\n\nHepsiburada Komisyonu Nasıl Hesaplanıyor?Hepsiburada komisyonu, satılan ürünün kategorisine ve türüne göre değişen bir yüzde oranı ile hesaplanır. Ürün Satış Tutarı x Kategoriye Ait Komisyon Oranı = Hepsiburada Komisyon Bedeli\n\nÖrneğin, çanta kategorisinde satılan bir ürün için komisyon oranı %18'dir. Bu nedenle, 1000 TL değerinde bir çanta satışı için satıcı 180 TL komisyon ödeyecektir.\n\nHepsiburada Komisyonuna Kargo Ücretleri Dahil mi?Hayır. Hepsiburada komisyonuna kargo ücretleri dahil değildir. Hepsiburada, satıcılardan aldığı komisyonu, ürünün KDV dahil satış fiyatı üzerinden hesaplar. Kargo ücreti, satıcının sorumluluğundadır ve komisyona dahil değildir.\n\nHepsiburada Neden Komisyon Alıyor?Hepsiburada, satıcıların ürünlerini geniş bir müşteri kitlesine ulaştırmasına yardımcı olan bir platformdur. Platform, satıcılara; altyapı hizmetleri, trafik sağlama, müşteri desteği ve ödeme işlemleri gibi hizmetler sunmaktadır. Hepsiburada, bu hizmetlere karşılık olarak satıcılardan komisyon almaktadır.`),
                n11: getDynamicDoc('doc-commission-n11', `n11 Komisyonu Nedir?n11 komisyonu, n11 pazar yerinde gerçekleşen satış işlemleri karşılığında satıcılardan alınan yüzde bazlı bir hizmet bedelidir. Komisyon oranı genellikle satılan ürünün fiyatına göre belirlenir ve n11.com tarafından sağlanan hizmetlere karşılık gelir.\n\nn11 Komisyon Oranları Nelerdir?2023 yılında n11'in başlıca kategoriler için belirlediği komisyon oranları şu şekildedir:\n- Bilgisayar: %5.5 - %25\n- Telefon Aksesuarları: %5 -%15\n- Kozmetik ve Kişisel Bakım Ürünleri: %10 - %15\n- Kitap, Müzik, Film, Oyun: %6.5 - %17\n- Giyim: %20\n- Mücevher ve Saat: %15 -%20\n- Otomotiv ve Motosiklet: %0 -%12\n\nn11 Komisyon Oranlarına KDV Dahil mi?n11 komisyon oranları, Türkiye'de geçerli olan yasal düzenlemelere göre genellikle KDV dahil olarak belirlenir. Yani komisyon oranları üzerinden hesaplanan tutarlar KDV'yi içerir. Bu durumda, satıcılar tarafından ödenen komisyon tutarı KDV'yi kapsayacak şekilde hesaplanır ve fatura edilir.\n\nn11, Satılan Her Ürün için Komisyon mu Alır?Evet, genellikle n11 komisyonu ürün başına alınır. n11.com gibi pazar yerleri, satıcıların her bir ürün için ödediği komisyonu, ürünün satış fiyatı üzerinden hesaplar ve tahsil eder. Satıcılar, n11.com üzerinden satışa çıkardıkları her bir ürün için belirli bir komisyon oranı öderler.\n\nn11’da Ürün Satışında Faturayı Kim Kesiyor?n11.com'da satış yapan satıcılar, ürün satışlarının faturasını genellikle kendileri keserler. Satıcılar, kendi işletmelerine ait bir fatura düzenleyerek müşterilere sunarlar.\n\nn11 Satıcı Komisyonu Nasıl Hesaplanır?n11 satıcı komisyonu, satılan ürünün kategorisine bağlı olarak belirlenen bir yüzde üzerinden hesaplanır. Örneğin; n11 e-ticaret platformu, her bir tablet satışından komisyon olarak ürün fiyatının %5,5 oranında ücret almaktadır. 1000 TL değerinde bir ürün satışı için satıcı 55 TL komisyon ödeyecektir.\n\nn11 Komisyon Kesintisi Nasıl Tahsil Edilmektedir?n11 komisyon kesintisi, n11.com üzerinden satış yapan satıcılardan alınan bir ücrettir. Bu kesinti genellikle satıcının satış yapmış olduğu ürünlerin fiyatından doğrudan düşülerek tahsil edilir.\n\nn11 Komisyonuna Kargo Dahil mi?n11 komisyonu, genellikle ürün fiyatı üzerinden hesaplanır ve kargo ücretini kapsamaz. Yani komisyon, satış yapılan ürünün fiyatının belirli bir yüzdesi olarak alınır ve kargo ücretiyle ilgili bir kesinti yapılmaz.\n\nn11 Neden Komisyon Alıyor?n11, satıcıların ürünlerini geniş bir müşteri kitlesine ulaştırmak için bir pazar yeri olarak konumlanır. Bu pazar yerleri, altyapı hizmetleri, trafik sağlama, müşteri desteği ve ödeme işlemleri gibi bir dizi hizmet sunar. Komisyon, bu platformların sunduğu hizmetlere karşılık olarak alınan bir ücrettir.`),
                ciceksepeti: getDynamicDoc('doc-commission-ciceksepeti', `Çiçeksepeti Nedir? Çiçeksepeti, Emre Aydın tarafından 2006 yılında kurulan bir online alışveriş platformudur. Türkiye'nin tüm şehirlerine çiçek siparişi imkanı sunan bu sitede, ayrıca gurme ürünler, takı, meyve sepeti ve çeşitli hediyelik eşya satışları da yapılmaktadır.\n\nÇiçeksepeti Neden Komisyon Alır? Çiçeksepeti, platformunu sürdürülebilir ve kaliteli bir şekilde sunabilmek için komisyon almaktadır. Komisyonlar, platformun teknik altyapısının geliştirilmesi, müşteri hizmetleri gibi destek hizmetlerinin finanse edilmesi ve pazarlama faaliyetleri gibi çeşitli operasyonel giderleri karşılamak için kullanılır.\n\nÇiçeksepeti Komisyonu Nasıl Hesaplanır? Çiçeksepeti komisyonu "Komisyon Tutarı = Komisyon Oranı (%) × KDV Dahil Satış Fiyatı" formülü ile hesaplanmaktadır. Örnek ile açıklayacak olursak; Tasarım Çiçek kategorisi komisyon oranının %30 olduğunu düşünelim. Bu kategoride 100 TL'lik bir ürün sattığınızda, Çiçeksepeti sizden 30 TL komisyon alacaktır.\n\nÇiçeksepeti Kâr Marjını Nasıl Hesaplarım? Çiçeksepeti üzerinden satış yapan bir satıcı olarak kâr marjınızı hesaplamak için Kâr Marjı = (Satış Fiyatı - (Ürün Maliyeti + Çiçeksepeti Komisyonu)) / Satış Fiyatı formülünü kullanabilirsiniz.\n\nÇiçeksepeti Komisyonu Nedir? Çiçeksepeti komisyonu, Çiçeksepeti platformu üzerinden satış yapan satıcıların, gerçekleştirdikleri her satış üzerinden ödedikleri bir ücrettir. Bu komisyon, satıcının satış bedelinden belirli bir yüzde olarak kesilmektedir.\n\nÇiçeksepeti Komisyon Oranı Kaçtır? Çiçeksepeti, satıcıların yaptığı satışlardan değişken oranlarda komisyon alır. Bu oranlar satılan ürünün kategorisine göre belirlenir ve %6 ile %30 arasında değişiklik gösterir. Örneğin, Bilgisayar ve Tablet kategorisinde komisyon oranı %6 iken, Tasarım Çiçek kategorisinde ise %30'dur.\n\nÇiçeksepeti Komisyon Oranları Nasıl Tahsil Edilmektedir? Çiçeksepeti, satışlardan doğan komisyonunu otomatik olarak keser ve daha sonrasında komisyon harici kalan tutarı satıcıya aktarır.`)
            }
            return map[selectedPlatform.value]
        })
    },
    desi: {
        title: 'Desi Hesaplama Rehberi',
        content: getDynamicDoc('doc-desi', `Desi Ne Demek?
Desi, bir kargo paketinin hacimsel ağırlığını ifade eden ölçü birimidir. Özellikle hafif fakat büyük hacimli ürünlerde gerçek ağırlık yerine desi dikkate alınır, böylece lojistik süreçleri daha adil ve standart bir şekilde fiyatlandırılır.

Desi Hesaplama Nedir?
Desi hesaplama, bir gönderinin hacimsel ağırlığını belirlemek için kullanılan matematiksel işlemdir. Kutu uzunluğu, genişliği ve yüksekliği ölçülerek standart formül üzerinden hacimsel değer oluşturulur.

Desi Hesaplama Formülü Nedir?
Standart formül: Uzunluk × Genişlik × Yükseklik / 3000

Yurtdışı Gönderilerinde Desi Hesaplama Farklı mıdır?
Yurtdışı gönderilerinde desi hesaplama prensibi aynı kalsa da kullanılan bölme katsayısı genellikle 5000 veya 6000 gibi daha yüksek değerlerdir.

1 Desi Kaç Santimetre (cm)?
1 desinin santimetre cinsinden karşılığı, desi formülüne göre 30 × 20 × 5 cm ölçülerine denk gelir.

Desi Kargo Ücretini Nasıl Etkiler?
Desi, kargo ücretlerinin belirlenmesinde en belirleyici unsurlardan biridir. Paket hafif olsa bile büyük hacme sahipse daha yüksek desi değeri çıkar ve bu durum gönderim maliyetini artırır.

1 Desi Kaç Kilogramdır?
1 desi, kargo firmalarının fiyatlandırma sistemlerinde genellikle 1 kilogram olarak kabul edilir.

Desi Değerini Küçültmek Kargo Maliyetlerini Azaltır mı?
Evet, desi değerini küçültmek kargo maliyetlerini azaltacaktır. Bunun için hacimsel olarak mümkün oldukça küçük paket ve ambalajları tercih etmek gerekmektedir.`)
    },
    shipping: {
        title: 'Kargo Ücreti Hesaplama Rehberi',
        content: getDynamicDoc('doc-shipping', `Kargo Ücreti Nedir?
Kargo ücreti, kargolanan ürün paketinin, bir yerden başka bir yere gönderilmesi için kargo şirketlerine ödenen bedeldir.

Kargo Ücreti Nasıl Hesaplanır?
Kargo ücreti hesaplama, paketin ağırlığına, boyutlarına, gitmesi gereken mesafeye ve seçilen hizmet türüne göre değişiklik gösterebilmektedir. Formül: Kargo Ücreti = (Ağırlık Ücreti + Mesafe Ücreti) x Hizmet Türü

Kargo Ücretini Satıcı mı Öder Alıcı mı Öder?
Kargo ücretinin kim tarafından ödeneceği, satıcının ve alıcının anlaşmasına bağlıdır. Genellikle alıcı öder, ancak bazı satıcılar belirli bir tutarın üzerindeki siparişler için ücretsiz kargo imkânı sunmaktadır.

Desi Kargo Ücretini Nasıl Etkiler?
Desi, paketin hacimsel ağırlığını gösteren bir ölçüdür ve kargo ücretini belirleyen en önemli faktörlerden biridir. Paketin uzunluk, genişlik ve yüksekliği arttıkça desi değeri yükselir ve bu doğrudan maliyeti artırır.

Kargo Firmaları Arasında Ücret Farkı Neden Olur?
Kargo firmaları arasındaki fiyat farkı; operasyon maliyetleri, teslimat ağı genişliği, depolama yapısı, hizmet hızı ve ek güvenlik standartları gibi unsurlardan kaynaklanır.

Kargo Teslim Süresi Ücretlendirmeyi Etkiler mi?
Evet, hızlı teslimat talep edildiğinde kargo ücreti genellikle yükselir. Ekspres, aynı gün veya ertesi gün teslimat gibi hızlandırılmış hizmetler daha yüksek operasyon maliyeti gerektirdiği için standart gönderilere kıyasla daha pahalıdır.

Kargo Ücretleri Farklı Bölgeler için Değişir mi?
Kargo ücretleri, mesafeye bağlı olarak artar. Ancak, kargo firmaları ile toplu gönderimler için daha düşük fiyatlarla anlaşma sağlayabilirsiniz.`)
    },
    vat: {
        title: 'KDV Hesaplama Rehberi',
        content: getDynamicDoc('doc-vat', `KDV (Katma Değer Vergisi) Neden Alınıyor?
Katma Değer Vergisi (KDV), devletin mal ve hizmet tüketimi üzerinden gelir elde etmesini sağlayan dolaylı bir vergi türüdür. KDV'nin alınmasının temel amacı, kamu harcamalarının finansmanına kaynak yaratmak ve vergi tabanını genişletmektir.

2026 Yılı için Güncel KDV Oranları Nelerdir?
Genel KDV oranı %20'ye, indirimli oran %10'a yükseltilmiştir; temel ihtiyaç kapsamındaki bazı mal ve hizmetler için uygulanan en düşük oran ise %1 olarak korunmuştur.

KDV Hesaplama Nasıl Yapılır?
Katma Değer Vergisi (KDV), bir mal veya hizmetin vergi hariç bedeli üzerine uygulanacak oranla çarpılarak hesaplanır. Temel formül: KDV = Vergi Hariç Tutar × KDV Oranı

KDV Dahil Hesaplama Nasıl Yapılır?
Vergi dâhil tutardan KDV'yi ayırmak gerektiğinde: KDV = Vergi Dâhil Tutar × (KDV Oranı / (100 + KDV Oranı))

%1 KDV Oranı Uygulanan Ürünler Hangileridir?
Buğday, arpa, mısır, pirinç gibi işlenmemiş tarım ürünleri, süt, yumurta, sebze ve meyve gibi temel gıda maddeleri ile net alanı 150 metrekareyi geçmeyen konut teslimleri %1 KDV oranına tabidir.

%20 KDV Oranı Uygulanan Ürünler Hangileridir?
%20 oranında KDV genel orandır ve I ile II sayılı listelerde yer almayan tüm mal ve hizmetler için uygulanmaktadır. Bu oran; elektronik cihazlar, mobilya, otomobil, mücevher, kozmetik ürünleri, alkollü içecekler, tütün mamulleri, akaryakıt, cep telefonu ve aksesuarları gibi birçok tüketim malı için geçerlidir.

Yurt Dışına Satışlarda KDV Uygulaması Nasıl Olur?
Türkiye'den yurt dışına yapılan mal ihracatı, Kanun'un 11. maddesi uyarınca KDV'den tam istisna sayılır; bu nedenle satış faturasında KDV hesaplanmaz ve yüklenilen vergiler iade veya mahsuben talep edilebilir.`)
    }
}

const currentDocTitle = computed(() => {
    if (activeCalculator.value === 'commission') return docContents.commission.title.value
    return docContents[activeCalculator.value].title
})

const currentDocContent = computed(() => {
    if (activeCalculator.value === 'commission') return docContents.commission.content.value
    return docContents[activeCalculator.value].content
})

const formatCurrency = (value) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)

</script>
