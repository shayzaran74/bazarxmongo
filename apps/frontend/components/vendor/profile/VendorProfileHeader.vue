<template>
  <div class="relative">
    <!-- Cover Image -->
    <div class="h-64 md:h-80 w-full overflow-hidden relative">
      <NuxtImg
        :src="vendor?.coverImageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop'"
        class="w-full h-full object-cover"
        alt="Vendor Cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    </div>

    <!-- Vendor Info Overlay -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-8 italic">
      <div class="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-8 border border-gray-100 overflow-hidden relative">
        <div class="flex flex-col md:flex-row items-center md:items-end gap-8">
          <!-- Logo -->
          <div class="w-36 h-36 md:w-40 md:h-40 rounded-3xl bg-white p-1 shadow-2xl overflow-hidden -mt-20 md:-mt-24 border-8 border-white group">
            <NuxtImg
              :src="vendor?.logoUrl || 'https://placehold.co/200x200?text=' + vendor?.businessName"
              class="w-full h-full object-contain rounded-2xl group-hover:scale-110 transition-transform duration-500"
              @error="handleLogoError"
            />
          </div>

          <div class="text-center md:text-left space-y-4">
            <div>
              <div class="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 class="text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
                  {{ vendor?.businessName }}
                </h1>
                <CheckBadgeIcon v-if="vendor?.status === 'APPROVED'" class="h-8 w-8 text-blue-500" />
              </div>
              <p class="text-sm font-medium text-gray-500 max-w-xl italic leading-relaxed">
                {{ vendor?.description || 'En kaliteli ürünlerle hizmetinizdeyiz.' }}
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div class="flex items-center text-[10px] font-black text-gray-700 bg-neutral-50 px-5 py-2 rounded-xl border border-gray-100 shadow-inner uppercase tracking-widest italic">
                <StarIcon class="h-4 w-4 text-amber-400 fill-current mr-2" />
                {{ vendor?.averageRating?.toFixed(1) || '0.0' }} MAĞAZA PUANI
              </div>
              <div class="flex items-center text-[10px] font-black text-gray-700 bg-neutral-50 px-5 py-2 rounded-xl border border-gray-100 shadow-inner uppercase tracking-widest italic">
                <ShoppingBagIcon class="h-4 w-4 text-indigo-600 mr-2" />
                {{ vendor?._count?.listings || 0 }} AKTİF ÜRÜN
              </div>
              <div class="flex items-center text-[10px] font-black text-gray-700 bg-neutral-50 px-5 py-2 rounded-xl border border-gray-100 shadow-inner uppercase tracking-widest italic">
                <CalendarDaysIcon class="h-4 w-4 text-gray-400 mr-2" />
                {{ formatDate(vendor?.createdAt) }}'DEN BERİ ÜYE
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex items-center gap-4 italic font-black text-[10px] tracking-widest uppercase">
          <button
            class="h-16 px-10 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-2xl shadow-gray-200 flex items-center gap-3 active:scale-95 disabled:opacity-50"
            :class="{ 'bg-green-600 hover:bg-green-700': isFollowing }"
            :disabled="followLoading"
            @click="$emit('follow')"
          >
            <component :is="isFollowing ? CheckBadgeIcon : UserPlusIcon" class="h-5 w-5" />
            {{ isFollowing ? 'TAKİP EDİLİYOR' : 'TAKİP ET' }}
          </button>
          <button
            class="w-16 h-16 bg-white hover:bg-neutral-50 text-gray-900 border border-gray-100 rounded-2xl transition-all shadow-xl flex items-center justify-center group"
            @click="$emit('share')"
          >
            <ShareIcon class="h-6 w-6 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { StarIcon, ShoppingBagIcon, CalendarDaysIcon, CheckBadgeIcon, UserPlusIcon, ShareIcon } from '@heroicons/vue/24/solid'
const props = defineProps({ vendor: Object, isFollowing: Boolean, followLoading: Boolean })
defineEmits(['follow', 'share'])

const formatDate = (d) => d ? new Date(d).getFullYear() : ''
const handleLogoError = (e) => {
  if (e?.target) {
    e.target.src = 'https://placehold.co/200x200?text=' + (props.vendor?.businessName || 'Store')
  }
}
</script>
