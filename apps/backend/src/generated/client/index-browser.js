
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  phoneNumber: 'phoneNumber',
  password: 'password',
  transactionPin: 'transactionPin',
  role: 'role',
  status: 'status',
  platform: 'platform',
  isEmailVerified: 'isEmailVerified',
  googleId: 'googleId',
  lockoutUntil: 'lockoutUntil',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
  lastLoginAt: 'lastLoginAt',
  lastSeenAt: 'lastSeenAt',
  referredById: 'referredById'
};

exports.Prisma.UserProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  firstName: 'firstName',
  lastName: 'lastName',
  avatar: 'avatar',
  bio: 'bio',
  birthday: 'birthday',
  gender: 'gender',
  city: 'city',
  district: 'district'
};

exports.Prisma.UserAddressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  addressLine1: 'addressLine1',
  addressLine2: 'addressLine2',
  city: 'city',
  district: 'district',
  neighborhood: 'neighborhood',
  postalCode: 'postalCode',
  isDefault: 'isDefault',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.RefreshTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token',
  expiresAt: 'expiresAt',
  revokedAt: 'revokedAt',
  createdAt: 'createdAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  userAgent: 'userAgent',
  ipAddress: 'ipAddress',
  lastActiveAt: 'lastActiveAt',
  createdAt: 'createdAt'
};

exports.Prisma.LoginHistoryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  status: 'status',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token',
  type: 'type',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.SSOTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  provider: 'provider',
  providerId: 'providerId',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  createdAt: 'createdAt'
};

exports.Prisma.CompanyScalarFieldEnum = {
  id: 'id',
  taxNumber: 'taxNumber',
  name: 'name',
  address: 'address',
  phone: 'phone',
  email: 'email',
  website: 'website',
  logo: 'logo',
  registrationNumber: 'registrationNumber',
  taxOffice: 'taxOffice',
  representativeName: 'representativeName',
  representativePhone: 'representativePhone',
  vatRate: 'vatRate',
  status: 'status',
  verifiedAt: 'verifiedAt',
  companyType: 'companyType',
  tradeRegistryNumber: 'tradeRegistryNumber',
  mersisNumber: 'mersisNumber',
  kepAddress: 'kepAddress',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.CompanyUserScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  companyId: 'companyId',
  role: 'role'
};

exports.Prisma.VendorScalarFieldEnum = {
  id: 'id',
  status: 'status',
  companyId: 'companyId',
  createdAt: 'createdAt',
  ecosystemId: 'ecosystemId',
  isVerified: 'isVerified',
  lastAuditAt: 'lastAuditAt',
  membershipTierId: 'membershipTierId',
  rejectionReason: 'rejectionReason',
  slug: 'slug',
  suspensionReason: 'suspensionReason',
  tier: 'tier',
  updatedAt: 'updatedAt',
  userId: 'userId',
  verifiedAt: 'verifiedAt'
};

exports.Prisma.VendorProfileScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  storeName: 'storeName',
  description: 'description',
  logo: 'logo',
  banner: 'banner',
  supportEmail: 'supportEmail',
  isFeatured: 'isFeatured',
  featuredUntil: 'featuredUntil',
  city: 'city',
  district: 'district'
};

exports.Prisma.VendorSettingsScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  listingLimit: 'listingLimit',
  commissionRate: 'commissionRate',
  deliveryTimeDays: 'deliveryTimeDays',
  minOrderAmount: 'minOrderAmount',
  returnPolicy: 'returnPolicy',
  shippingPolicy: 'shippingPolicy',
  preferredCurrency: 'preferredCurrency',
  vatIncluded: 'vatIncluded',
  vacationMode: 'vacationMode',
  vacationEndAt: 'vacationEndAt',
  autoFulfill: 'autoFulfill',
  commissionAdjustments: 'commissionAdjustments'
};

exports.Prisma.VendorB2BDataScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  isB2B: 'isB2B',
  b2bTier: 'b2bTier',
  wholesaleEnabled: 'wholesaleEnabled',
  isBrandOwner: 'isBrandOwner',
  authorizedBrands: 'authorizedBrands',
  corporateCode: 'corporateCode',
  barterLimitOverride: 'barterLimitOverride',
  b2bWalletLimit: 'b2bWalletLimit',
  b2bCommRate: 'b2bCommRate'
};

exports.Prisma.VendorMetricsScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  totalRevenue: 'totalRevenue',
  monthlyOrderCount: 'monthlyOrderCount',
  returnRate: 'returnRate',
  avgResponseTimeMins: 'avgResponseTimeMins',
  adBudgetSpent: 'adBudgetSpent',
  lastCalculatedAt: 'lastCalculatedAt'
};

