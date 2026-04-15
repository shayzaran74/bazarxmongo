import { ref, onUnmounted, onMounted } from 'vue'

export const useTimer = (targetDate?: string | Date) => {
  const days = ref(0)
  const hours = ref(0)
  const minutes = ref(0)
  const seconds = ref(0)
  const isExpired = ref(false)
  
  let timerInterval: ReturnType<typeof setInterval> | null = null

  const calculateTimeLeft = (target: string | Date) => {
    const end = new Date(target).getTime()
    const now = new Date().getTime()
    const distance = end - now

    if (distance < 0) {
      isExpired.value = true
      days.value = 0
      hours.value = 0
      minutes.value = 0
      seconds.value = 0
      if (timerInterval) clearInterval(timerInterval)
      return
    }

    days.value = Math.floor(distance / (1000 * 60 * 60 * 24))
    hours.value = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    minutes.value = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    seconds.value = Math.floor((distance % (1000 * 60)) / 1000)
    isExpired.value = false
  }

  const startTimer = (target: string | Date) => {
    if (!process.client) return
    stopTimer()
    calculateTimeLeft(target)
    timerInterval = setInterval(() => calculateTimeLeft(target), 1000)
  }

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  onMounted(() => {
    if (targetDate) {
      startTimer(targetDate)
    }
  })

  onUnmounted(() => {
    stopTimer()
  })

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired,
    startTimer,
    stopTimer
  }
}
