// packages/shared/shared-persistence/src/index.ts

export * from './mongodb/base-mongo.repository';
export * from './mongodb/model-proxy';

// Audit repository
export * from './mongodb/audit/audit-log.repository';
export * from './mongodb/audit/audit-log.mapper';

// Cascade middleware factory
export * from './mongodb/cascade-middleware.factory';

// Order repository
export * from './mongodb/order/order.repository';

// Outbox repository — ADR-005 §8.1
export { OutboxMessageSchema, OutboxStatus, IOutboxMessage, OutboxStatusType } from './schemas/backend/outbox-message.schema';
export * from './mongodb/outbox/mongo-outbox.repository';

// Catalog schemas — Listing/Category/Brand/Image/PriceHistory/Stats/Analytic
export { ListingSchema, Listing, IListing, ListingStatus, ListingStatusType, ListingVisibility, ListingVisibilityType, ProductCondition, ProductConditionType } from './schemas/backend/listing.schema';
export { ListingImageSchema, ListingImage, IListingImage } from './schemas/backend/listingImage.schema';
export { ListingPriceHistorySchema, ListingPriceHistory, IListingPriceHistory } from './schemas/backend/listingPriceHistory.schema';
export { ListingStatsSchema, ListingStats, IListingStats } from './schemas/backend/listingStats.schema';
export { ListingAnalyticSchema, ListingAnalytic, IListingAnalytic } from './schemas/backend/listingAnalytic.schema';
export { CategorySchema, Category, ICategory } from './schemas/backend/category.schema';
export { BrandSchema, Brand, IBrand } from './schemas/backend/brand.schema';
export { CategoryAttributeSchema, CategoryAttribute, ICategoryAttribute } from './schemas/backend/categoryAttribute.schema';

// Catalog repository — atomic stock management + query methods
export * from './mongodb/catalog/listing.repository';

// Inventory schemas + repository
export { InventoryLogSchema, InventoryLog, IInventoryLog, InventoryLogType, InventoryLogTypeType } from './schemas/backend/inventoryLog.schema';
export { StockSchema, Stock, IStock } from './schemas/backend/stock.schema';
export { StockReservationSchema, StockReservation, IStockReservation } from './schemas/backend/stockReservation.schema';
export * from './mongodb/inventory/inventory.repository';

// Financial schemas — selective exports with aliases to avoid duplicates
export { WalletSchema, Wallet, IWallet } from './schemas/financial/wallet.schema';
export { AccountSchema as FinancialAccountSchema, Account as FinancialAccount, IAccount as IFinancialAccount, AccountStatus, AccountStatusType } from './schemas/financial/account.schema';
export { AccountTransactionSchema as FinancialAccountTransactionSchema, AccountTransaction as FinancialAccountTransaction, IAccountTransaction as IFinancialAccountTransaction, TransactionType, TransactionTypeType, TransactionDirection, TransactionDirectionType, TransactionStatus, TransactionStatusType } from './schemas/financial/accountTransaction.schema';
export { AccountHoldSchema as FinancialAccountHoldSchema, AccountHold as FinancialAccountHold, IAccountHold as IFinancialAccountHold, HoldStatus, HoldStatusType, HoldReason, HoldReasonType } from './schemas/financial/accountHold.schema';
export { EscrowSchema as FinancialEscrowSchema, Escrow as FinancialEscrow, IEscrow as IFinancialEscrow, EscrowStatus, EscrowStatusType } from './schemas/financial/escrow.schema';
export { GeneralLedgerSchema as FinancialGeneralLedgerSchema, GeneralLedger as FinancialGeneralLedger, IGeneralLedger as IFinancialGeneralLedger, LedgerEntryType, LedgerEntryTypeType } from './schemas/financial/generalLedger.schema';
export { CommissionRecordSchema as FinancialCommissionRecordSchema, CommissionRecord as FinancialCommissionRecord, ICommissionRecord as IFinancialCommissionRecord, CommissionStatus, CommissionStatusType, CommissionType, CommissionTypeType } from './schemas/financial/commissionRecord.schema';
export { UserLedgerEntrySchema as FinancialUserLedgerEntrySchema, UserLedgerEntry as FinancialUserLedgerEntry, IUserLedgerEntry as IFinancialUserLedgerEntry, LedgerEntryStatus, LedgerEntryStatusType } from './schemas/financial/userLedgerEntry.schema';
export { PaymentSchema as FinancialPaymentSchema, Payment as FinancialPayment, IPayment as IFinancialPayment, PaymentStatus, PaymentStatusType, PaymentMethod, PaymentMethodType } from './schemas/financial/payment.schema';
export { AuditLogSchema as FinancialAuditLogSchema, IAuditLog as IFinancialAuditLog } from './schemas/financial/auditLog.schema';
export { TierBenefitSchema, TierBenefit, ITierBenefit, B2BTierValues, B2BTierType } from './schemas/financial/tierBenefit.schema';
export { AccountTopUpRequestSchema as FinancialAccountTopUpRequestSchema, AccountTopUpRequest as FinancialAccountTopUpRequest, IAccountTopUpRequest as IFinancialAccountTopUpRequest, TopUpRequestStatus, TopUpRequestStatusType, TopUpPaymentMethod, TopUpPaymentMethodType } from './schemas/financial/accountTopUpRequest.schema';
export { AccountWithdrawalRequestSchema as FinancialAccountWithdrawalRequestSchema, AccountWithdrawalRequest as FinancialAccountWithdrawalRequest, IAccountWithdrawalRequest as IFinancialAccountWithdrawalRequest, WithdrawalRequestStatus, WithdrawalRequestStatusType } from './schemas/financial/accountWithdrawalRequest.schema';
export { GiftCardSchema as FinancialGiftCardSchema, GiftCard as FinancialGiftCard, IGiftCard as IFinancialGiftCard, GiftCardStatus, GiftCardStatusType } from './schemas/financial/giftCard.schema';