exports.Prisma.VendorFinancialsScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  taxOffice: 'taxOffice',
  bankAccountHolder: 'bankAccountHolder',
  bankIban: 'bankIban',
  bankName: 'bankName'
};

exports.Prisma.VendorStatsScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  rating: 'rating',
  reviewCount: 'reviewCount',
  activeListingCount: 'activeListingCount',
  loyaltyPoints: 'loyaltyPoints',
  trustScore: 'trustScore',
  lastSyncAt: 'lastSyncAt'
};

exports.Prisma.VendorBannerScalarFieldEnum = {
  id: 'id',
  type: 'type',
  template: 'template',
  order: 'order',
  status: 'status',
  createdAt: 'createdAt',
  imageUrl: 'imageUrl',
  isActive: 'isActive',
  linkUrl: 'linkUrl',
  rejectionReason: 'rejectionReason',
  targetCities: 'targetCities',
  targetDistricts: 'targetDistricts',
  updatedAt: 'updatedAt',
  vendorId: 'vendorId'
};

exports.Prisma.VendorFollowerScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  userId: 'userId',
  vendorId: 'vendorId'
};

exports.Prisma.VendorBankAccountScalarFieldEnum = {
  id: 'id',
  iban: 'iban',
  accountHolderName: 'accountHolderName',
  accountNumber: 'accountNumber',
  bankName: 'bankName',
  createdAt: 'createdAt',
  isPrimary: 'isPrimary',
  updatedAt: 'updatedAt',
  vendorId: 'vendorId'
};

exports.Prisma.VendorCategoryScalarFieldEnum = {
  categoryId: 'categoryId',
  createdAt: 'createdAt',
  vendorId: 'vendorId'
};

exports.Prisma.BrandEcosystemScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  status: 'status',
  createdAt: 'createdAt',
  internalCommRate: 'internalCommRate',
  isBlindPool: 'isBlindPool',
  logoUrl: 'logoUrl',
  ownerId: 'ownerId',
  updatedAt: 'updatedAt'
};

exports.Prisma.EcosystemAuditLogScalarFieldEnum = {
  id: 'id',
  action: 'action',
  details: 'details',
  severity: 'severity',
  createdAt: 'createdAt',
  ecosystemId: 'ecosystemId',
  vendorId: 'vendorId'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  planName: 'planName',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  autoRenew: 'autoRenew',
  features: 'features',
  priceTL: 'priceTL',
  priceBarter: 'priceBarter',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  listingLimit: 'listingLimit',
  commissionDiscount: 'commissionDiscount'
};

exports.Prisma.CatalogModelScalarFieldEnum = {
  id: 'id',
  modelCode: 'modelCode',
  name: 'name',
  slug: 'slug',
  brand: 'brand',
  description: 'description',
  attributes: 'attributes',
  categoryId: 'categoryId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CatalogProductScalarFieldEnum = {
  id: 'id',
  gtin: 'gtin',
  name: 'name',
  slug: 'slug',
  brand: 'brand',
  description: 'description',
  specs: 'specs',
  categoryId: 'categoryId',
  productTypeId: 'productTypeId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  rating: 'rating',
  isFeatured: 'isFeatured',
  modelId: 'modelId',
  attributes: 'attributes',
  metadata: 'metadata',
  sourceUrl: 'sourceUrl',
  scrapedAt: 'scrapedAt',
  isFlashSale: 'isFlashSale',
  status: 'status',
  isSpecialOffer: 'isSpecialOffer'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  icon: 'icon',
  parentId: 'parentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  description: 'description',
  order: 'order',
  isActive: 'isActive',
  badgeColor: 'badgeColor',
  badgeText: 'badgeText',
  type: 'type',
  image: 'image',
  attributeTemplate: 'attributeTemplate',
  colorFrom: 'colorFrom',
  colorTo: 'colorTo',
  hoverColor: 'hoverColor',
  shadowColor: 'shadowColor',
  isFeatured: 'isFeatured',
  megaMenuColor: 'megaMenuColor',
  megaMenuIcon: 'megaMenuIcon',
  megaMenuOrder: 'megaMenuOrder',
  blurhash: 'blurhash'
};

