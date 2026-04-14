<template>
  <div
    class="vendor-tier-card"
    :style="{ '--tier-color': tierData?.color || '#4CAF50' }"
  >
    <!-- Current Tier Header -->
    <div
      class="tier-header"
      :style="{ background: tierData?.bgGradient }"
    >
      <div class="tier-icon">
        {{ tierData?.icon }}
      </div>
      <div class="tier-info">
        <h3 class="tier-name">
          {{ tierData?.nametr || tierData?.name }}
        </h3>
        <span class="tier-label">Satıcı Tier</span>
      </div>
      <div class="commission-badge">
        <div
          v-if="typeof tierData?.commissionRate === 'object'"
          class="multi-commission"
        >
          <div class="comm-row">
            <span class="comm-val">%{{ (tierData.commissionRate.cash * 100).toFixed(0) }}</span>
            <span class="comm-lbl">Nakit</span>
          </div>
          <div class="comm-row">
            <span class="comm-val">%{{ (tierData.commissionRate.barter * 100).toFixed(0) }}</span>
            <span class="comm-lbl">Barter</span>
          </div>
        </div>
        <div
          v-else
          class="single-commission"
        >
          <span class="commission-value">%{{ tierData?.commissionRate || currentCommissionRate }}</span>
          <span class="commission-label">Komisyon</span>
        </div>
      </div>
    </div>

    <!-- Stats Summary -->
    <div
      v-if="stats"
      class="tier-stats"
    >
      <div class="stat-item">
        <span class="stat-value">{{ stats.totalSales || 0 }}</span>
        <span class="stat-label">Satış</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ formatCurrency(stats.totalRevenue || 0) }}</span>
        <span class="stat-label">Ciro</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.averageRating?.toFixed(1) || '0.0' }} ⭐</span>
        <span class="stat-label">Puan</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.productCount || 0 }}</span>
        <span class="stat-label">Ürün</span>
      </div>
    </div>

    <!-- Regional Campaigns -->
    <div
      v-if="regional && (regional.multiplier > 1 || regional.burnRate > 0.25)"
      class="regional-campaign"
    >
      <div class="rc-content">
        <span class="rc-icon">🌍</span>
        <div class="rc-details">
          <h4 class="rc-title">
            {{ regional.city }}'ye Özel Fırsat!
            <span class="rc-badge">AKTİF</span>
          </h4>
          <p class="rc-desc">
            Şehrininize özel ayrıcalıkların tadını çıkarın:
          </p>
          <ul class="rc-list">
            <li v-if="regional.multiplier > 1">
              🚀 {{ regional.multiplier }}x daha fazla XP kazanın!
            </li>
            <li v-if="regional.burnRate > 0.25">
              🔥 Komisyonlarda %{{ (regional.burnRate * 100).toFixed(0) }}'a kadar
              indirim limiti!
            </li>
            <li v-if="regional.splits && regional.splits.COMMISSION < 0.5">
              💰 Daha yüksek reklam ve servis iadesi
              oranları!
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Benefits List -->
    <div class="tier-benefits">
      <h4 class="benefits-title">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        Tier Avantajları
      </h4>
      <ul class="benefits-list">
        <li
          v-for="(feature, index) in tierFeatures.slice(0, showAllBenefits ? undefined : 4)"
          :key="index"
        >
          <span class="benefit-check">✓</span>
          {{ feature }}
        </li>
      </ul>
      <button
        v-if="tierFeatures.length > 4"
        class="show-more-btn"
        @click="showAllBenefits = !showAllBenefits"
      >
        {{ showAllBenefits ? 'Daha az göster' : `+${tierFeatures.length - 4} daha fazla` }}
      </button>
    </div>

    <!-- Features Grid -->
    <div
      v-if="tierData?.description"
      class="tier-features"
    >
      <h4 class="features-title">
        Özellikler
      </h4>
      <p class="tier-description">
        {{ tierData.description }}
      </p>
      <div class="features-grid">
        <div
          class="feature-item"
          :class="{ active: tierData?.limits?.maxProducts >= 100 }"
        >
          <span class="feature-icon">📦</span>
          <span class="feature-name">Toplu Yükleme</span>
        </div>
        <div
          class="feature-item"
          :class="{ active: tierData?.roiRate >= 0.85 }"
        >
          <span class="feature-icon">🔌</span>
          <span class="feature-name">API Erişimi</span>
        </div>
        <div
          class="feature-item"
          :class="{ active: tierData?.limits?.featuredProductSlots > 0 }"
        >
          <span class="feature-icon">📌</span>
          <span class="feature-name">Öncelikli Listeleme</span>
        </div>
        <div
          class="feature-item"
          :class="{ active: tierData?.xpMultiplier >= 1.3 }"
        >
          <span class="feature-icon">📢</span>
          <span class="feature-name">Promosyon Araçları</span>
        </div>
        <div
          class="feature-item"
          :class="{ active: tierData?.roiRate >= 1.0 }"
        >
          <span class="feature-icon">👤</span>
          <span class="feature-name">Özel Destek</span>
        </div>
        <div
          class="feature-item"
          :class="{ active: tierData?.limits?.barterPoolLimit === null }"
        >
          <span class="feature-icon">🏪</span>
          <span class="feature-name">Özel Mağaza</span>
        </div>
      </div>
    </div>

    <!-- Limits Info -->
    <div
      v-if="tierData?.limits"
      class="tier-limits"
    >
      <div class="limit-item">
        <span class="limit-label">Maksimum Ürün</span>
        <span class="limit-value">{{ tierData.limits.maxProducts === -1 ? 'Sınırsız' : tierData.limits.maxProducts
        }}</span>
      </div>
      <div class="limit-item">
        <span class="limit-label">Öne Çıkan Slot</span>
        <span class="limit-value">{{ tierData.limits.featuredProductSlots }}</span>
      </div>
      <div class="limit-item">
        <span class="limit-label">Günlük Çekim</span>
        <span class="limit-value">{{ formatCurrency(tierData.limits.dailyWithdraw) }}</span>
      </div>
    </div>

    <!-- Progress to Next Tier -->
    <div
      v-if="progress && !progress.isMaxTier"
      class="tier-progress"
    >
      <div class="progress-header">
        <span class="progress-label">Sonraki: {{ progress.nextTierBenefits?.nametr }}</span>
        <span class="progress-icon">{{ progress.nextTierBenefits?.icon }}</span>
      </div>

      <div class="progress-bars">
        <div class="progress-bar-item">
          <div class="progress-bar-label">
            <span>Satışlar</span>
            <span>{{ progress.progress?.sales?.current }} / {{ progress.progress?.sales?.required }}</span>
          </div>
          <div class="progress-bar-track">
            <div
              class="progress-bar-fill"
              :style="{ width: `${Math.min(progress.progress?.sales?.percent || 0, 100)}%` }"
            />
          </div>
        </div>

        <div class="progress-bar-item">
          <div class="progress-bar-label">
            <span>Ciro</span>
            <span>{{ formatCurrency(progress.progress?.revenue?.current || 0) }} / {{
              formatCurrency(progress.progress?.revenue?.required || 0) }}</span>
          </div>
          <div class="progress-bar-track">
            <div
              class="progress-bar-fill"
              :style="{ width: `${Math.min(progress.progress?.revenue?.percent || 0, 100)}%` }"
            />
          </div>
        </div>

        <div class="progress-bar-item">
          <div class="progress-bar-label">
            <span>Ortalama Puan</span>
            <span>{{ progress.progress?.rating?.current?.toFixed(1) || '0.0' }} / {{ progress.progress?.rating?.required
            }}</span>
          </div>
          <div class="progress-bar-track">
            <div
              class="progress-bar-fill rating-bar"
              :style="{ width: `${Math.min(progress.progress?.rating?.percent || 0, 100)}%` }"
            />
          </div>
        </div>
      </div>

      <div
        v-if="progress?.progress?.revenue && progress.progress.revenue.current < progress.progress.revenue.required"
        class="progress-message"
      >
        🎯 Yeni seviyeye ulaşmanıza sadece <strong style="color:var(--tier-color)">{{
          formatCurrency(progress.progress.revenue.required - progress.progress.revenue.current) }}</strong> ciro kaldı!
      </div>

      <p
        v-if="!progress.canUpgrade"
        class="progress-note"
      >
        Tüm gereksinimleri karşıladığınızda tier'ınız otomatik yükseltilecektir.
      </p>
    </div>

    <!-- Max Tier Badge -->
    <div
      v-if="progress?.isMaxTier"
      class="max-tier-badge"
    >
      <span class="max-tier-icon">🏆</span>
      <span class="max-tier-text">{{ progress.message }}</span>
    </div>

    <!-- View All Tiers Link -->
    <NuxtLink
      to="/tier-info?type=vendor"
      class="view-all-link"
    >
      Tüm satıcı tier'larını karşılaştır →
    </NuxtLink>
  </div>
