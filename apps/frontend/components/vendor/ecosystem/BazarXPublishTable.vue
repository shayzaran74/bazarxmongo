<script setup lang="ts">
interface BazarXListing {
  listingId: string
  productName: string
  currentPrice: number
  minMarketPrice: number
  mapCompliant: boolean
  mapGap?: number
  publishedAt?: string
  ecosystemName: string
  bazarxPublished: boolean
}

const props = defineProps<{
  listings: BazarXListing[]
  loading: Record<string, boolean>
}>()

const emit = defineEmits<{
  toggle: [listingId: string, currentlyPublished: boolean]
}>()
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">

    <!-- Boş durum -->
    <div v-if="listings.length === 0" class="p-8 text-center text-sm text-gray-400">
      BazarX'e yayınladığın ürün yok. Ürün formunda "Online satışa izin ver" seçili olan ürünleri yayınlayabilirsin.
    </div>

    <table v-else class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-100">
        <tr>
          <th class="text-left text-xs font-medium text-gray-500 px-4 py-3">Ürün</th>
          <th class="text-left text-xs font-medium text-gray-500 px-4 py-3">Ekosistem</th>
          <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">Fiyatın</th>
          <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">Min. Fiyat (MAP)</th>
          <th class="text-center text-xs font-medium text-gray-500 px-4 py-3">MAP</th>
          <th class="text-center text-xs font-medium text-gray-500 px-4 py-3">BazarX</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr
          v-for="l in listings"
          :key="l.listingId"
          class="hover:bg-gray-50 transition-colors"
          :class="!l.mapCompliant && l.bazarxPublished ? 'bg-red-50' : ''"
        >
          <td class="px-4 py-3 font-medium text-gray-900">{{ l.productName }}</td>
          <td class="px-4 py-3 text-gray-500 text-xs">{{ l.ecosystemName }}</td>
          <td class="px-4 py-3 text-right text-gray-900">
            {{ l.currentPrice.toLocaleString('tr-TR') }} ₺
          </td>
          <td class="px-4 py-3 text-right text-gray-500">
            {{ l.minMarketPrice.toLocaleString('tr-TR') }} ₺
          </td>

          <!-- MAP uyum badge -->
          <td class="px-4 py-3 text-center">
            <span
              class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
              :class="l.mapCompliant ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
            >
              {{ l.mapCompliant ? '✓ Uyumlu' : `↓ ${l.mapGap?.toLocaleString('tr-TR')} ₺ eksik` }}
            </span>
          </td>

          <!-- BazarX toggle -->
          <td class="px-4 py-3 text-center">
            <div class="flex flex-col items-center gap-1">
              <button
                class="relative w-10 h-5 rounded-full transition-colors focus:outline-none"
                :class="l.bazarxPublished ? 'bg-green-500' : 'bg-gray-200'"
                :disabled="loading[l.listingId] || (!l.bazarxPublished && !l.mapCompliant)"
                :title="!l.mapCompliant && !l.bazarxPublished ? 'MAP ihlali: önce fiyatını düzelt' : ''"
                @click="emit('toggle', l.listingId, l.bazarxPublished)"
              >
                <span
                  class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  :class="l.bazarxPublished ? 'translate-x-5' : 'translate-x-0'"
                />
                <!-- Loading spinner -->
                <span
                  v-if="loading[l.listingId]"
                  class="absolute inset-0 flex items-center justify-center"
                >
                  <svg class="w-3 h-3 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                </span>
              </button>

              <!-- MAP uyarısı — yayınlanmamış ve MAP ihlali varsa -->
              <span
                v-if="!l.mapCompliant && !l.bazarxPublished"
                class="text-xs text-red-500"
              >
                Fiyatı düzelt
              </span>
              <!-- Yayında ama MAP ihlali — otomatik kapatılacak uyarı -->
              <span
                v-if="!l.mapCompliant && l.bazarxPublished"
                class="text-xs text-amber-600 font-medium"
              >
                ⚠ Yayın durdurulacak
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>