exports.Prisma.BrandScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  icon: 'icon',
  image: 'image',
  order: 'order',
  aliases: 'aliases',
  description: 'description',
  status: 'status',
  isOfficial: 'isOfficial',
  isPopular: 'isPopular',
  popularityScore: 'popularityScore',
  productCount: 'productCount',
  violationCount: 'violationCount',
  approvedAt: 'approvedAt',
  rejectedAt: 'rejectedAt',
  rejectionReason: 'rejectionReason',
  reviewedBy: 'reviewedBy',
  submittedAt: 'submittedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  vendorId: 'vendorId',
  blurhash: 'blurhash'
};

exports.Prisma.BrandViolationScalarFieldEnum = {
  id: 'id',
  description: 'description',
  status: 'status',
  severity: 'severity',
  adminNotes: 'adminNotes',
  brandId: 'brandId',
  createdAt: 'createdAt',
  evidenceUrls: 'evidenceUrls',
  relatedProductIds: 'relatedProductIds',
  relatedVendorId: 'relatedVendorId',
  reporterId: 'reporterId',
  reporterType: 'reporterType',
  resolvedAt: 'resolvedAt',
  resolvedBy: 'resolvedBy',
  updatedAt: 'updatedAt',
  violationType: 'violationType'
};

exports.Prisma.ProductTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  schema: 'schema',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ListingScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  catalogProductId: 'catalogProductId',
  title: 'title',
  description: 'description',
  price: 'price',
  stock: 'stock',
  status: 'status',
  visibility: 'visibility',
  isPromoted: 'isPromoted',
  promotedPrice: 'promotedPrice',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  originalPrice: 'originalPrice',
  condition: 'condition',
  wholesalePrice: 'wholesalePrice',
  minWholesaleQty: 'minWholesaleQty',
  sku: 'sku',
  isDigital: 'isDigital',
  isB2BOnly: 'isB2BOnly',
  b2bDiscount: 'b2bDiscount',
  shippingTemplateId: 'shippingTemplateId',
  tags: 'tags',
  isFeatured: 'isFeatured',
  featuredUntil: 'featuredUntil',
  slug: 'slug',
  listingType: 'listingType',
  isAuctionEnabled: 'isAuctionEnabled',
  isLotteryEnabled: 'isLotteryEnabled',
  lastStatusChangedAt: 'lastStatusChangedAt',
  rejectionReason: 'rejectionReason',
  isSpecialOffer: 'isSpecialOffer',
  isFlashSale: 'isFlashSale',
  minMarketPrice: 'minMarketPrice',
  maxPurchasePerMember: 'maxPurchasePerMember',
  ecosystemId: 'ecosystemId',
  variantOptions: 'variantOptions',
  integrationCode: 'integrationCode',
  isActive: 'isActive',
  commissionRate: 'commissionRate',
  metadata: 'metadata',
  weight: 'weight',
  volume: 'volume',
  variants: 'variants',
  availableQuantity: 'availableQuantity',
  reservedQuantity: 'reservedQuantity',
  isSponsored: 'isSponsored',
  lowStockThreshold: 'lowStockThreshold',
  sponsorBudget: 'sponsorBudget'
};

exports.Prisma.ListingImageScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  url: 'url',
  order: 'order',
  createdAt: 'createdAt'
};

exports.Prisma.ListingPriceHistoryScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  price: 'price',
  changedAt: 'changedAt'
};

exports.Prisma.ListingStatsScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  views: 'views',
  sales: 'sales',
  updatedAt: 'updatedAt'
};

exports.Prisma.ListingAnalyticScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  views: 'views',
  clicks: 'clicks',
  sales: 'sales',
  revenue: 'revenue',
  date: 'date'
};

exports.Prisma.ProductMediaScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  url: 'url',
  blurhash: 'blurhash',
  type: 'type',
  sortOrder: 'sortOrder'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  rating: 'rating',
  comment: 'comment',
  images: 'images',
  isApproved: 'isApproved',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isVerified: 'isVerified',
  orderId: 'orderId',
  catalogProductId: 'catalogProductId'
};

exports.Prisma.FavoriteScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  catalogProductId: 'catalogProductId',
  createdAt: 'createdAt'
};

exports.Prisma.CategoryAttributeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  label: 'label',
  type: 'type',
  options: 'options',
  unit: 'unit',
  placeholder: 'placeholder',
  order: 'order',
  categoryId: 'categoryId',
  createdAt: 'createdAt',
  isActive: 'isActive',
  isFilterable: 'isFilterable',
  isRequired: 'isRequired',
  isVariant: 'isVariant',
  updatedAt: 'updatedAt',
  surplusCategoryId: 'surplusCategoryId'
};