</template>

<script setup>
import { ref, computed } from '#imports'

const props = defineProps({
  tierData: {
    type: Object,
    default: () => ({})
  },
  progress: {
    type: Object,
    default: null
  },
  stats: {
    type: Object,
    default: null
  },
  regional: {
    type: Object,
    default: null
  },
  currentCommissionRate: {
    type: Number,
    default: 10
  }
})

const showAllBenefits = ref(false)

// Backend returns features as a string array (e.g. ["Temel Takas Özellikleri", ...])
const tierFeatures = computed(() => {
  return props.tierData?.features || props.tierData?.benefits || []
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)
}
</script>

<style scoped>
.vendor-tier-card {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.tier-header {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
  position: relative;
}

.tier-icon {
  font-size: 48px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.tier-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tier-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tier-label {
  font-size: 0.85rem;
  opacity: 0.9;
}

.commission-badge {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  border-radius: 12px;
  text-align: center;
}

.commission-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
}

.commission-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  opacity: 0.9;
}

.multi-commission {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comm-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 80px;
}

.comm-val {
  font-size: 1.1rem;
  font-weight: 700;
}

.comm-lbl {
  font-size: 0.6rem;
  text-transform: uppercase;
  opacity: 0.8;
}

.tier-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--tier-color);
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-secondary, #666);
  text-transform: uppercase;
}

