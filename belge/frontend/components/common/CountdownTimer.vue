<template>
  <div class="inline-flex items-center space-x-2">
    <ClockIcon
      class="h-5 w-5"
      :class="getIconClass()"
    />
    <div
      class="text-center"
      :class="getTextClass()"
    >
      <div
        v-if="isExpired"
        class="text-sm font-bold"
      >
        ⏰ Süresi Doldu
      </div>
      <div
        v-else-if="timeRemaining.total > 0"
        class="space-y-1"
      >
        <!-- Days and Hours for long countdown -->
        <div
          v-if="timeRemaining.days > 0"
          class="text-lg font-bold"
        >
          {{ timeRemaining.days }}g {{ timeRemaining.hours }}s
        </div>
        <!-- Hours and Minutes for medium countdown -->
        <div
          v-else-if="timeRemaining.hours > 0"
          class="text-lg font-bold"
        >
          {{ timeRemaining.hours }}s {{ timeRemaining.minutes }}d
        </div>
        <!-- Minutes and Seconds for short countdown -->
        <div
          v-else
          class="text-xl font-bold tabular-nums"
        >
          {{ padZero(timeRemaining.minutes) }}:{{ padZero(timeRemaining.seconds) }}
        </div>
        <!-- Progress bar for last 5 minutes -->
        <div
          v-if="timeRemaining.total <= 5 * 60 * 1000"
          class="w-full bg-gray-200 rounded-full h-1"
        >
          <div 
            class="h-1 rounded-full transition-all duration-1000"
            :class="getProgressBarClass()"
            :style="{ width: `${getProgressPercentage()}%` }"
          />
        </div>
      </div>
      <div
        v-else
        class="text-sm font-bold text-red-600"
      >
        ⏰ Süresi Doldu
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from '#imports'
import ClockIcon from '@heroicons/vue/24/outline/ClockIcon'

const props = defineProps({
  endTime: {
    type: [String, Date],
    required: true
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  showProgress: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['expired', 'warning', 'critical'])

// State
const timeRemaining = ref({
  total: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
})

const isExpired = ref(false)
const hasWarned = ref(false)
const hasCriticalWarned = ref(false)

// Computed
const getIconClass = () => {
  if (isExpired.value) return 'text-red-500'
  if (timeRemaining.value.total <= 60000) return 'text-red-500 animate-pulse' // Last minute
  if (timeRemaining.value.total <= 300000) return 'text-yellow-500' // Last 5 minutes
  return 'text-gray-500'
}

const getTextClass = () => {
  const baseClass = props.size === 'small' ? 'text-sm' : props.size === 'large' ? 'text-xl' : 'text-base'
  
  if (isExpired.value) return `${baseClass} text-red-600`
  if (timeRemaining.value.total <= 60000) return `${baseClass} text-red-600 font-bold animate-pulse`
  if (timeRemaining.value.total <= 300000) return `${baseClass} text-yellow-600 font-semibold`
  return `${baseClass} text-gray-700`
}

const getProgressBarClass = () => {
  if (timeRemaining.value.total <= 60000) return 'bg-red-500 animate-pulse'
  if (timeRemaining.value.total <= 120000) return 'bg-orange-500'
  return 'bg-yellow-500'
}

const getProgressPercentage = () => {
  const fiveMinutes = 5 * 60 * 1000
  return Math.max(0, (timeRemaining.value.total / fiveMinutes) * 100)
}

// Methods
const updateCountdown = () => {
  const now = new Date().getTime()
  const endTime = new Date(props.endTime).getTime()
  const total = endTime - now

  if (total <= 0) {
    timeRemaining.value = { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
    if (!isExpired.value) {
      isExpired.value = true
      emit('expired')
    }
    return
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((total % (1000 * 60)) / 1000)

  timeRemaining.value = { total, days, hours, minutes, seconds }

  // Emit warnings
  if (total <= 300000 && !hasWarned.value) { // 5 minutes
    hasWarned.value = true
    emit('warning', total)
  }
  
  if (total <= 60000 && !hasCriticalWarned.value) { // 1 minute
    hasCriticalWarned.value = true
    emit('critical', total)
  }
}

const padZero = (num) => {
  return num.toString().padStart(2, '0')
}

// Lifecycle
let intervalId = null

onMounted(() => {
  updateCountdown()
  intervalId = setInterval(updateCountdown, 1000)
})

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Watch for endTime changes
watch(() => props.endTime, () => {
  isExpired.value = false
  hasWarned.value = false
  hasCriticalWarned.value = false
  updateCountdown()
})
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>