exports.Prisma.CollectionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  image: 'image',
  isPublic: 'isPublic',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CollectionProductScalarFieldEnum = {
  id: 'id',
  collectionId: 'collectionId',
  listingId: 'listingId',
  order: 'order'
};

exports.Prisma.CampaignScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  type: 'type',
  discountValue: 'discountValue',
  startDate: 'startDate',
  endDate: 'endDate',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GroupBuyScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  targetQuantity: 'targetQuantity',
  currentQuantity: 'currentQuantity',
  price: 'price',
  endDate: 'endDate',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.WarehouseScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  name: 'name',
  address: 'address',
  city: 'city',
  isDefault: 'isDefault',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StockScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  warehouseId: 'warehouseId',
  quantity: 'quantity',
  reservedQuantity: 'reservedQuantity',
  updatedAt: 'updatedAt'
};

exports.Prisma.StockReservationScalarFieldEnum = {
  id: 'id',
  stockId: 'stockId',
  orderId: 'orderId',
  quantity: 'quantity',
  expiresAt: 'expiresAt',
  isComplete: 'isComplete',
  createdAt: 'createdAt'
};

exports.Prisma.PurchaseOrderScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  supplierName: 'supplierName',
  status: 'status',
  totalAmount: 'totalAmount',
  orderedAt: 'orderedAt',
  receivedAt: 'receivedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PurchaseOrderItemScalarFieldEnum = {
  id: 'id',
  purchaseOrderId: 'purchaseOrderId',
  listingId: 'listingId',
  quantity: 'quantity',
  receivedQty: 'receivedQty',
  unitPrice: 'unitPrice'
};

exports.Prisma.TransferScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  fromWarehouseId: 'fromWarehouseId',
  toWarehouseId: 'toWarehouseId',
  status: 'status',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransferItemScalarFieldEnum = {
  id: 'id',
  transferId: 'transferId',
  listingId: 'listingId',
  quantity: 'quantity'
};

exports.Prisma.InventoryLogScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  listingId: 'listingId',
  quantity: 'quantity',
  type: 'type',
  referenceType: 'referenceType',
  referenceId: 'referenceId',
  createdAt: 'createdAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  vendorId: 'vendorId',
  status: 'status',
  totalAmount: 'totalAmount',
  shippingAddress: 'shippingAddress',
  billingAddress: 'billingAddress',
  paymentMethod: 'paymentMethod',
  shippingMethod: 'shippingMethod',
  trackingNumber: 'trackingNumber',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  paymentStatus: 'paymentStatus',
  vendorStatus: 'vendorStatus',
  buyerStatus: 'buyerStatus',
  currency: 'currency',
  discountAmount: 'discountAmount',
  orderNumber: 'orderNumber',
  payoutStatus: 'payoutStatus',
  paidWithXP: 'paidWithXP',
  paidWithCash: 'paidWithCash',
  paidAt: 'paidAt',
  paymentIntentId: 'paymentIntentId',
  metadata: 'metadata',
  couponCode: 'couponCode',
  shippingCarrier: 'shippingCarrier',
  estimatedDelivery: 'estimatedDelivery',
  escrowStatus: 'escrowStatus',
  escrowReleaseAt: 'escrowReleaseAt',
  payoutEligibleAt: 'payoutEligibleAt',
  shippingCost: 'shippingCost'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  listingId: 'listingId',
  quantity: 'quantity',
  price: 'price',
  totalAmount: 'totalAmount',
  productName: 'productName',
  productImages: 'productImages',
  variantInfo: 'variantInfo'
};

exports.Prisma.CartScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CartItemScalarFieldEnum = {
  id: 'id',
  cartId: 'cartId',
  listingId: 'listingId',
  quantity: 'quantity',
  addedAt: 'addedAt',
  variantId: 'variantId'
};

exports.Prisma.OrderStatusHistoryScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  userId: 'userId',
  status: 'status',
  note: 'note',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderReturnScalarFieldEnum = {
  id: 'id',
  reason: 'reason',
  status: 'status',
  createdAt: 'createdAt',
  orderId: 'orderId',
  receiptUrl: 'receiptUrl',
  refundAmount: 'refundAmount',
  updatedAt: 'updatedAt'
};

