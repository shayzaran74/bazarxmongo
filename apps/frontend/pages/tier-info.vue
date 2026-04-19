<template>
  <div class="tier-info-page">
    <!-- Hero Section -->
    <section class="tier-hero">
      <div class="hero-content">
        <h1>Tier Avantajları</h1>
        <p>TicariTakas'ta daha fazla avantaj için tier'ınızı yükseltin</p>
      </div>
    </section>

    <!-- Tier Cards Grid -->
    <section class="tiers-section">
      <div class="tiers-grid">
        <TierBenefitsCard
          v-for="(tier, key) in TIER_BENEFITS"
          :key="key"
          :tier-data="tier"
          :class="{ current: currentUserTier === key }"
          :style="{ '--tier-color': tier.color }"
        />
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
      <h2>Sıkça Sorulan Sorular</h2>
      <div class="faq-list">
        <div class="faq-item">
          <h4>Tier'ım nasıl yükselir?</h4>
          <p>
            Tier'ınız, işlem hacminiz (XP) ve platform kullanımınıza göre otomatik olarak yükselir.
            İşlem yaptıkça, ürün ekledikçe ve takas gerçekleştirdikçe XP kazanırsınız.
          </p>
        </div>
        <div class="faq-item">
          <h4>Tier avantajları ne zaman geçerli olur?</h4>
          <p>
            Tier yükseltmeniz onaylandıktan hemen sonra tüm avantajlar (düşük komisyon, yüksek ROI vb.) aktif hale
            gelir.
          </p>
        </div>
        <div class="faq-item">
          <h4>XP nedir ve nasıl kazanılır?</h4>
          <p>
            XP (Deneyim Puanı), platformdaki aktifliğinizi ölçer. Her 10 TL'lik işlem size 1 XP kazandırır.
            Ayrıca referanslar ve onaylı işlemler ekstra XP kazandırır.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TIER_BENEFITS } from '~/utils/tierBenefits'

const currentUserTier = ref('CORE') // Default

onMounted(async () => {
  try {
    const { $api } = useApi()
    const myTierRes = await $api('/api/tiers/user')
    if (myTierRes.success && myTierRes.data.currentTier) {
      currentUserTier.value = myTierRes.data.currentTier.id || 'CORE'
    }
  } catch (e) {
    console.error("Tier fetch error", e);
  }
})

// SEO
useHead({
  title: 'Tier Avantajları - TicariTakas',
  meta: [
    { name: 'description', content: 'TicariTakas tier avantajlarını keşfedin. Daha fazla indirim, daha yüksek limitler ve özel ayrıcalıklar için tier\'ınızı yükseltin.' }
  ]
})
</script>

<style scoped>
.tier-info-page {
  min-height: 100vh;
  background: #f8fafc;
}

.tier-hero {
  background: linear-gradient(135deg, #1e3a5f 0%, #0f1f36 100%);
  padding: 60px 24px;
  text-align: center;
  color: white;
}

.hero-content h1 {
  margin: 0 0 12px 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.hero-content p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.tiers-section {
  padding: 40px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.tiers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.tier-card.current {
  border: 2px solid var(--tier-color);
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.faq-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 24px;
}

.faq-section h2 {
  text-align: center;
  margin: 0 0 32px 0;
  font-size: 1.75rem;
  color: #1e293b;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.faq-item {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.faq-item h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.faq-item p {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 1.75rem;
  }

  .tiers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