.tier-benefits {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.benefits-title,
.features-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.benefits-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
  line-height: 1.4;
}

.benefit-check {
  color: #22c55e;
  font-weight: bold;
  flex-shrink: 0;
}

.show-more-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--tier-color);
  color: var(--tier-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.show-more-btn:hover {
  background: var(--tier-color);
  color: white;
}

.tier-features {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 10px;
  opacity: 0.4;
  transition: all 0.2s;
}

.feature-item.active {
  opacity: 1;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-name {
  font-size: 0.7rem;
  text-align: center;
  color: var(--text-secondary, #666);
}

.feature-item.active .feature-name {
  color: #16a34a;
  font-weight: 500;
}

.tier-limits {
  display: flex;
  justify-content: space-around;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.limit-item {
  text-align: center;
}

.limit-label {
  display: block;
  font-size: 0.7rem;
  color: var(--text-secondary, #666);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.limit-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
}

.tier-progress {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-label {
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
}

.progress-icon {
  font-size: 1.5rem;
}

.progress-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-bar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-secondary, #666);
}

.progress-bar-track {
  height: 8px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--tier-color);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-bar-fill.rating-bar {
  background: #f59e0b;
}

.progress-note {
  margin: 12px 0 0 0;
  font-size: 0.8rem;
  color: var(--text-secondary, #666);
  text-align: center;
  font-style: italic;
}

.max-tier-badge {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(106, 27, 154, 0.1) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.max-tier-icon {
  font-size: 1.5rem;
}

.max-tier-text {
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
}

.view-all-link {
  display: block;
  padding: 16px 24px;
  text-align: center;
  color: var(--tier-color);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
}

.view-all-link:hover {
  background: rgba(0, 0, 0, 0.02);
}

/* Responsive */
@media (max-width: 480px) {
  .tier-header {
    padding: 16px;
    flex-wrap: wrap;
  }

  .tier-icon {
    font-size: 36px;
  }

  .tier-name {
    font-size: 1.2rem;
  }

  .commission-badge {
    padding: 8px 12px;
  }

  .commission-value {
    font-size: 1.2rem;
  }

  .tier-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tier-limits {
    flex-wrap: wrap;
    gap: 16px;
  }

  .limit-item {
    flex: 1 1 45%;
  }
}

/* Regional Campaign Styles */
.regional-campaign {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.2) 100%);
  border-bottom: 1px solid rgba(16, 185, 129, 0.2);
  padding: 16px 24px;
  position: relative;
  overflow: hidden;
}

.rc-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  z-index: 2;
}

.rc-icon {
  font-size: 32px;
  line-height: 1;
  animation: bounce 2s infinite;
}

.rc-details {
  flex: 1;
}

.rc-title {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #065f46;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rc-badge {
  background: #fbbf24;
  color: #78350f;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  animation: pulse 2s infinite;
}

.rc-desc {
  margin: 0 0 6px 0;
  font-size: 0.85rem;
  color: #047857;
  opacity: 0.9;
}

.rc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rc-list li {
  font-size: 0.8rem;
  font-weight: 600;
  color: #064e3b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.progress-message {
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-primary, #1a1a1a);
  text-align: center;
  border: 1px dashed rgba(0, 0, 0, 0.1);
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}
</style>