exports.Prisma.DisputeScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  userId: 'userId',
  vendorId: 'vendorId',
  reason: 'reason',
  description: 'description',
  status: 'status',
  evidenceUrls: 'evidenceUrls',
  adminNote: 'adminNote',
  resolvedAt: 'resolvedAt',
  resolutionType: 'resolutionType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SurplusCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  icon: 'icon',
  parentId: 'parentId',
  order: 'order',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SurplusItemScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  title: 'title',
  description: 'description',
  category: 'category',
  materialType: 'materialType',
  quantity: 'quantity',
  blockedQuantity: 'blockedQuantity',
  unit: 'unit',
  minTradeQuantity: 'minTradeQuantity',
  unitPrice: 'unitPrice',
  wantedCategories: 'wantedCategories',
  tradeModes: 'tradeModes',
  technicalSpecs: 'technicalSpecs',
  images: 'images',
  location: 'location',
  city: 'city',
  status: 'status',
  reactivationCount: 'reactivationCount',
  lastReactivatedAt: 'lastReactivatedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  latitude: 'latitude',
  longitude: 'longitude',
  metadata: 'metadata'
};

exports.Prisma.WantedItemScalarFieldEnum = {
  id: 'id',
  keywords: 'keywords',
  description: 'description',
  latitude: 'latitude',
  longitude: 'longitude',
  categoryId: 'categoryId',
  companyId: 'companyId',
  createdAt: 'createdAt',
  isActive: 'isActive',
  listingType: 'listingType',
  maxPrice: 'maxPrice',
  minPrice: 'minPrice',
  updatedAt: 'updatedAt',
  userId: 'userId',
  status: 'status',
  type: 'type'
};

exports.Prisma.DemandMatchScalarFieldEnum = {
  id: 'id',
  score: 'score',
  notes: 'notes',
  actionAt: 'actionAt',
  actionBy: 'actionBy',
  buyerItemId: 'buyerItemId',
  createdAt: 'createdAt',
  matchType: 'matchType',
  rejectionReason: 'rejectionReason',
  sellerItemId: 'sellerItemId',
  surplusItemId: 'surplusItemId',
  updatedAt: 'updatedAt',
  status: 'status'
};

exports.Prisma.TradeOfferScalarFieldEnum = {
  id: 'id',
  fromCompanyId: 'fromCompanyId',
  toCompanyId: 'toCompanyId',
  offeredItemId: 'offeredItemId',
  requestedItemId: 'requestedItemId',
  message: 'message',
  status: 'status',
  chainId: 'chainId',
  parentOfferId: 'parentOfferId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  legalAcceptedAt: 'legalAcceptedAt',
  downPaymentHoldId: 'downPaymentHoldId',
  acceptedAt: 'acceptedAt',
  cancelledAt: 'cancelledAt',
  cashAmount: 'cashAmount',
  cashDirection: 'cashDirection',
  cashCurrency: 'cashCurrency',
  completedAt: 'completedAt',
  counterOfferId: 'counterOfferId',
  expiresAt: 'expiresAt',
  initiatorId: 'initiatorId',
  initiatorType: 'initiatorType',
  receiverId: 'receiverId',
  receiverType: 'receiverType',
  rejectedAt: 'rejectedAt'
};

exports.Prisma.TradeOfferItemScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  surplusItemId: 'surplusItemId',
  quantity: 'quantity',
  estimatedValue: 'estimatedValue',
  offeredOfferId: 'offeredOfferId',
  requestedOfferId: 'requestedOfferId'
};

exports.Prisma.SwapSessionScalarFieldEnum = {
  id: 'id',
  tradeOfferId: 'tradeOfferId',
  initiatorId: 'initiatorId',
  receiverId: 'receiverId',
  shipmentMode: 'shipmentMode',
  shipments: 'shipments',
  escrowId: 'escrowId',
  collateralAmount: 'collateralAmount',
  collateralCurrency: 'collateralCurrency',
  collateralStatus: 'collateralStatus',
  collateralLockedAt: 'collateralLockedAt',
  collateralReleasedAt: 'collateralReleasedAt',
  collateralForfeitedAt: 'collateralForfeitedAt',
  fromCollateralHoldId: 'fromCollateralHoldId',
  toCollateralHoldId: 'toCollateralHoldId',
  status: 'status',
  timeoutAt: 'timeoutAt',
  completedAt: 'completedAt',
  cancelledAt: 'cancelledAt',
  cancelledReason: 'cancelledReason',
  disputedAt: 'disputedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BarterPartScalarFieldEnum = {
  id: 'id',
  swapSessionId: 'swapSessionId',
  partNumber: 'partNumber',
  senderId: 'senderId',
  recipientId: 'recipientId',
  trackingCode: 'trackingCode',
  carrier: 'carrier',
  status: 'status',
  shippedAt: 'shippedAt',
  deliveredAt: 'deliveredAt',
  confirmedAt: 'confirmedAt',
  disputedAt: 'disputedAt',
  disputeWindowEndsAt: 'disputeWindowEndsAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TradeCompletionScalarFieldEnum = {
  id: 'id',
  notes: 'notes',
  cashDifference: 'cashDifference',
  completedAt: 'completedAt',
  fromItemQuantity: 'fromItemQuantity',
  toItemQuantity: 'toItemQuantity',
  tradeOfferId: 'tradeOfferId'
};

