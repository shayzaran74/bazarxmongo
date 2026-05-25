// apps/backend/src/modules/advertising/domain/enums/advertising.enums.ts

export enum AdType {
  BANNER = 'BANNER',
  SPONSORED_PRODUCT = 'SPONSORED_PRODUCT',
  SEARCH_AD = 'SEARCH_AD',
  SIDE_AD = 'SIDE_AD',
  VIDEO = 'VIDEO',
  REWARD_DISTRIBUTION = 'REWARD_DISTRIBUTION',
  SAMPLING = 'SAMPLING',
}

export enum AdSlotType {
  // Mevcut slot tipleri (geriye dönük uyumluluk)
  HOMEPAGE_BANNER = 'HOMEPAGE_BANNER',
  HOMEPAGE_SIDEBAR = 'HOMEPAGE_SIDEBAR',
  SEARCH_TOP = 'SEARCH_TOP',
  SEARCH_SIDEBAR = 'SEARCH_SIDEBAR',
  CATEGORY_TOP = 'CATEGORY_TOP',
  CATEGORY_SIDEBAR = 'CATEGORY_SIDEBAR',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  CART_SIDEBAR = 'CART_SIDEBAR',
  CHECKOUT_BANNER = 'CHECKOUT_BANNER',
  // GO Sprint kararı — listing önceliği ve özel slot tipleri
  UPPER_BANNER = 'UPPER_BANNER',           // 7 gün — ana sayfa üst banner
  LOWER_BANNER = 'LOWER_BANNER',           // 14 gün — ana sayfa alt banner
  FEATURED = 'FEATURED',                   // isFeatured=true listing önceliği
  FLASH_SALE = 'FLASH_SALE',               // isFlashSale=true listing önceliği
  SPECIAL_OFFER = 'SPECIAL_OFFER',         // isSpecialOffer=true listing önceliği
  AI_RECOMMENDATION = 'AI_RECOMMENDATION', // AI öneri boost katsayısı: 1.5
}

// GO slot tipleri için konfigürasyon sabiti
export const AD_SLOT_CONFIG: Partial<Record<AdSlotType, { defaultDays?: number; aiBoost?: number }>> = {
  [AdSlotType.UPPER_BANNER]:      { defaultDays: 7 },
  [AdSlotType.LOWER_BANNER]:      { defaultDays: 14 },
  [AdSlotType.FEATURED]:          {},
  [AdSlotType.FLASH_SALE]:        {},
  [AdSlotType.SPECIAL_OFFER]:     {},
  [AdSlotType.AI_RECOMMENDATION]: { aiBoost: 1.5 },
};

export enum BillingModel {
  PREPAID = 'PREPAID',
  POSTPAID = 'POSTPAID',
}

export enum PricingModel {
  CPC = 'CPC',
  CPM = 'CPM',
  CPA = 'CPA',
  FIXED = 'FIXED',
}

export enum TargetRole {
  ALL = 'ALL',
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
  B2B = 'B2B',
}

export enum AdStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED',
}
