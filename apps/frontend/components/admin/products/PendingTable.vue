<template>
  <div class="bg-white rounded-[3rem] shadow-sm border border-neutral-100 overflow-hidden italic">
    <div v-if="products.length === 0" class="p-24 text-center">
      <CheckCircleIcon class="mx-auto h-20 w-20 text-emerald-100 mb-8" />
      <h3 class="text-2xl font-black text-gray-900 uppercase">ONAY BEKLEYEN ÜRÜN YOK</h3>
      <p class="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest">TÜM SATICI ÜRÜNLERİ ONAYLANMIŞ DURUMDA.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr class="bg-neutral-50/50">
            <th v-for="h in ['ÜRÜN BİLGİSİ', 'SATICI', 'KATEGORİ', 'FİYAT / STOK', 'TARİH', 'İŞLEMLER']" :key="h" class="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-neutral-100">{{ h }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-50">
          <tr v-for="product in products" :key="product.id" class="group hover:bg-neutral-50/50 transition-all font-black">
            <td class="px-10 py-8">
              <div class="flex items-center gap-6">
                <div class="w-16 h-16 rounded-2xl bg-neutral-50 p-2 overflow-hidden border border-black/5 group-hover:scale-110 transition-transform shadow-inner">
                  <img :src="resolveImageUrl(product.image)" class="w-full h-full object-cover rounded-xl shadow-sm">
                </div>
                <div>
                  <div class="text-sm font-black text-gray-900 uppercase tracking-tight">{{ product.name }}</div>
                  <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-60">{{ product.sku || 'SKU YOK' }}</div>
                </div>
              </div>
            </td>
            <td class="px-10 py-8">
              <div class="text-sm text-gray-900 uppercase tracking-tight">{{ product.Vendor?.company?.name || product.Vendor?.profile?.storeName || 'BİLİNMİYOR' }}</div>
              <div class="text-[10px] text-gray-400 uppercase italic opacity-60">{{ product.Vendor?.user?.email }}</div>
            </td>
            <td class="px-10 py-8">
               <span class="px-5 py-2 bg-neutral-50 border border-neutral-100 rounded-xl text-[9px] font-black text-gray-500 uppercase tracking-widest">{{ product.Category?.name || '-' }}</span>
            </td>
            <td class="px-10 py-8">
               <div class="text-sm text-indigo-600 tracking-tighter">{{ formatPrice(product.price) }}</div>
               <div class="text-[10px] text-gray-400 uppercase tracking-widest mt-1 opacity-60 italic">{{ product.stock }} ADET STOK</div>
            </td>
            <td class="px-10 py-8 text-[10px] text-gray-400 uppercase tracking-widest">{{ formatDate(product.createdAt) }}</td>
            <td class="px-10 py-8 text-right">
              <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all flex items-center justify-center p-2.5" @click="$emit('view', product)"><EyeIcon /></button>
                <button class="w-12 h-12 bg-emerald-600 rounded-xl shadow-lg text-white hover:bg-black transition-all flex items-center justify-center p-2.5" @click="$emit('approve', product.id)"><CheckCircleIcon /></button>
                <button class="w-12 h-12 bg-red-600 rounded-xl shadow-lg text-white hover:bg-black transition-all flex items-center justify-center p-2.5" @click="$emit('reject', product.id)"><XCircleIcon /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="px-10 py-8 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
       <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">TOPLAM {{ pagination.total }} ÜRÜN</p>
       <div class="flex items-center gap-2">
         <button :disabled="pagination.page === 1" class="h-12 px-6 rounded-xl bg-white border border-neutral-100 text-[10px] font-black text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-all uppercase tracking-widest" @click="$emit('page', pagination.page - 1)">GERİ</button>
         <button v-for="p in visiblePages" :key="p" :class="p === pagination.page ? 'bg-indigo-600 text-white shadow-lg border-indigo-600' : 'bg-white border-neutral-100 text-gray-400 hover:border-indigo-100 hover:text-indigo-600'" class="w-12 h-12 rounded-xl text-[10px] font-black border transition-all uppercase" @click="$emit('page', p)">{{ p }}</button>
         <button :disabled="pagination.page === pagination.pages" class="h-12 px-6 rounded-xl bg-white border border-neutral-100 text-[10px] font-black text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-all uppercase tracking-widest" @click="$emit('page', pagination.page + 1)">İLERİ</button>
       </div>
    </div>
  </div>
</template>

<script setup>
import { CheckCircleIcon, EyeIcon, XCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ products: Array, pagination: Object })
defineEmits(['view', 'approve', 'reject', 'page'])

const { resolveImageUrl } = useAppImage()
const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

const visiblePages = computed(() => {
  const pages = []
  const { page: current, pages: total } = props.pagination
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) pages.push(i)
  return pages
})
</script>