exports.Prisma.TradeReviewScalarFieldEnum = {
  id: 'id',
  rating: 'rating',
  comment: 'comment',
  createdAt: 'createdAt',
  fromUserId: 'fromUserId',
  mediaUrl: 'mediaUrl',
  toUserId: 'toUserId',
  tradeOfferId: 'tradeOfferId'
};

exports.Prisma.TradeChainScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt',
  matchScore: 'matchScore',
  totalValue: 'totalValue',
  updatedAt: 'updatedAt',
  status: 'status'
};

exports.Prisma.TradeMatchScalarFieldEnum = {
  id: 'id',
  offerId: 'offerId',
  completedAt: 'completedAt',
  matchScore: 'matchScore',
  proximityScore: 'proximityScore'
};

exports.Prisma.BarterDisputeLogScalarFieldEnum = {
  id: 'id',
  swapSessionId: 'swapSessionId',
  tradeOfferId: 'tradeOfferId',
  openedById: 'openedById',
  respondentId: 'respondentId',
  tradeValueInKurus: 'tradeValueInKurus',
  reason: 'reason',
  evidence: 'evidence',
  status: 'status',
  arbitratorType: 'arbitratorType',
  arbitratorId: 'arbitratorId',
  resolution: 'resolution',
  resolutionNote: 'resolutionNote',
  costChargedToId: 'costChargedToId',
  resolutionDeadlineAt: 'resolutionDeadlineAt',
  resolvedAt: 'resolvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuctionScalarFieldEnum = {
  id: 'id',
  status: 'status',
  createdAt: 'createdAt',
  currentPrice: 'currentPrice',
  currentWinnerStep: 'currentWinnerStep',
  endTime: 'endTime',
  listingId: 'listingId',
  minBidIncrement: 'minBidIncrement',
  participationDeposit: 'participationDeposit',
  paymentDeadline: 'paymentDeadline',
  startTime: 'startTime',
  startingPrice: 'startingPrice',
  updatedAt: 'updatedAt',
  userId: 'userId',
  winner2Id: 'winner2Id',
  winner3Id: 'winner3Id',
  winnerId: 'winnerId'
};

exports.Prisma.AuctionWinnerScalarFieldEnum = {
  id: 'id',
  position: 'position',
  amount: 'amount',
  auctionId: 'auctionId',
  createdAt: 'createdAt',
  userId: 'userId'
};

exports.Prisma.AuctionParticipationScalarFieldEnum = {
  id: 'id',
  status: 'status',
  auctionId: 'auctionId',
  blockedAmount: 'blockedAmount',
  createdAt: 'createdAt',
  holdId: 'holdId',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.AuctionBidScalarFieldEnum = {
  id: 'id',
  amount: 'amount',
  auctionId: 'auctionId',
  createdAt: 'createdAt',
  userId: 'userId'
};

exports.Prisma.LotteryScalarFieldEnum = {
  id: 'id',
  title: 'title',
  prizeDescription: 'prizeDescription',
  ticketPrice: 'ticketPrice',
  status: 'status',
  winnerId: 'winnerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  endTime: 'endTime',
  maxTicketsPerUser: 'maxTicketsPerUser',
  ownerId: 'ownerId',
  startTime: 'startTime',
  ticketDigits: 'ticketDigits',
  totalTickets: 'totalTickets',
  numbersPerTicket: 'numbersPerTicket',
  prizeValue: 'prizeValue',
  winningNumber: 'winningNumber',
  listingId: 'listingId'
};

exports.Prisma.LotteryTicketScalarFieldEnum = {
  id: 'id',
  lotteryId: 'lotteryId',
  userId: 'userId',
  createdAt: 'createdAt',
  numbers: 'numbers'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  USER: 'USER',
  VENDOR: 'VENDOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION'
};

exports.Platform = exports.$Enums.Platform = {
  BAZARX: 'BAZARX',
  BARTERBORSA: 'BARTERBORSA'
};

exports.VendorStatus = exports.$Enums.VendorStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED'
};