// Financial repository
export * from './mongodb/financial/financial.repository';

// Barter schemas — SwapSession/TradeOffer/Surplus/Auction/Lottery/BlindPool/Ecosystem
export { SwapSession, ISwapSession, SwapSessionStatus, SwapSessionStatusType, CollateralStatus } from './schemas/backend/swapSession.schema';
export { BarterDisputeLog, IBarterDisputeLog, DisputeResolutionStatus, DisputeResolutionStatusType } from './schemas/backend/barterDisputeLog.schema';
export { BarterPart, IBarterPart, BarterPartStatus, BarterPartStatusType } from './schemas/backend/barterPart.schema';
export { TradeOffer, ITradeOffer, TradeOfferSchema, TradeOfferStatus, TradeOfferStatusType, CashDirection, CashDirectionType } from './schemas/backend/tradeOffer.schema';
export { SurplusItem, ISurplusItem, SurplusStatus, SurplusStatusType } from './schemas/backend/surplusItem.schema';
export { Auction, IAuction, AuctionStatus, AuctionStatusType } from './schemas/backend/auction.schema';
export { AuctionBid, IAuctionBid } from './schemas/backend/auctionBid.schema';
export { AuctionParticipation, IAuctionParticipation, ParticipationStatus, ParticipationStatusType } from './schemas/backend/auctionParticipation.schema';
export { AuctionWinner, IAuctionWinner } from './schemas/backend/auctionWinner.schema';
export { Lottery, ILottery, LotteryStatus, LotteryStatusType } from './schemas/backend/lottery.schema';
export { LotteryTicket, ILotteryTicket } from './schemas/backend/lotteryTicket.schema';
export { BlindPool, IBlindPool } from './schemas/backend/blindPool.schema';
export { BlindPoolEntry, IBlindPoolEntry } from './schemas/backend/blindPoolEntry.schema';
export { EcosystemAuditLog, IEcosystemAuditLog, EcosystemAuditLogSchema, EcosystemAuditSeverity, EcosystemAuditSeverityType } from './schemas/backend/ecosystemAuditLog.schema';

// Barter repository — SwapSession/Auction/Lottery/BlindPool
export * from './mongodb/barter/barter.repository';

