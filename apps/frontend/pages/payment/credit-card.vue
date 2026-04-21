<template>
  <div class="min-h-screen bg-gray-50/50 flex flex-col items-center py-10 lg:py-20">
    <div class="w-full max-w-2xl px-4 lg:px-0">
      <!-- Header -->
      <div class="flex items-center gap-6 mb-12">
        <button class="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-95" @click="$router.back()">
          <ArrowLeftIcon class="h-5 w-5 text-gray-900" />
        </button>
        <div>
          <h1 class="text-4xl font-black text-gray-900 italic tracking-tighter uppercase">GÜVENLİ ÖDEME</h1>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">KREDİ KARTI PROTOKOLÜ</p>
        </div>
      </div>

      <div class="bg-white rounded-[3rem] shadow-2xl shadow-gray-200 border border-white overflow-hidden">
        <!-- Price Summary -->
        <div class="p-8 pb-4">
          <PaymentPriceSummary
            :amount="amount"
            :fee="cardFee"
            :total="totalAmount"
            :order-number="orderNumber"
            :format-price="formatPrice"
          />
        </div>

        <!-- Form Section -->
        <div class="p-8 pt-4 space-y-10">
          <form class="space-y-10" @submit.prevent="processPayment">
            <!-- Form Components -->
            <PaymentCreditCardForm
              v-model:number="cardForm.number"
              v-model:name="cardForm.name"
              v-model:expiry="cardForm.expiry"
              v-model:cvv="cardForm.cvv"
              :model-value="cardForm"
              :card-brand="cardBrand"
              @update:number="formatCardNumber"
              @update:expiry="formatExpiry"
            />

            <!-- Installments -->
            <PaymentInstallments
              v-model="selectedInstallment"
              :options="installmentOptions"
              :total-amount="totalAmount"
              :format-price="formatPrice"
            />

            <!-- Security Check (Merged into modern UI) -->
            <div class="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
              <input
                id="terms"
                v-model="acceptTerms"
                type="checkbox"
                class="mt-1 w-5 h-5 rounded-lg border-gray-200 text-primary-600 focus:ring-primary-500"
                required
              >
              <label for="terms" class="text-[11px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed">
                Ödeme işlemini başlatarak <span class="text-primary-600 underline">Kullanım Koşullarını</span> ve <span class="text-primary-600 underline">Gizlilik Politikasını</span> onayladığımı beyan ederim.
              </label>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full bg-slate-900 text-white font-black italic uppercase tracking-widest py-6 rounded-3xl hover:bg-primary-600 shadow-2xl shadow-slate-900/10 transition-all disabled:opacity-20 flex items-center justify-center gap-3 group"
            >
              <template v-if="!loading">
                <ShieldCheckIcon class="w-6 h-6 group-hover:scale-110 transition-transform" />
                ÖDEMEYİ TAMAMLA ({{ formatPrice(selectedInstallment.total) }})
              </template>
              <template v-else>
                <div class="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                PROTOKOL İŞLENİYOR...
              </template>
            </button>
          </form>

          <!-- Security Badges -->
          <div class="flex justify-center gap-6 opacity-30">
            <div class="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">🔐 SSL SECURE</div>
            <div class="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">💳 PCI DSS</div>
            <div class="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">🛡️ 3D SECURE</div>
          </div>
        </div>
      </div>

      <!-- Support Link -->
      <p class="text-center mt-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-900 transition-all cursor-pointer italic">
        🔒 Yardıma mı ihtiyacınız var? Destek ekibimize ulaşın.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'
import { useCreditCardPayment } from '~/composables/useCreditCardPayment'

// Components
import PaymentPriceSummary from '~/components/payment/PaymentPriceSummary.vue'
import PaymentCreditCardForm from '~/components/payment/PaymentCreditCardForm.vue'
import PaymentInstallments from '~/components/payment/PaymentInstallments.vue'

definePageMeta({ layout: 'default', middleware: 'auth' })
useHead({ title: 'Güvenli Ödeme Protokolü | BazarX' })

const {
  loading, amount, cardFee, totalAmount, orderNumber, cardForm, cardBrand,
  selectedInstallment, installmentOptions, isFormValid, acceptTerms,
  formatCardNumber, formatExpiry, formatPrice, processPayment
} = useCreditCardPayment()
</script>