/**
 * useScrollAnimation — Viewport girişinde blur-slide-up entrance animasyonu
 * @vueuse/motion + IntersectionObserver kombinasyonu
 * Reduced-motion tercihine tam uyum sağlar
 */
export function useScrollAnimation() {
  const prefersReducedMotion = computed(() => {
    if (process.server) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  /** Blur-slide-up entrance: Her section, card, heading için */
  const blurSlideUp = computed(() => ({
    initial: prefersReducedMotion.value
      ? { opacity: 0 }
      : { opacity: 0, filter: 'blur(12px)', y: 28 },
    visibleOnce: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        duration: 700,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }))

  /** Stagger child — parent container için (staggerChildren) */
  const staggerContainer = computed(() => ({
    initial: {},
    visibleOnce: {
      transition: { staggerChildren: 0.09 },
    },
  }))

  /** Stagger child item */
  const staggerItem = (index: number) =>
    computed(() => ({
      initial: prefersReducedMotion.value
        ? { opacity: 0 }
        : { opacity: 0, filter: 'blur(12px)', y: 28 },
      visibleOnce: {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        transition: {
          duration: 700,
          delay: index * 90,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      },
    }))

  /** Image/media entrance — slight spring overshoot */
  const imageEntrance = computed(() => ({
    initial: prefersReducedMotion.value
      ? { opacity: 0 }
      : { opacity: 0, scale: 0.92, filter: 'blur(10px)' },
    visibleOnce: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 650,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  }))

  /** Line reveal — divider/rule animasyonu */
  const lineReveal = computed(() => ({
    initial: { scaleX: 0, originX: 'left' },
    visibleOnce: {
      scaleX: 1,
      transition: {
        duration: 900,
        ease: [0.76, 0, 0.24, 1],
      },
    },
  }))

  /** Card hover — interactive card için */
  const cardHover = {
    hovered: {
      y: -7,
      scale: 1.018,
      transition: { type: 'spring', stiffness: 300, damping: 22 },
    },
  }

  /** Button hover — CTA/submit button */
  const buttonHover = {
    hovered: {
      scale: 1.05,
      transition: { type: 'spring', stiffness: 400, damping: 20 },
    },
    tapped: {
      scale: 0.97,
      transition: { type: 'spring', stiffness: 400, damping: 20 },
    },
  }

  return {
    blurSlideUp,
    staggerContainer,
    staggerItem,
    imageEntrance,
    lineReveal,
    cardHover,
    buttonHover,
    prefersReducedMotion,
  }
}