// Loyalty schemas — Subscription/Membership/XP/Referral/Menu/Voucher/TrustScore
export { Subscription, ISubscription, SubscriptionStatus, SubscriptionStatusType } from './schemas/backend/subscription.schema';
export { MembershipTier, IMembershipTier, MembershipTierSchema, LoyaltyTier, LoyaltyTierType } from './schemas/backend/membershipTier.schema';
export { MembershipPlan, IMembershipPlan, MembershipPlanSchema } from './schemas/backend/membershipPlan.schema';
export { XpBatch, IXpBatch, XpBatchSchema } from './schemas/backend/xpBatch.schema';
export { Mission, IMission, MissionSchema } from './schemas/backend/mission.schema';
export { UserMission, IUserMission, UserMissionSchema } from './schemas/backend/userMission.schema';
export { MilestoneTracker, IMilestoneTracker, MilestoneTrackerSchema } from './schemas/backend/milestoneTracker.schema';
export { LoyaltyTierHistory, ILoyaltyTierHistory, LoyaltyTierHistorySchema } from './schemas/backend/loyaltyTierHistory.schema';
export { XpDistributionRule, IXpDistributionRule, XpDistributionRuleSchema } from './schemas/backend/xpDistributionRule.schema';
export { XpSpendingLimitRule, IXpSpendingLimitRule, XpSpendingLimitRuleSchema } from './schemas/backend/xpSpendingLimitRule.schema';
export { TrustScore, ITrustScore, TrustLevel, TrustLevelType } from './schemas/backend/trustScore.schema';
export { BadgeRule, IBadgeRule, BadgeRuleSchema } from './schemas/backend/badgeRule.schema';
export { VendorViolationSchema, VendorViolationModel, IVendorViolation, VendorViolationLevel, VendorViolationLevelType } from './schemas/backend/vendorViolation.schema';
export { GiftVoucher, IGiftVoucher, GiftVoucherType, GiftVoucherTypeType } from './schemas/backend/giftVoucher.schema';
export { XpTransaction, IXpTransaction, XpTransactionSchema, XpTransactionType, XpTransactionTypeType } from './schemas/backend/xpTransaction.schema';
export { Referral, IReferral, ReferralSchema } from './schemas/backend/referral.schema';
export { MenuUsage, IMenuUsage, MenuUsageSchema } from './schemas/backend/menuUsage.schema';
export { MenuPurchase, IMenuPurchase, MenuPurchaseSchema, MenuPurchaseStatus, MenuPurchaseStatusType } from './schemas/backend/menuPurchase.schema';
export { MenuRedemption, IMenuRedemption, MenuRedemptionSchema } from './schemas/backend/menuRedemption.schema';
export { MenuRight, IMenuRight, MenuRightSchema, MenuRightSource, MenuRightSourceType, MenuRightTier, MenuRightTierType } from './schemas/backend/menuRight.schema';
export {
  GarageSale, IGarageSale, GarageSaleSchema, GarageSaleStatus, GarageSaleStatusType,
  GarageSalePurchase, IGarageSalePurchase, GarageSalePurchaseSchema,
} from './schemas/backend/garageSale.schema';
export { LaunchPartner, ILaunchPartner, LaunchPartnerSchema, LaunchPartnerPhase, LaunchPartnerPhaseType } from './schemas/backend/launchPartner.schema';
// BazarX-GO ek şemalar
export { MenuReservation, IMenuReservation, MenuReservationSchema, ReservationStatus, ReservationStatusType } from './schemas/backend/menuReservation.schema';
export { SurpriseMenu, ISurpriseMenu, SurpriseMenuSchema, ISurpriseMenuTimeBlock } from './schemas/backend/surpriseMenu.schema';
export { UserDeviceToken, IUserDeviceToken, UserDeviceTokenSchema } from './schemas/backend/userDeviceToken.schema';
export { GoReferral, IGoReferral, GoReferralSchema, GoReferralStatus, GoReferralStatusType } from './schemas/backend/goReferral.schema';

// Loyalty repository — Subscription/TrustScore/XP/Referral/Menu
export * from './mongodb/loyalty/loyalty.repository';

// Identity schemas — User/UserProfile/UserAddress/VerificationToken/Session/UserLevel/UserSubscription
export { User, IUser, UserSchema, UserRole, UserRoleType, UserStatus, UserStatusType } from './schemas/backend/user.schema';
export { UserProfile, IUserProfile, UserProfileSchema } from './schemas/backend/userProfile.schema';
export { UserAddress, IUserAddress, UserAddressSchema } from './schemas/backend/userAddress.schema';
export { VerificationToken, IVerificationToken, VerificationTokenSchema } from './schemas/backend/verificationToken.schema';
export { Session, ISession, SessionSchema } from './schemas/backend/session.schema';
export { UserLevel, IUserLevel, UserLevelSchema } from './schemas/backend/userLevel.schema';
export { UserSubscription, IUserSubscription, UserSubscriptionSchema, UserSubscriptionStatus, UserSubscriptionStatusType } from './schemas/backend/userSubscription.schema';
export { LoginHistory, ILoginHistory, LoginHistorySchema } from './schemas/backend/loginHistory.schema';
export { Order, IOrder, OrderSchema, OrderStatus, OrderStatusType } from './schemas/backend/order.schema';
export { Vendor, IVendor, VendorSchema, VendorStatus, VendorStatusType, VendorTier, VendorTierType, VendorType, VendorTypeType } from './schemas/backend/vendor.schema';
export { VendorStats, IVendorStats, VendorStatsSchema } from './schemas/backend/vendorStats.schema';
export { EarlyPaymentRequest, IEarlyPaymentRequest, EarlyPaymentRequestSchema, EarlyPaymentStatus } from './schemas/backend/early-payment-request.schema';
export { VendorProfile, IVendorProfile, VendorProfileSchema } from './schemas/backend/vendorProfile.schema';
export { VendorSettings, IVendorSettings, VendorSettingsSchema } from './schemas/backend/vendorSettings.schema';
export { VendorB2BData, IVendorB2BData, VendorB2BDataSchema } from './schemas/backend/vendorB2BData.schema';
export { VendorCategory, IVendorCategory, VendorCategorySchema } from './schemas/backend/vendorCategory.schema';
export { VendorBanner, IVendorBanner, VendorBannerSchema } from './schemas/backend/vendorBanner.schema';
export { BrandEcosystem, IBrandEcosystem, BrandEcosystemSchema } from './schemas/backend/brandEcosystem.schema';

