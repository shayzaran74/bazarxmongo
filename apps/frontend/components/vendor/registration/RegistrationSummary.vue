<template>
  <div class="space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center py-8">
    <div class="w-24 h-24 bg-primary-50 text-primary-600 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl shadow-primary-100 transform rotate-12">
      🏁
    </div>
    <h2 class="text-3xl font-black text-neutral-900 font-display italic uppercase tracking-tighter">
      Neredeyse Hazırsınız!
    </h2>
    <p class="text-[10px] font-black text-neutral-400 max-w-lg mx-auto uppercase tracking-widest leading-loose italic">
      Girdiğiniz tüm bilgilerin doğruluğunu kontrol ettiyseniz başvurunuzu admin onayına gönderebilirsiniz. Sizi aramızda görmek için sabırsızlanıyoruz.
    </p>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-12">
      <div v-for="(item, i) in summaryItems" :key="i" class="p-6 bg-neutral-50 rounded-[2rem] border-2 border-transparent hover:border-indigo-100 transition-all shadow-sm">
        <p class="text-[9px] uppercase font-black text-neutral-400 mb-2 tracking-widest">{{ item.label }}</p>
        <p class="text-xs font-black text-neutral-900 truncate uppercase italic">{{ item.value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ form: Object })

const summaryItems = computed(() => [
  { label: 'MAĞAZA', value: props.form.businessName },
  { label: 'TİP', value: props.form.businessType === 'INDIVIDUAL' ? 'ŞAHIS' : 'LTD/AŞ' },
  { label: 'KATEGORİS', value: `${props.form.categories.length} ADET` },
  { label: 'İLETİŞİM', value: props.form.phone }
])
</script>
