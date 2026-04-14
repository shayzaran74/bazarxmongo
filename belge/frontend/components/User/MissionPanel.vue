<template>
  <div class="mission-panel relative">
    <!-- Header -->
    <div class="flex items-end justify-between mb-6">
      <div class="relative z-10">
        <h3 class="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <div class="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg shadow-yellow-500/30">
            <TrophyIcon class="w-6 h-6 text-white" />
          </div>
          {{ $t('missions.title') || 'Görev Paneli' }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-1 font-medium">
          {{ $t('missions.subtitle') || 'Görevleri tamamla, Sadakat XP (Loyalty XP) kazan ve seviyeni yükselt!' }}
        </p>
      </div>
      <div class="relative z-10 hidden sm:block">
        <button
          class="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-500 hover:text-primary-600 hover:shadow-md hover:border-primary-100 transition-all active:scale-95"
          :class="{ 'animate-spin': loading }"
          @click="fetchMissions"
        >
          <ArrowPathIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="h-48 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse"
      />
    </div>

    <!-- Missions Grid -->
    <div
      v-else-if="missions.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      <div
        v-for="mission in missions"
        :key="mission.id"
        class="group relative bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-500 overflow-hidden"
        :class="{ 'border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-white dark:from-green-900/10 dark:to-gray-800': mission.status === 'COMPLETED' || mission.status === 'CLAIMED' }"
      >
        <!-- Background Flairs -->
        <div
          class="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-primary-100 to-transparent dark:from-primary-900/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          :class="{ 'from-green-100 dark:from-green-900/30': mission.status === 'COMPLETED' || mission.status === 'CLAIMED' }"
        />

        <div class="relative z-10 flex flex-col h-full">
          <!-- Top Section -->
          <div class="flex items-start justify-between mb-4">
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm relative overflow-hidden group-hover:scale-110 transition-transform duration-300"
              :class="[
                mission.status === 'COMPLETED' || mission.status === 'CLAIMED'
                  ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-emerald-500/30'
                  : 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-600 text-primary-600 dark:text-primary-400'
              ]"
            >
              <component
                :is="getMissionIcon(mission.key)"
                class="w-6 h-6 relative z-10"
              />
              <div
                v-if="mission.status === 'COMPLETED' || mission.status === 'CLAIMED'"
                class="absolute inset-0 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"
              />
            </div>

            <div class="flex flex-col items-end">
              <span
                class="px-3 py-1 bg-yellow-100/50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 text-xs font-black rounded-xl border border-yellow-200/50 dark:border-yellow-800/30 shadow-sm backdrop-blur-sm"
              >
                +{{ mission.xpReward }} XP
              </span>
            </div>
          </div>

          <!-- Content -->
          <h4
            class="font-bold text-gray-900 dark:text-white text-base mb-1 group-hover:text-primary-600 transition-colors line-clamp-1"
          >
            {{ mission.title }}
          </h4>
          <p class="text-[13px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
            {{ mission.description }}
          </p>

          <!-- Divider -->
          <div class="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-4" />

          <!-- Progress / Status -->
          <div class="mt-auto">
            <template v-if="mission.status === 'COMPLETED' || mission.status === 'CLAIMED'">
              <div
                class="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2.5 flex items-center justify-center gap-2 border border-emerald-100 dark:border-emerald-800/30"
              >
                <CheckBadgeIcon class="w-5 h-5 text-emerald-500 animate-[bounce_2s_infinite]" />
                <span class="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  TAMAMLANDI
                </span>
              </div>
            </template>
            <template v-else>
              <div class="flex items-center justify-between text-xs mb-2 font-medium">
                <span class="text-gray-400 font-bold uppercase tracking-wider">İlerleme</span>
                <span
                  class="text-gray-700 dark:text-gray-300 font-bold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md"
                >
                  {{ mission.progress?.current || 0 }} / {{ mission.progress?.target || 1 }}
                </span>
              </div>
              <div class="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden p-[1px]">
                <div
                  class="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  :style="{ width: `${Math.min(100, ((mission.progress?.current || 0) / (mission.progress?.target || 1)) * 100)}%` }"
                >
                  <div class="absolute inset-0 bg-white/20 animate-progress-shimmer" />
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 dark:bg-gray-800/30 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700 backdrop-blur-sm"
    >
      <div
        class="w-20 h-20 bg-white dark:bg-gray-800 shadow-md rounded-2xl flex items-center justify-center mb-5 rotate-3 hover:rotate-6 transition-transform"
      >
        <SparklesIcon class="w-10 h-10 text-primary-400 animate-pulse" />
      </div>
      <h4 class="text-xl font-black text-gray-900 dark:text-white mb-2">
        {{ $t('missions.noMission') || 'Aktif Görev Bulunmuyor' }}
      </h4>
      <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium">
        {{ $t('missions.subtitle') || 'Şu an için tüm görevleri tamamladınız veya aktif bir görev bulunmamaktadır. Yeni görevler için daha sonra tekrar kontrol edin.' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, useApi } from '#imports'
import TrophyIcon from '@heroicons/vue/24/outline/TrophyIcon'
import ArrowPathIcon from '@heroicons/vue/24/outline/ArrowPathIcon'
import UserIcon from '@heroicons/vue/24/outline/UserIcon'
import PhotoIcon from '@heroicons/vue/24/outline/PhotoIcon'
import ShieldCheckIcon from '@heroicons/vue/24/outline/ShieldCheckIcon'
import ShoppingBagIcon from '@heroicons/vue/24/outline/ShoppingBagIcon'
import CreditCardIcon from '@heroicons/vue/24/outline/CreditCardIcon'
import ChatBubbleLeftRightIcon from '@heroicons/vue/24/outline/ChatBubbleLeftRightIcon'
import SparklesIcon from '@heroicons/vue/24/outline/SparklesIcon'
import CheckBadgeIcon from '@heroicons/vue/24/outline/CheckBadgeIcon'

const { $api } = useApi();
const missions = ref([]);
const loading = ref(true);

const fetchMissions = async () => {
  loading.value = true;
  try {
    const response = await $api('/api/missions');
    missions.value = response.success ? response.data : [];
  } catch (error) {
    console.error('Failed to fetch missions:', error);
  } finally {
    loading.value = false;
  }
};

const getMissionIcon = (key) => {
  const icons = {
    'SIGNUP': UserIcon,
    'AVATAR_UPLOAD': PhotoIcon,
    'FIRST_LISTING': ShoppingBagIcon,
    'FIRST_PURCHASE': CreditCardIcon,
    'PHONE_VERIFIED': ShieldCheckIcon,
    'FIRST_REVIEW': ChatBubbleLeftRightIcon
  };
  return icons[key] || TrophyIcon;
};

onMounted(() => {
  fetchMissions();
});

defineExpose({ refresh: fetchMissions });
</script>

<style scoped>
.mission-panel {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes progress-shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(200%);
  }
}

.animate-progress-shimmer {
  animation: progress-shimmer 2s infinite linear;
}
</style>