exports.VendorTier = exports.$Enums.VendorTier = {
  CORE: 'CORE',
  PLUS: 'PLUS',
  PREMIUM: 'PREMIUM',
  ELITE: 'ELITE'
};

exports.PilotCity = exports.$Enums.PilotCity = {
  ISTANBUL: 'ISTANBUL',
  ANKARA: 'ANKARA',
  IZMIR: 'IZMIR',
  HATAY: 'HATAY'
};

exports.B2BTier = exports.$Enums.B2BTier = {
  NONE: 'NONE',
  STARTER: 'STARTER',
  GROWTH: 'GROWTH',
  ENTERPRISE: 'ENTERPRISE'
};

exports.AdStatus = exports.$Enums.AdStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED'
};

exports.CategoryType = exports.$Enums.CategoryType = {
  GENERAL: 'GENERAL',
  BARTER: 'BARTER',
  RESTAURANT: 'RESTAURANT',
  SERVICE: 'SERVICE'
};

exports.BrandStatus = exports.$Enums.BrandStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED'
};

exports.ListingStatus = exports.$Enums.ListingStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED'
};

exports.ListingVisibility = exports.$Enums.ListingVisibility = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  ECOSYSTEM_ONLY: 'ECOSYSTEM_ONLY',
  B2B_ONLY: 'B2B_ONLY'
};

exports.ProductCondition = exports.$Enums.ProductCondition = {
  NEW: 'NEW',
  LIKE_NEW: 'LIKE_NEW',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  REFURBISHED: 'REFURBISHED'
};

exports.CampaignType = exports.$Enums.CampaignType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
  FREE_SHIPPING: 'FREE_SHIPPING',
  BUY_X_GET_Y: 'BUY_X_GET_Y'
};

exports.PurchaseOrderStatus = exports.$Enums.PurchaseOrderStatus = {
  Draft: 'Draft',
  Ordered: 'Ordered',
  PartiallyReceived: 'PartiallyReceived',
  Received: 'Received',
  Cancelled: 'Cancelled'
};

exports.TransferStatus = exports.$Enums.TransferStatus = {
  Pending: 'Pending',
  InTransit: 'InTransit',
  PartiallyReceived: 'PartiallyReceived',
  Completed: 'Completed',
  Cancelled: 'Cancelled'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  IYZICO: 'IYZICO',
  BANK_TRANSFER: 'BANK_TRANSFER',
  WALLET: 'WALLET',
  BARTER: 'BARTER',
  GIFT_CARD: 'GIFT_CARD',
  MIXED: 'MIXED'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED'
};

exports.DisputeStatus = exports.$Enums.DisputeStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED'
};

exports.SurplusStatus = exports.$Enums.SurplusStatus = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ACTIVE: 'ACTIVE',
  RESERVED: 'RESERVED',
  TRADED: 'TRADED',
  EXPIRED: 'EXPIRED',
  DEACTIVATED: 'DEACTIVATED'
};

exports.ListingType = exports.$Enums.ListingType = {
  BUY: 'BUY',
  SELL: 'SELL',
  BARTER: 'BARTER',
  BOTH: 'BOTH'
};

exports.WantedItemStatus = exports.$Enums.WantedItemStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  MATCHED: 'MATCHED',
  FULFILLED: 'FULFILLED',
  EXPIRED: 'EXPIRED'
};

exports.WantedItemType = exports.$Enums.WantedItemType = {
  PRODUCT: 'PRODUCT',
  SERVICE: 'SERVICE',
  MATERIAL: 'MATERIAL'
};

exports.DemandMatchType = exports.$Enums.DemandMatchType = {
  SURPLUS_TO_WANTED: 'SURPLUS_TO_WANTED',
  WANTED_TO_SURPLUS: 'WANTED_TO_SURPLUS',
  SURPLUS_TO_SURPLUS: 'SURPLUS_TO_SURPLUS'
};

exports.DemandMatchStatus = exports.$Enums.DemandMatchStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED'
};

exports.TradeOfferStatus = exports.$Enums.TradeOfferStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  COUNTER_OFFERED: 'COUNTER_OFFERED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  LEGAL_PENDING: 'LEGAL_PENDING'
};

exports.SwapSessionStatus = exports.$Enums.SwapSessionStatus = {
  PENDING_COLLATERAL: 'PENDING_COLLATERAL',
  ACTIVE: 'ACTIVE',
  SHIPPING: 'SHIPPING',
  PARTIALLY_COMPLETED: 'PARTIALLY_COMPLETED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
  TIMEOUT: 'TIMEOUT'
};

