import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'

export default defineNuxtPlugin(async () => {
  // Only run on client side
  if (!import.meta.client) {
    return {
      provide: {
        stripe: null as Stripe | null
      }
    }
  }
  
  const config = useRuntimeConfig()
  
  // Stripe public key
  const publishableKey = (config.public?.stripePublishableKey as string) || 'pk_test_51RXSv8BBb9r8vub8ZFfj4no24OQYkgjhbPDtvlIdX9LSni434NzDV3PeY4LnXbwlX2qrDiGt8o0KTHYp46s99A6z00R0iE0vV1'
  
  try {
    const stripe = await loadStripe(publishableKey)
    
    return {
      provide: {
        stripe: stripe as Stripe | null
      }
    }
  } catch (error) {
    console.error('Error loading Stripe:', error)
    return {
      provide: {
        stripe: null as Stripe | null
      }
    }
  }
})