<template>
  <section class="home-campaigns py-20 lg:py-32">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between mb-16 px-4">
        <h2 class="text-4xl lg:text-5xl font-display font-black text-slate-800 italic tracking-tighter leading-none">
          {{ $t('home.campaigns') }}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          v-for="campaign in campaigns" 
          :key="campaign.id"
          class="group relative h-[300px] rounded-[3rem] overflow-hidden shadow-xl"
        >
          <img :src="campaign.image || '/images/campaign-fallback.png'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div class="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent flex flex-col justify-end p-12 space-y-4">
            <h3 class="text-3xl font-display font-black text-white italic tracking-tighter">{{ campaign.name }}</h3>
            <p v-if="campaign.description" class="text-white/80 text-sm font-medium line-clamp-2 max-w-sm">{{ campaign.description }}</p>
            <NuxtLink :to="`/campaigns/${campaign.slug}`">
              <UiButton variant="primary" size="sm" class="w-fit">Fırsatı Yakala</UiButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Campaign } from '~/types/catalog'

defineProps<{
  campaigns: Campaign[]
}>()
</script>