exports.BarterPartStatus = exports.$Enums.BarterPartStatus = {
  PENDING: 'PENDING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CONFIRMED: 'CONFIRMED',
  DISPUTED: 'DISPUTED'
};

exports.TradeChainStatus = exports.$Enums.TradeChainStatus = {
  DRAFT: 'DRAFT',
  PROPOSED: 'PROPOSED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.ArbitratorType = exports.$Enums.ArbitratorType = {
  INTERNAL: 'INTERNAL',
  EXTERNAL: 'EXTERNAL'
};

exports.AuctionStatus = exports.$Enums.AuctionStatus = {
  SCHEDULED: 'SCHEDULED',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.ParticipationStatus = exports.$Enums.ParticipationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  DEPOSIT_HELD: 'DEPOSIT_HELD',
  ACTIVE: 'ACTIVE',
  WON: 'WON',
  LOST: 'LOST',
  REFUNDED: 'REFUNDED'
};

exports.LotteryStatus = exports.$Enums.LotteryStatus = {
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
  DRAWN: 'DRAWN',
  CANCELLED: 'CANCELLED'
};

exports.Prisma.ModelName = {
  User: 'User',
  UserProfile: 'UserProfile',
  UserAddress: 'UserAddress',
  RefreshToken: 'RefreshToken',
  Session: 'Session',
  LoginHistory: 'LoginHistory',
  VerificationToken: 'VerificationToken',
  SSOToken: 'SSOToken',
  Company: 'Company',
  CompanyUser: 'CompanyUser',
  Vendor: 'Vendor',
  VendorProfile: 'VendorProfile',
  VendorSettings: 'VendorSettings',
  VendorB2BData: 'VendorB2BData',
  VendorMetrics: 'VendorMetrics',
  VendorFinancials: 'VendorFinancials',
  VendorStats: 'VendorStats',
  VendorBanner: 'VendorBanner',
  VendorFollower: 'VendorFollower',
  VendorBankAccount: 'VendorBankAccount',
  VendorCategory: 'VendorCategory',
  BrandEcosystem: 'BrandEcosystem',
  EcosystemAuditLog: 'EcosystemAuditLog',
  Subscription: 'Subscription',
  CatalogModel: 'CatalogModel',
  CatalogProduct: 'CatalogProduct',
  Category: 'Category',
  Brand: 'Brand',
  BrandViolation: 'BrandViolation',
  ProductType: 'ProductType',
  Listing: 'Listing',
  ListingImage: 'ListingImage',
  ListingPriceHistory: 'ListingPriceHistory',
  ListingStats: 'ListingStats',
  ListingAnalytic: 'ListingAnalytic',
  ProductMedia: 'ProductMedia',
  Review: 'Review',
  Favorite: 'Favorite',
  CategoryAttribute: 'CategoryAttribute',
  Collection: 'Collection',
  CollectionProduct: 'CollectionProduct',
  Campaign: 'Campaign',
  GroupBuy: 'GroupBuy',
  Warehouse: 'Warehouse',
  Stock: 'Stock',
  StockReservation: 'StockReservation',
  PurchaseOrder: 'PurchaseOrder',
  PurchaseOrderItem: 'PurchaseOrderItem',
  Transfer: 'Transfer',
  TransferItem: 'TransferItem',
  InventoryLog: 'InventoryLog',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Cart: 'Cart',
  CartItem: 'CartItem',
  OrderStatusHistory: 'OrderStatusHistory',
  OrderReturn: 'OrderReturn',
  Dispute: 'Dispute',
  SurplusCategory: 'SurplusCategory',
  SurplusItem: 'SurplusItem',
  WantedItem: 'WantedItem',
  DemandMatch: 'DemandMatch',
  TradeOffer: 'TradeOffer',
  TradeOfferItem: 'TradeOfferItem',
  SwapSession: 'SwapSession',
  BarterPart: 'BarterPart',
  TradeCompletion: 'TradeCompletion',
  TradeReview: 'TradeReview',
  TradeChain: 'TradeChain',
  TradeMatch: 'TradeMatch',
  BarterDisputeLog: 'BarterDisputeLog',
  Auction: 'Auction',
  AuctionWinner: 'AuctionWinner',
  AuctionParticipation: 'AuctionParticipation',
  AuctionBid: 'AuctionBid',
  Lottery: 'Lottery',
  LotteryTicket: 'LotteryTicket'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
