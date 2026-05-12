<!-- components/product/detail/ProductSpecifications.vue -->
<script setup lang="ts">
import type { Product } from '@barterborsa/shared-types'

// Product tipini Trendyol'dan gelen alanları kapsayacak şekilde genişlet
interface ExtendedProduct extends Product {
  specs?: Record<string, unknown> | null
  attributes?: Record<string, unknown> | null
  technicalSpecifications?: string | null
  brand?: string
  sku?: string
  category?: { name: string } | null
}

const props = defineProps<{ product: ExtendedProduct }>()

// JSON specs ya da düz metin → birleşik satır listesi
const rows = computed<{ key: string; value: string }[]>(() => {
  const result: { key: string; value: string }[] = []

  // Önce JSON specs (Trendyol import attributes → specs alanına kaydedildi)
  const raw = (props.product.specs ?? props.product.attributes) as Record<string, unknown> | null | undefined
  if (raw && typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw)) {
      if (k && v !== null && v !== undefined && String(v).trim()) {
        result.push({ key: k, value: String(v) })
      }
    }
  }

  // JSON boşsa temel alanları göster
  if (!result.length) {
    if (props.product.brand)           result.push({ key: 'Marka',            value: props.product.brand })
    if (props.product.sku)             result.push({ key: 'Stok Kodu (SKU)',   value: props.product.sku })
    if (props.product.category?.name)  result.push({ key: 'Kategori',          value: props.product.category.name })
  }

  return result
})

// Eski düz-metin format (JSON yoksa)
const legacyText = computed(() =>
  rows.value.length === 0 ? (props.product.technicalSpecifications ?? null) : null
)
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-2 duration-500">

    <!-- ── Trendyol tarzı özellik tablosu ─────────────────────────────── -->
    <template v-if="rows.length">
      <div class="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <h3 class="text-[11px] font-black text-slate-600 uppercase tracking-widest">
            Ürün Özellikleri
          </h3>
          <span class="text-[10px] text-slate-400 font-semibold">{{ rows.length }} özellik</span>
        </div>

        <table class="w-full">
          <tbody>
            <tr
              v-for="(row, idx) in rows"
              :key="row.key"
              class="border-b border-slate-100 last:border-0 transition-colors hover:bg-orange-50/40 group"
              :class="idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'"
            >
              <td class="px-6 py-3.5 w-[42%] align-top">
                <span class="text-xs text-slate-500 font-semibold leading-snug group-hover:text-slate-700 transition-colors">
                  {{ row.key }}
                </span>
              </td>
              <td class="px-6 py-3.5 align-top">
                <span class="text-xs text-slate-900 font-bold leading-snug">
                  {{ row.value }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ── Eski format: düz metin ──────────────────────────────────────── -->
    <template v-else-if="legacyText">
      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <h3 class="text-[11px] font-black text-slate-600 uppercase tracking-widest">
            Ürün Özellikleri
          </h3>
        </div>
        <div class="p-8">
          <p class="whitespace-pre-line text-slate-600 text-sm font-medium leading-relaxed">
            {{ legacyText }}
          </p>
        </div>
      </div>
    </template>

    <!-- ── Boş durum ───────────────────────────────────────────────────── -->
    <template v-else>
      <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 flex flex-col items-center justify-center py-20 space-y-3">
        <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Ürün özelliği girilmemiş</p>
      </div>
    </template>

  </div>
</template>
