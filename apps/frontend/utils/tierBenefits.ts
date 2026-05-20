export type TierKey = 'CORE' | 'PRIME' | 'ELITE' | 'APEX'

interface TierLimits {
    dailyWithdraw: number
    dailyTransfer: number
    barterPoolLimit: number | null
}

interface TierBenefit {
    label: string
    nametr: string
    icon: string
    color: string
    bgGradient: string
    commissionRate: { cash: number; barter: number }
    roiRate: number
    xpMultiplier: number
    burnRate: number
    limits: TierLimits
    description: string
    benefits: string[]
}

// Komisyon oranları: barter-rules.md §3 ile senkronize (2026-05-20)
// Standart oranlar — grup içi ve XP indirimi bu değerlerin üzerine uygulanır
export const TIER_BENEFITS: Record<TierKey, TierBenefit> = {
    CORE: {
        label: 'Core', nametr: 'Çekirdek', icon: '🌱',
        color: '#4CAF50', bgGradient: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        commissionRate: { cash: 0.12, barter: 0.12 }, // Standart: %12
        roiRate: 0.50, xpMultiplier: 1.0, burnRate: 50,
        limits: { dailyWithdraw: 10000, dailyTransfer: 15000, barterPoolLimit: 150000 },
        description: 'Başlangıç seviyesi. Temel takas ve ticaret özellikleri.',
        benefits: ['Temel takas ve ticaret özellikleri', '%12 Standart Komisyon',
            '%50 XP Geri Dönüş Oranı', 'Günlük 10.000 TL Çekim Limiti', '150.000 TL Barter Havuz Limiti']
    },
    PRIME: {
        label: 'Prime', nametr: 'Asil', icon: '⭐',
        color: '#2196F3', bgGradient: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
        commissionRate: { cash: 0.10, barter: 0.10 }, // Standart: %10
        roiRate: 0.65, xpMultiplier: 1.3, burnRate: 60,
        limits: { dailyWithdraw: 25000, dailyTransfer: 35000, barterPoolLimit: 500000 },
        description: 'Büyüyen işletmeler için artırılmış limitler ve avantajlar.',
        benefits: ['Gelişmiş takas özellikleri', '%10 Standart Komisyon',
            '%65 XP Geri Dönüş Oranı', '1.3x XP Çarpanı', 'Günlük 25.000 TL Çekim Limiti', '500.000 TL Barter Havuz Limiti']
    },
    ELITE: {
        label: 'Elite', nametr: 'Elit', icon: '🏢',
        color: '#FF9800', bgGradient: 'linear-gradient(135deg, #FF9800 0%, #E65100 100%)',
        commissionRate: { cash: 0.08, barter: 0.08 }, // Standart: %8
        roiRate: 0.85, xpMultiplier: 1.5, burnRate: 70,
        limits: { dailyWithdraw: 50000, dailyTransfer: 75000, barterPoolLimit: 1500000 },
        description: 'Yüksek hacimli ticaret yapanlar için özel oranlar.',
        benefits: ['Özel takas oranları', '%8 Standart Komisyon',
            '%85 XP Geri Dönüş Oranı', '1.5x XP Çarpanı', 'Günlük 50.000 TL Çekim Limiti',
            '1.500.000 TL Barter Havuz Limiti', 'Öncelikli Müşteri Desteği']
    },
    APEX: {
        label: 'Apex', nametr: 'Zirve', icon: '🏆',
        color: '#9C27B0', bgGradient: 'linear-gradient(135deg, #9C27B0 0%, #6A1B9A 100%)',
        commissionRate: { cash: 0.06, barter: 0.06 }, // Standart: %6
        roiRate: 1.00, xpMultiplier: 2.0, burnRate: 80,
        limits: { dailyWithdraw: 100000, dailyTransfer: 150000, barterPoolLimit: null },
        description: 'Sektör liderleri için sınırsız takas ve en düşük komisyonlar.',
        benefits: ['En düşük komisyon oranları', '%6 Standart Komisyon',
            '%100 XP Geri Dönüş Oranı', '2x XP Çarpanı', 'Sınırsız Barter Havuz Limiti',
            'VIP Müşteri Hizmetleri', 'Sınırsız Para Çekme Limiti']
    }
}

export const GLOBAL_CONFIG = {
    XP_BASE_RATE: 0.1,
    BARTER_BONUS_MULTIPLIER: 1.5,
    XP_BURN_SPLIT: { commission: 0.5, marketing: 0.5 },
    SECURE_STEP_DEPOSIT_RATE: 0.20,
    SECURE_STEP_COUNT: 5
}

export const X_AD_CATALOG = {
    CHAIN_BOOST:       { id: 'boost_7d',       price_xp: 15000, duration_days: 7,  label: 'Zincir Hızlandırma' },
    VITRIN:            { id: 'vitrin_7d',       price_xp: 25000, duration_days: 7,  label: 'Vitrin İlanı' },
    SPOTLIGHT:         { id: 'spotlight_24h',   price_xp: 50000, duration_days: 1,  label: "Günün Fırsatı" },
    PUSH_NOTIFICATION: { id: 'push_5k',         price_xp: 40000, count: 5000,        label: 'Bildirim Gönderimi' }
}

export const getTierBenefits = (tier: TierKey = 'CORE'): TierBenefit =>
    TIER_BENEFITS[tier] ?? TIER_BENEFITS.CORE

export const calculateCommission = (tier: TierKey, amount: number, type: 'cash' | 'barter' = 'cash'): number => {
    const rate = getTierBenefits(tier).commissionRate[type]
    return amount * rate
}

interface TierStats { totalVolume: number; totalXP: number }
interface TierProgress {
    isMaxTier: boolean
    nextTier?: TierKey | null
    requirements?: { volume: number; xp: number }
    progress?: number
}

export const calculateNextTierProgress = (currentTier: TierKey, stats: TierStats): TierProgress => {
    const tierOrder: TierKey[] = ['CORE', 'PRIME', 'ELITE', 'APEX']
    const idx = tierOrder.indexOf(currentTier)
    if (idx === tierOrder.length - 1) return { isMaxTier: true, nextTier: null, progress: 100 }

    const nextTier = tierOrder[idx + 1]
    const thresholds: Partial<Record<TierKey, { volume: number; xp: number }>> = {
        PRIME: { volume: 50000,   xp: 5000 },
        ELITE: { volume: 250000,  xp: 25000 },
        APEX:  { volume: 1000000, xp: 100000 }
    }
    const target = thresholds[nextTier]
    if (!target) return { isMaxTier: true }

    const volumeProgress = Math.min(100, (stats.totalVolume / target.volume) * 100)
    const xpProgress     = Math.min(100, (stats.totalXP    / target.xp)     * 100)

    return { isMaxTier: false, nextTier, requirements: target, progress: Math.max(volumeProgress, xpProgress) }
}