// Analytics/Notification/SystemSetting schemas + repository
export { AnalyticsEvent, AnalyticsEventSchema, IAnalyticsEvent, EventCategory, EventCategoryType, AnalyticsEventType } from './schemas/backend/analyticsEvent.schema';
export { Notification, INotification } from './schemas/backend/notification.schema';
export { SystemSetting, ISystemSetting, SystemSettingSchema } from './schemas/backend/systemSetting.schema';
export * from './mongodb/misc/analytics.repository';

// Invoice/AdCampaign/Announcement/Chat/DynamicContent/Help/Coupon/Banner/Review/Return
export { Invoice, IInvoice, InvoiceStatus, InvoiceStatusType } from './schemas/backend/invoice.schema';
export { InvoiceItem, IInvoiceItem } from './schemas/backend/invoiceItem.schema';
export { AdCampaign, IAdCampaign, AdCampaignStatus, AdCampaignStatusType, AdType, AdTypeType } from './schemas/backend/adCampaign.schema';
export { Announcement, IAnnouncement, AnnouncementSchema, AnnouncementType, AnnouncementTypeType } from './schemas/backend/announcement.schema';
export { ChatMessage, IChatMessage, ChatMessageSchema } from './schemas/backend/chatMessage.schema';
export { DynamicContent, IDynamicContent, DynamicContentSchema, ContentType, ContentTypeType } from './schemas/backend/dynamicContent.schema';
export { HelpArticle, IHelpArticle, HelpArticleSchema, HelpArticleStatus, HelpArticleStatusType } from './schemas/backend/helpArticle.schema';
export { HelpCategory, IHelpCategory, HelpCategorySchema } from './schemas/backend/helpCategory.schema';
export { Coupon, ICoupon } from './schemas/backend/coupon.schema';
export { HomeBanner, IHomeBanner, HomeBannerSchema } from './schemas/backend/homeBanner.schema';
export { Review, IReview } from './schemas/backend/review.schema';
export { OrderReturn, IOrderReturn, ReturnStatus, ReturnStatusType } from './schemas/backend/orderReturn.schema';
export { ReturnRequest, IReturnRequest, IReturnItem, ReturnRequestSchema, ReturnStatus as ReturnRequestStatus, ReturnReasonType } from './schemas/backend/return-request.schema';
export { ProductMedia, IProductMedia, ProductMediaSchema, MediaType, MediaTypeType } from './schemas/backend/productMedia.schema';
// Content/Communication/Catalog additional schemas
export { Policy, IPolicy, PolicySchema } from './schemas/backend/policy.schema';
export { SeoMetadata, ISeoMetadata, SeoMetadataSchema } from './schemas/backend/seoMetadata.schema';
export { SideAd, ISideAd, SideAdSchema } from './schemas/backend/sideAd.schema';
export { AdLocation, IAdLocation, AdLocationSchema } from './schemas/backend/adLocation.schema';
export { ChatRoom, IChatRoom, ChatRoomSchema, StorageTier, StorageTierType } from './schemas/backend/chatRoom.schema';
export { UserComplaint, IUserComplaint, UserComplaintSchema } from './schemas/backend/userComplaint.schema';
export { Company, ICompany, CompanySchema, CompanyStatus, CompanyStatusType } from './schemas/backend/company.schema';
export { ImportJob, IImportJob, ImportJobSchema } from './schemas/backend/importJob.schema';
export { CatalogProduct, ICatalogProduct, CatalogProductSchema } from './schemas/backend/catalogProduct.schema';
export { BuyboxHistory, IBuyboxHistory, BuyboxHistorySchema } from './schemas/backend/buyboxHistory.schema';
export { HomeQuadCard, IHomeQuadCard, HomeQuadCardSchema } from './schemas/backend/homeQuadCard.schema';
export { HomeQuadCardItem, IHomeQuadCardItem, HomeQuadCardItemSchema } from './schemas/backend/homeQuadCardItem.schema';
export * from './mongodb/misc/marketing.repository';export { SurplusCategory, ISurplusCategory, SurplusCategorySchema } from './schemas/backend/surplusCategory.schema';
export { WantedItem, IWantedItem, WantedItemSchema } from './schemas/backend/wantedItem.schema';
export { Transfer, ITransfer, TransferSchema } from './schemas/backend/transfer.schema';
export { TransferItem, ITransferItem, TransferItemSchema } from './schemas/backend/transferItem.schema';

export { EscrowCoupon, IEscrowCoupon, EscrowCouponSchema } from './schemas/backend/escrowCoupon.schema';
