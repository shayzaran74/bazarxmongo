<!-- components/product/detail/ProductDescription.vue -->
<script setup lang="ts">
import type { Product } from '@barterborsa/shared-types'

interface ExtendedProduct extends Product {
  brand?: string
  category?: { name: string } | null
  additional_info?: Record<string, string> | null
  specs?: Record<string, unknown> | null
}

const props = defineProps<{ product: ExtendedProduct }>()

// Trendyol boilerplate kalıpları
const BOILERPLATE = [
  /^Bu ürün\b/i,
  /tarafından gönderilecektir/i,
  /^Kampanya fiyatından/i,
  /^Ürüne ait garanti belgesi/i,
  /^Ürün teslimi sonrası/i,
  /^Bir ürün, birden fazla satıcı/i,
  /^Bu üründen en fazla/i,
  /^Belirlenen bu limit/i,
  /adetten fazla stok/i,
  /adetten az stok/i,
  /link ve karekod/i,
  /sıralanmaktadır\.?\s*$/i,
]

// Açıklamayı temizle — boilerplate satırları at, "Ürün Özellikleri:" sonrasını at
const cleanParagraphs = computed<string[]>(() => {
  const raw = props.product.description ?? ''
  if (!raw.trim()) return []

  const specsIdx = raw.indexOf('Ürün Özellikleri:')
  const part = specsIdx >= 0 ? raw.slice(0, specsIdx) : raw

  const clean: string[] = []
  let current: string[] = []

  for (const line of part.split(/\n/).map(l => l.trim())) {
    if (!line) {
      if (current.length) { clean.push(current.join(' ')); current = [] }
    } else if (!BOILERPLATE.some(p => p.test(line))) {
      current.push(line)
    }
  }
  if (current.length) clean.push(current.join(' '))
  return clean
})

// Ek bilgiler (Kargo / İade / Barkod) — additional_info JSON alanı
const additionalRows = computed<{ key: string; value: string }[]>(() => {
  const ai = props.product.additional_info
  if (!ai || typeof ai !== 'object') return []
  return Object.entries(ai).filter(([, v]) => v).map(([k, v]) => ({ key: k, value: String(v) }))
})
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">

    <!-- ── Ürün Açıklaması: başlık + temiz metin ──────────────────────── -->
    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/80">
        <h3 class="text-[11px] font-black text-slate-600 uppercase tracking-widest">
          Ürün Açıklaması
        </h3>
      </div>
      <div class="p-6 lg:p-8 space-y-4">
        <!-- Ürün adını açıklama başlığı olarak göster -->
        <h4 class="text-sm font-black text-slate-900 leading-snug">
          {{ product.name }}
        </h4>

        <!-- Temizlenmiş açıklama paragrafları -->
        <template v-if="cleanParagraphs.length">
          <p
            v-for="(para, i) in cleanParagraphs"
            :key="i"
            class="text-sm text-slate-600 leading-relaxed"
          >
            {{ para }}
          </p>
        </template>
        <p
          v-else
          class="text-xs text-slate-400 font-medium italic"
        >
          Bu ürün için detaylı açıklama bulunmuyor.
        </p>
      </div>
    </div>

    <!-- ── Ek Bilgiler (Kargo / İade / Barkod) ────────────────────────── -->
    <div
      v-if="additionalRows.length"
      class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/80">
        <h3 class="text-[11px] font-black text-slate-600 uppercase tracking-widest">
          Kargo &amp; İade Bilgileri
        </h3>
      </div>
      <table class="w-full">
        <tbody>
          <tr
            v-for="(row, idx) in additionalRows"
            :key="row.key"
            class="border-b border-slate-100 last:border-0"
            :class="idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'"
          >
            <td class="px-6 py-3 w-2/5 text-xs text-slate-500 font-semibold">{{ row.key }}</td>
            <td class="px-6 py-3 text-xs text-slate-900 font-bold">{{ row.value }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Temel ürün bilgileri ───────────────────────────────────────── -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-if="product.brand"
        class="flex flex-col gap-1 p-4 rounded-xl bg-slate-50 border border-slate-100"
      >
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Marka</span>
        <span class="text-xs font-black text-slate-800 truncate">{{ product.brand }}</span>
      </div>
      <div
        v-if="product.category?.name"
        class="flex flex-col gap-1 p-4 rounded-xl bg-slate-50 border border-slate-100"
      >
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kategori</span>
        <span class="text-xs font-black text-slate-800 truncate">{{ product.category.name }}</span>
      </div>
      <div
        v-if="(product as any).sku"
        class="flex flex-col gap-1 p-4 rounded-xl bg-slate-50 border border-slate-100"
      >
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">SKU</span>
        <span class="text-xs font-black text-slate-800 font-mono truncate">{{ (product as any).sku }}</span>
      </div>
    </div>

  </div>
</template>
