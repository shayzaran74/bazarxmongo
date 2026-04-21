-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('BAZARX', 'BARTERBORSA');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VendorTier" AS ENUM ('CORE', 'PLUS', 'PREMIUM', 'ELITE');

-- CreateEnum
CREATE TYPE "B2BTier" AS ENUM ('NONE', 'STARTER', 'GROWTH', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PilotCity" AS ENUM ('ISTANBUL', 'ANKARA', 'IZMIR', 'HATAY');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'SUSPENDED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ListingVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'ECOSYSTEM_ONLY', 'B2B_ONLY');

-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'REFURBISHED');

-- CreateEnum
CREATE TYPE "BrandStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('GENERAL', 'BARTER', 'RESTAURANT', 'SERVICE');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('Draft', 'Ordered', 'PartiallyReceived', 'Received', 'Cancelled');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('Pending', 'InTransit', 'PartiallyReceived', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('IYZICO', 'BANK_TRANSFER', 'WALLET', 'BARTER', 'GIFT_CARD', 'MIXED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "SurplusStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'RESERVED', 'TRADED', 'EXPIRED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "WantedItemStatus" AS ENUM ('PENDING', 'ACTIVE', 'MATCHED', 'FULFILLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WantedItemType" AS ENUM ('PRODUCT', 'SERVICE', 'MATERIAL');

-- CreateEnum
CREATE TYPE "TradeOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTER_OFFERED', 'EXPIRED', 'CANCELLED', 'COMPLETED', 'LEGAL_PENDING');

-- CreateEnum
CREATE TYPE "SwapSessionStatus" AS ENUM ('PENDING_COLLATERAL', 'ACTIVE', 'SHIPPING', 'PARTIALLY_COMPLETED', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "BarterPartStatus" AS ENUM ('PENDING', 'SHIPPED', 'DELIVERED', 'CONFIRMED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "DemandMatchStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DemandMatchType" AS ENUM ('SURPLUS_TO_WANTED', 'WANTED_TO_SURPLUS', 'SURPLUS_TO_SURPLUS');

-- CreateEnum
CREATE TYPE "TradeChainStatus" AS ENUM ('DRAFT', 'PROPOSED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ArbitratorType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('BUY', 'SELL', 'BARTER', 'BOTH');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'ENDED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('PENDING', 'APPROVED', 'DEPOSIT_HELD', 'ACTIVE', 'WON', 'LOST', 'REFUNDED');

-- CreateEnum
CREATE TYPE "LotteryStatus" AS ENUM ('ACTIVE', 'ENDED', 'DRAWN', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AdType" AS ENUM ('BANNER', 'SPONSORED_PRODUCT', 'SEARCH_AD', 'SIDE_AD', 'VIDEO', 'REWARD_DISTRIBUTION');

-- CreateEnum
CREATE TYPE "AdSlotType" AS ENUM ('HOMEPAGE_BANNER', 'HOMEPAGE_SIDEBAR', 'SEARCH_TOP', 'SEARCH_SIDEBAR', 'CATEGORY_TOP', 'CATEGORY_SIDEBAR', 'PRODUCT_DETAIL', 'CART_SIDEBAR', 'CHECKOUT_BANNER');

-- CreateEnum
CREATE TYPE "BillingModel" AS ENUM ('PREPAID', 'POSTPAID');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('CPC', 'CPM', 'CPA', 'FIXED');

-- CreateEnum
CREATE TYPE "TargetRole" AS ENUM ('ALL', 'CUSTOMER', 'VENDOR', 'B2B');

-- CreateEnum
CREATE TYPE "LoyaltyTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- CreateEnum
CREATE TYPE "ChatRoomStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'IMAGE', 'SYSTEM', 'FILE');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "password" TEXT,
    "transaction_pin" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "platform" "Platform" NOT NULL DEFAULT 'BAZARX',
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "google_id" TEXT,
    "lockout_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "last_seen_at" TIMESTAMP(3),
    "referred_by_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "birthday" TIMESTAMP(3),
    "gender" TEXT,
    "city" TEXT,
    "district" TEXT,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_addresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "neighborhood" TEXT,
    "postal_code" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sso_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sso_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "tax_number" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "registration_number" TEXT,
    "tax_office" TEXT,
    "representative_name" TEXT,
    "representative_phone" TEXT,
    "vat_rate" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verified_at" TIMESTAMP(3),
    "company_type" TEXT,
    "trade_registry_number" TEXT,
    "mersis_number" TEXT,
    "kep_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_users" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "company_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "status" "VendorStatus" NOT NULL DEFAULT 'PENDING',
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ecosystem_id" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_audit_at" TIMESTAMP(3),
    "membership_tier_id" TEXT,
    "rejection_reason" TEXT,
    "slug" TEXT NOT NULL,
    "suspension_reason" TEXT,
    "tier" "VendorTier" NOT NULL DEFAULT 'CORE',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_profiles" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "store_name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "banner" TEXT,
    "support_email" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_until" TIMESTAMP(3),
    "city" TEXT,
    "district" TEXT,

    CONSTRAINT "vendor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_settings" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "listing_limit" INTEGER NOT NULL DEFAULT 100,
    "commission_rate" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "delivery_time_days" INTEGER NOT NULL DEFAULT 3,
    "min_order_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "return_policy" TEXT,
    "shipping_policy" TEXT,
    "preferred_currency" TEXT NOT NULL DEFAULT 'TRY',
    "vat_included" BOOLEAN NOT NULL DEFAULT true,
    "vacation_mode" BOOLEAN NOT NULL DEFAULT false,
    "vacation_end_at" TIMESTAMP(3),
    "auto_fulfill" BOOLEAN NOT NULL DEFAULT false,
    "commission_adjustments" JSONB,

    CONSTRAINT "vendor_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_b2b_data" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "is_b2b" BOOLEAN NOT NULL DEFAULT false,
    "b2b_tier" "B2BTier" NOT NULL DEFAULT 'NONE',
    "wholesale_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_brand_owner" BOOLEAN NOT NULL DEFAULT false,
    "authorized_brands" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "corporate_code" TEXT,
    "barter_limit_override" DECIMAL(18,2),
    "b2b_wallet_limit" DECIMAL(18,2),
    "b2b_comm_rate" DECIMAL(5,2),

    CONSTRAINT "vendor_b2b_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_metrics" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "total_revenue" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "monthly_order_count" INTEGER NOT NULL DEFAULT 0,
    "return_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "avg_response_time_mins" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ad_budget_spent" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "last_calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_stats" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "active_listing_count" INTEGER NOT NULL DEFAULT 0,
    "loyalty_points" INTEGER NOT NULL DEFAULT 0,
    "trust_score" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "last_sync_at" TIMESTAMP(3),

    CONSTRAINT "vendor_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_banners" (
    "id" TEXT NOT NULL,
    "type" INTEGER NOT NULL DEFAULT 1,
    "template" TEXT NOT NULL DEFAULT 'A',
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "AdStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "link_url" TEXT,
    "rejection_reason" TEXT,
    "target_cities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "target_districts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vendor_id" TEXT NOT NULL,

    CONSTRAINT "vendor_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_followers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,

    CONSTRAINT "vendor_followers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_bank_accounts" (
    "id" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "account_holder_name" TEXT NOT NULL,
    "account_number" TEXT,
    "bank_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vendor_id" TEXT NOT NULL,

    CONSTRAINT "vendor_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_categories" (
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vendor_id" TEXT NOT NULL,

    CONSTRAINT "vendor_categories_pkey" PRIMARY KEY ("vendor_id","category_id")
);

-- CreateTable
CREATE TABLE "brand_ecosystems" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "internal_comm_rate" DECIMAL(5,2) NOT NULL DEFAULT 4.0,
    "is_blind_pool" BOOLEAN NOT NULL DEFAULT true,
    "logo_url" TEXT,
    "owner_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_ecosystems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecosystem_audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ecosystem_id" TEXT,
    "vendor_id" TEXT,

    CONSTRAINT "ecosystem_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "features" JSONB,
    "price_tl" DECIMAL(18,2) NOT NULL,
    "price_barter" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "listing_limit" INTEGER NOT NULL DEFAULT 10,
    "commission_discount" DECIMAL(5,2) NOT NULL DEFAULT 0,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_models" (
    "id" TEXT NOT NULL,
    "model_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "attributes" JSONB,
    "category_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_products" (
    "id" TEXT NOT NULL,
    "gtin" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specs" JSONB,
    "category_id" TEXT,
    "product_type_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "model_id" TEXT,
    "attributes" JSONB,
    "metadata" JSONB,
    "source_url" TEXT,
    "scraped_at" TIMESTAMP(3),
    "is_flash_sale" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "is_special_offer" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "catalog_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "badge_color" TEXT DEFAULT '#ef4444',
    "badge_text" TEXT,
    "type" "CategoryType" NOT NULL DEFAULT 'GENERAL',
    "image" TEXT,
    "attribute_template" JSONB,
    "color_from" TEXT,
    "color_to" TEXT,
    "hover_color" TEXT,
    "shadow_color" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "mega_menu_color" TEXT,
    "mega_menu_icon" TEXT,
    "mega_menu_order" INTEGER,
    "blurhash" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "status" "BrandStatus" NOT NULL DEFAULT 'PENDING',
    "is_official" BOOLEAN NOT NULL DEFAULT false,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "popularity_score" INTEGER NOT NULL DEFAULT 0,
    "product_count" INTEGER NOT NULL DEFAULT 0,
    "violation_count" INTEGER NOT NULL DEFAULT 0,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "reviewed_by" TEXT,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vendor_id" TEXT,
    "blurhash" TEXT,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_violations" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "severity" TEXT,
    "admin_notes" TEXT,
    "brand_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evidence_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "related_product_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "related_vendor_id" TEXT,
    "reporter_id" TEXT NOT NULL,
    "reporter_type" TEXT NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "violation_type" TEXT NOT NULL,

    CONSTRAINT "brand_violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "schema" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "catalog_product_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(18,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "visibility" "ListingVisibility" NOT NULL DEFAULT 'PUBLIC',
    "is_promoted" BOOLEAN NOT NULL DEFAULT false,
    "promoted_price" DECIMAL(18,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "original_price" DECIMAL(18,2),
    "condition" "ProductCondition" NOT NULL DEFAULT 'NEW',
    "wholesale_price" DECIMAL(18,2),
    "min_wholesale_qty" INTEGER,
    "sku" TEXT,
    "is_digital" BOOLEAN NOT NULL DEFAULT false,
    "is_b2b_only" BOOLEAN NOT NULL DEFAULT false,
    "b2b_discount" DECIMAL(5,2),
    "shipping_template_id" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_until" TIMESTAMP(3),
    "slug" TEXT,
    "listing_type" TEXT NOT NULL DEFAULT 'SELL',
    "is_auction_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_lottery_enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_status_changed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "is_special_offer" BOOLEAN NOT NULL DEFAULT false,
    "is_flash_sale" BOOLEAN NOT NULL DEFAULT false,
    "min_market_price" DECIMAL(18,2),
    "max_purchase_per_member" INTEGER NOT NULL DEFAULT 100,
    "ecosystem_id" TEXT,
    "variant_options" JSONB,
    "integration_code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "commission_rate" DECIMAL(5,2),
    "metadata" JSONB,
    "weight" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "volume" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "variants" JSONB,
    "available_quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "is_sponsored" BOOLEAN NOT NULL DEFAULT false,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
    "sponsor_budget" DECIMAL(18,2) DEFAULT 0,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_images" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_price_history" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "price" DECIMAL(18,2) NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_stats" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "sales" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_analytics" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "sales" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_media" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "blurhash" TEXT,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "order_id" TEXT,
    "catalog_product_id" TEXT NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "catalog_product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_attributes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "unit" TEXT,
    "placeholder" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "category_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_filterable" BOOLEAN NOT NULL DEFAULT true,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_variant" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "surplus_category_id" TEXT,

    CONSTRAINT "category_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_products" (
    "id" TEXT NOT NULL,
    "collection_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "collection_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CampaignType" NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_buys" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT,
    "target_quantity" INTEGER NOT NULL,
    "current_quantity" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(18,2) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_buys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocks" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_reservations" (
    "id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "order_id" TEXT,
    "quantity" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "supplier_name" TEXT,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'Draft',
    "total_amount" DECIMAL(18,2),
    "ordered_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "received_qty" INTEGER NOT NULL DEFAULT 0,
    "unit_price" DECIMAL(18,2),

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "from_warehouse_id" TEXT NOT NULL,
    "to_warehouse_id" TEXT NOT NULL,
    "transfer_number" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'Pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_items" (
    "id" TEXT NOT NULL,
    "transfer_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "transfer_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_logs" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total_amount" DECIMAL(18,2) NOT NULL,
    "shipping_address" JSONB NOT NULL,
    "billing_address" JSONB,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "shipping_method" TEXT,
    "tracking_number" TEXT,
    "delivery_date" TIMESTAMP(3),
    "notes" TEXT,
    "currency" TEXT DEFAULT 'TRY',
    "subtotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "shipping_fee" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "coupon_id" TEXT,
    "cancel_reason" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "payout_status" TEXT,
    "paid_with_xp" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "paid_with_cash" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "paid_at" TIMESTAMP(3),
    "payment_intent_id" TEXT,
    "metadata" JSONB,
    "coupon_code" TEXT,
    "shipping_carrier" TEXT,
    "estimated_delivery" TIMESTAMP(3),
    "escrow_status" TEXT DEFAULT 'NONE',
    "escrow_release_at" TIMESTAMP(3),
    "payout_eligible_at" TIMESTAMP(3),
    "shipping_cost" DECIMAL(18,2) NOT NULL DEFAULT 0,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(18,2) NOT NULL,
    "total_amount" DECIMAL(18,2) NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_images" TEXT[],
    "variant_info" JSONB,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "cart_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "variant_id" TEXT,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "user_id" TEXT,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_returns" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_id" TEXT NOT NULL,
    "receipt_url" TEXT,
    "refund_amount" DECIMAL(18,2) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "evidence_urls" TEXT[],
    "admin_note" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surplus_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "icon" TEXT,
    "parent_id" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surplus_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surplus_items" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "material_type" TEXT,
    "quantity" DECIMAL(18,2) NOT NULL,
    "blocked_quantity" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "min_trade_quantity" DECIMAL(18,2),
    "unit_price" DECIMAL(18,2),
    "wanted_categories" JSONB,
    "trade_modes" JSONB,
    "technical_specs" JSONB,
    "images" JSONB,
    "location" TEXT,
    "city" TEXT,
    "status" "SurplusStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "reactivation_count" INTEGER NOT NULL DEFAULT 0,
    "last_reactivated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "metadata" JSONB,

    CONSTRAINT "surplus_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wanted_items" (
    "id" TEXT NOT NULL,
    "keywords" TEXT[],
    "description" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "category_id" TEXT NOT NULL,
    "company_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "listing_type" "ListingType" NOT NULL DEFAULT 'BUY',
    "max_price" DECIMAL(18,2),
    "min_price" DECIMAL(18,2),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,
    "status" "WantedItemStatus" NOT NULL DEFAULT 'PENDING',
    "type" "WantedItemType" NOT NULL DEFAULT 'PRODUCT',

    CONSTRAINT "wanted_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_matches" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "notes" TEXT,
    "action_at" TIMESTAMP(3),
    "action_by" TEXT,
    "buyer_item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "match_type" "DemandMatchType" NOT NULL,
    "rejection_reason" TEXT,
    "seller_item_id" TEXT,
    "surplus_item_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "DemandMatchStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "demand_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_offers" (
    "id" TEXT NOT NULL,
    "from_company_id" TEXT,
    "to_company_id" TEXT,
    "offered_item_id" TEXT,
    "requested_item_id" TEXT,
    "message" TEXT,
    "status" "TradeOfferStatus" NOT NULL DEFAULT 'PENDING',
    "chain_id" TEXT,
    "parent_offer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "legal_accepted_at" TIMESTAMP(3),
    "down_payment_hold_id" TEXT,
    "accepted_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cash_amount" DECIMAL(18,2) NOT NULL,
    "cash_direction" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3),
    "counter_offer_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "initiator_id" TEXT NOT NULL,
    "initiator_type" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "receiver_type" TEXT NOT NULL,
    "rejected_at" TIMESTAMP(3),

    CONSTRAINT "trade_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_offer_items" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT,
    "surplus_item_id" TEXT,
    "quantity" DECIMAL(18,2) NOT NULL,
    "estimated_value" DECIMAL(18,2) NOT NULL,
    "offered_offer_id" TEXT,
    "requested_offer_id" TEXT,

    CONSTRAINT "trade_offer_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barter_swap_sessions" (
    "id" TEXT NOT NULL,
    "trade_offer_id" TEXT NOT NULL,
    "initiator_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "shipment_mode" TEXT NOT NULL,
    "shipments" JSONB,
    "escrow_id" TEXT,
    "collateral_amount" DECIMAL(18,2) NOT NULL,
    "collateral_currency" TEXT NOT NULL,
    "collateral_status" TEXT NOT NULL,
    "collateral_locked_at" TIMESTAMP(3),
    "collateral_released_at" TIMESTAMP(3),
    "collateral_forfeited_at" TIMESTAMP(3),
    "from_collateral_hold_id" TEXT,
    "to_collateral_hold_id" TEXT,
    "status" "SwapSessionStatus" NOT NULL DEFAULT 'PENDING_COLLATERAL',
    "timeout_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancelled_reason" TEXT,
    "disputed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barter_swap_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barter_parts" (
    "id" TEXT NOT NULL,
    "swap_session_id" TEXT NOT NULL,
    "part_number" INTEGER NOT NULL,
    "sender_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "tracking_code" TEXT,
    "carrier" TEXT,
    "status" "BarterPartStatus" NOT NULL DEFAULT 'PENDING',
    "shipped_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "disputed_at" TIMESTAMP(3),
    "dispute_window_ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barter_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_completions" (
    "id" TEXT NOT NULL,
    "notes" TEXT,
    "cash_difference" DECIMAL(18,2),
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "from_item_quantity" DECIMAL(18,2),
    "to_item_quantity" DECIMAL(18,2),
    "trade_offer_id" TEXT NOT NULL,

    CONSTRAINT "trade_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_reviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "from_user_id" TEXT NOT NULL,
    "media_url" TEXT,
    "to_user_id" TEXT NOT NULL,
    "trade_offer_id" TEXT NOT NULL,

    CONSTRAINT "trade_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_chains" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "match_score" DOUBLE PRECISION,
    "total_value" DECIMAL(18,2),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "TradeChainStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "trade_chains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_matches" (
    "id" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "match_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proximity_score" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "trade_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barter_dispute_logs" (
    "id" TEXT NOT NULL,
    "swap_session_id" TEXT NOT NULL,
    "trade_offer_id" TEXT NOT NULL,
    "opened_by_id" TEXT NOT NULL,
    "respondent_id" TEXT NOT NULL,
    "trade_value_kurus" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "evidence" JSONB,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "arbitratorType" "ArbitratorType" NOT NULL DEFAULT 'INTERNAL',
    "arbitrator_id" TEXT,
    "resolution" TEXT,
    "resolution_note" TEXT,
    "cost_charged_to_id" TEXT,
    "resolution_deadline_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barter_dispute_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auctions" (
    "id" TEXT NOT NULL,
    "status" "AuctionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_price" DECIMAL(18,2) NOT NULL,
    "current_winner_step" INTEGER NOT NULL DEFAULT 1,
    "end_time" TIMESTAMP(3) NOT NULL,
    "listing_id" TEXT NOT NULL,
    "min_bid_increment" DECIMAL(18,2) NOT NULL DEFAULT 1,
    "participation_deposit" DECIMAL(18,2),
    "payment_deadline" TIMESTAMP(3),
    "start_time" TIMESTAMP(3) NOT NULL,
    "starting_price" DECIMAL(18,2) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "winner_2_id" TEXT,
    "winner_3_id" TEXT,
    "winner_id" TEXT,

    CONSTRAINT "auctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_winners" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "amount" DECIMAL(18,2),
    "auction_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "auction_winners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_participations" (
    "id" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'PENDING',
    "auction_id" TEXT NOT NULL,
    "blocked_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hold_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "auction_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_bids" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "auction_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "auction_bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotteries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prize_description" TEXT,
    "ticket_price" DECIMAL(18,2) NOT NULL,
    "status" "LotteryStatus" NOT NULL DEFAULT 'ACTIVE',
    "winner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3) NOT NULL,
    "max_tickets_per_user" INTEGER NOT NULL DEFAULT 10,
    "owner_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticket_digits" INTEGER NOT NULL DEFAULT 3,
    "total_tickets" INTEGER NOT NULL DEFAULT 100,
    "numbers_per_ticket" INTEGER NOT NULL DEFAULT 1,
    "prize_value" DECIMAL(18,2),
    "winning_number" TEXT,
    "listing_id" TEXT,

    CONSTRAINT "lotteries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lottery_tickets" (
    "id" TEXT NOT NULL,
    "lottery_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numbers" TEXT[],

    CONSTRAINT "lottery_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "button_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "link" TEXT,
    "platform" "Platform" NOT NULL DEFAULT 'BAZARX',
    "subtitle" TEXT,
    "tag" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_quad_cards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "platform" "Platform" NOT NULL DEFAULT 'BAZARX',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_quad_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_quad_card_items" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "product_id" TEXT,
    "quad_card_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "home_quad_card_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'tr',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "parent_id" TEXT,
    "platform" "Platform" NOT NULL DEFAULT 'BAZARX',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "help_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'tr',
    "category" TEXT,
    "category_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "platform" "Platform" NOT NULL DEFAULT 'BAZARX',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "help_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "link_text" TEXT,
    "link_url" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target_page" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policies" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dynamic_contents" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "content_type" TEXT NOT NULL DEFAULT 'text',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dynamic_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_metadata" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT[],
    "og_image" TEXT,
    "platform" "Platform" NOT NULL DEFAULT 'BAZARX',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "Platform" NOT NULL DEFAULT 'BAZARX',
    "budget" DECIMAL(18,2) NOT NULL,
    "ad_status" "AdStatus" NOT NULL DEFAULT 'PENDING',
    "ad_type" "AdType" NOT NULL,
    "bid_amount" DECIMAL(18,2) NOT NULL,
    "billing_model" "BillingModel" NOT NULL DEFAULT 'PREPAID',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creator_id" TEXT,
    "end_date" TIMESTAMP(3) NOT NULL,
    "image_url" TEXT,
    "link_url" TEXT,
    "metadata" JSONB,
    "pricing_model" "PricingModel" NOT NULL,
    "remaining_budget" DECIMAL(18,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "target_categories" TEXT[],
    "target_keywords" TEXT[],
    "target_role" "TargetRole" NOT NULL DEFAULT 'ALL',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vendor_id" TEXT,
    "rejection_reason" TEXT,
    "target_cities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "target_districts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "target_slots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "target_url" TEXT,
    "quality_score" DECIMAL(5,2) DEFAULT 1.0,
    "historic_ctr" DECIMAL(8,6) DEFAULT 0.01,
    "max_bid_per_click" DECIMAL(18,2) DEFAULT 0.5,
    "max_bid_per_mille" DECIMAL(18,2) DEFAULT 5.0,
    "media_url" TEXT,
    "negative_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "ad_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_slots" (
    "id" TEXT NOT NULL,
    "slot_type" "AdSlotType" NOT NULL,
    "platform" "Platform" NOT NULL DEFAULT 'BAZARX',
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_slot_to_campaign" (
    "ad_slot_id" TEXT NOT NULL,
    "ad_campaign_id" TEXT NOT NULL,

    CONSTRAINT "ad_slot_to_campaign_pkey" PRIMARY KEY ("ad_slot_id","ad_campaign_id")
);

-- CreateTable
CREATE TABLE "ad_campaign_products" (
    "id" TEXT NOT NULL,
    "ad_campaign_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,

    CONSTRAINT "ad_campaign_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_campaign_metrics" (
    "id" TEXT NOT NULL,
    "ad_campaign_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "ctr" DECIMAL(8,6) NOT NULL DEFAULT 0,
    "spend" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "sales" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ad_campaign_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_locations" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "ad_campaign_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "home_banner_id" TEXT,
    "side_ad_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "side_ads" (
    "id" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "image" TEXT,
    "emoji" TEXT,
    "link" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "ecosystems" TEXT[] DEFAULT ARRAY['GLOBAL']::TEXT[],
    "category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "side_ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_tiers" (
    "id" TEXT NOT NULL,
    "name" "LoyaltyTier" NOT NULL,
    "min_xp" INTEGER NOT NULL,
    "description" TEXT,
    "reward_multiplier" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "benefit_metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_levels" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_xp" INTEGER NOT NULL DEFAULT 0,
    "lifetime_xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "tier_id" TEXT,
    "last_login_bonus_at" TIMESTAMP(3),
    "is_first_order" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "reference_id" TEXT,
    "reference_type" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_transactions_pkey" PRIMARY KEY ("id","created_at")
);

-- CreateTable
CREATE TABLE "xp_batches" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "original_amount" DECIMAL(18,4) NOT NULL,
    "current_balance" DECIMAL(18,4) NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_ref_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_burned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "xp_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "reward_type" TEXT DEFAULT 'XP',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_missions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "progress" JSONB,
    "completed_at" TIMESTAMP(3),
    "claimed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestone_trackers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weekly_order_count" INTEGER NOT NULL DEFAULT 0,
    "weekly_period_start" TIMESTAMP(3),
    "weekly_bonus_given" BOOLEAN NOT NULL DEFAULT false,
    "monthly_spend_total" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "monthly_period_start" TIMESTAMP(3),
    "monthly_bonus_given" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestone_trackers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_tier_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "from_tier" TEXT,
    "to_tier" TEXT NOT NULL,
    "reason" TEXT,
    "triggered_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_tier_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_distribution_rules" (
    "id" TEXT NOT NULL,
    "city" TEXT,
    "vendor_tier" "VendorTier",
    "commission_rate" DECIMAL(5,2),
    "ad_spend_rate" DECIMAL(5,2),
    "service_rate" DECIMAL(5,2),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "distribution_type" TEXT,
    "name" TEXT,

    CONSTRAINT "xp_distribution_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_spending_limit_rules" (
    "id" TEXT NOT NULL,
    "vendor_tier" "VendorTier",
    "max_spend_per_tx" DECIMAL(18,2),
    "monthly_volume_limit" DECIMAL(18,2),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "daily_limit" DECIMAL(18,2),
    "loyalty_tier" "LoyaltyTier",
    "max_spend_percentage" DECIMAL(5,2),
    "min_cart_amount" DECIMAL(18,2),
    "monthly_limit" DECIMAL(18,2),
    "weekly_limit" DECIMAL(18,2),
    "weekly_volume_limit" DECIMAL(18,2),
    "xp_to_tl_rate" DECIMAL(18,2),

    CONSTRAINT "xp_spending_limit_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platinum_mission_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "vendor_id" TEXT,
    "total_amount" DECIMAL(18,2),
    "order_count" INTEGER,
    "xp_earned" INTEGER,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platinum_mission_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "referrer" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "metadata" JSONB,
    "catalog_product_id" TEXT,
    "category_id" TEXT,
    "event_source" TEXT,
    "event_type" TEXT NOT NULL,
    "intent" TEXT,
    "ip_address" TEXT,
    "listing_id" TEXT,
    "path" TEXT,
    "session_id" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_agent" TEXT,
    "user_id" TEXT,
    "vendor_id" TEXT,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_activities" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "catalog_product_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listing_id" TEXT,
    "metadata" JSONB,
    "user_id" TEXT,

    CONSTRAINT "product_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_rooms" (
    "id" TEXT NOT NULL,
    "order_id" TEXT,
    "trade_offer_id" TEXT,
    "status" "ChatRoomStatus" NOT NULL DEFAULT 'ACTIVE',
    "archive_preview" JSONB,
    "archive_url" TEXT,
    "archived_at" TIMESTAMP(3),
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "storage_tier" TEXT NOT NULL DEFAULT 'STANDARD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "participant_ids" TEXT[],

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "sender_id" TEXT,
    "content" TEXT NOT NULL,
    "type" "ChatMessageType" NOT NULL DEFAULT 'TEXT',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "read_by_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_complaints" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'PENDING',
    "admin_note" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BrandToCatalogProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CampaignListings" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_number_idx" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sso_tokens_provider_provider_id_key" ON "sso_tokens"("provider", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_tax_number_key" ON "companies"("tax_number");

-- CreateIndex
CREATE INDEX "companies_tax_number_idx" ON "companies"("tax_number");

-- CreateIndex
CREATE UNIQUE INDEX "company_users_user_id_company_id_key" ON "company_users"("user_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_company_id_key" ON "vendors"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_slug_key" ON "vendors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_user_id_key" ON "vendors"("user_id");

-- CreateIndex
CREATE INDEX "vendors_status_idx" ON "vendors"("status");

-- CreateIndex
CREATE INDEX "vendors_tier_idx" ON "vendors"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_profiles_vendor_id_key" ON "vendor_profiles"("vendor_id");

-- CreateIndex
CREATE INDEX "vendor_profiles_city_idx" ON "vendor_profiles"("city");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_settings_vendor_id_key" ON "vendor_settings"("vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_b2b_data_vendor_id_key" ON "vendor_b2b_data"("vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_b2b_data_corporate_code_key" ON "vendor_b2b_data"("corporate_code");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_metrics_vendor_id_key" ON "vendor_metrics"("vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_stats_vendor_id_key" ON "vendor_stats"("vendor_id");

-- CreateIndex
CREATE INDEX "vendor_followers_user_id_idx" ON "vendor_followers"("user_id");

-- CreateIndex
CREATE INDEX "vendor_followers_vendor_id_idx" ON "vendor_followers"("vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_followers_user_id_vendor_id_key" ON "vendor_followers"("user_id", "vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "brand_ecosystems_name_key" ON "brand_ecosystems"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brand_ecosystems_slug_key" ON "brand_ecosystems"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "brand_ecosystems_owner_id_key" ON "brand_ecosystems"("owner_id");

-- CreateIndex
CREATE INDEX "ecosystem_audit_logs_ecosystem_id_idx" ON "ecosystem_audit_logs"("ecosystem_id");

-- CreateIndex
CREATE INDEX "ecosystem_audit_logs_vendor_id_idx" ON "ecosystem_audit_logs"("vendor_id");

-- CreateIndex
CREATE INDEX "ecosystem_audit_logs_action_idx" ON "ecosystem_audit_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_company_id_key" ON "subscriptions"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_models_model_code_key" ON "catalog_models"("model_code");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_models_slug_key" ON "catalog_models"("slug");

-- CreateIndex
CREATE INDEX "catalog_models_model_code_idx" ON "catalog_models"("model_code");

-- CreateIndex
CREATE INDEX "catalog_models_slug_idx" ON "catalog_models"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_products_gtin_key" ON "catalog_products"("gtin");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_products_slug_key" ON "catalog_products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_order_idx" ON "categories"("order");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "brand_violations_brand_id_idx" ON "brand_violations"("brand_id");

-- CreateIndex
CREATE INDEX "brand_violations_reporter_id_idx" ON "brand_violations"("reporter_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_types_name_key" ON "product_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_types_slug_key" ON "product_types"("slug");

-- CreateIndex
CREATE INDEX "product_types_slug_idx" ON "product_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "listings_slug_key" ON "listings"("slug");

-- CreateIndex
CREATE INDEX "listings_vendor_id_idx" ON "listings"("vendor_id");

-- CreateIndex
CREATE INDEX "listings_catalog_product_id_idx" ON "listings"("catalog_product_id");

-- CreateIndex
CREATE INDEX "listings_slug_idx" ON "listings"("slug");

-- CreateIndex
CREATE INDEX "listing_price_history_listing_id_idx" ON "listing_price_history"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "listing_stats_listing_id_key" ON "listing_stats"("listing_id");

-- CreateIndex
CREATE INDEX "listing_analytics_date_idx" ON "listing_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "listing_analytics_listing_id_date_key" ON "listing_analytics"("listing_id", "date");

-- CreateIndex
CREATE INDEX "product_media_product_id_idx" ON "product_media"("product_id");

-- CreateIndex
CREATE INDEX "product_media_sort_order_idx" ON "product_media"("sort_order");

-- CreateIndex
CREATE INDEX "reviews_catalog_product_id_idx" ON "reviews"("catalog_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_catalog_product_id_key" ON "reviews"("user_id", "catalog_product_id");

-- CreateIndex
CREATE INDEX "favorites_user_id_idx" ON "favorites"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_catalog_product_id_key" ON "favorites"("user_id", "catalog_product_id");

-- CreateIndex
CREATE INDEX "category_attributes_category_id_idx" ON "category_attributes"("category_id");

-- CreateIndex
CREATE INDEX "category_attributes_surplus_category_id_idx" ON "category_attributes"("surplus_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "collections_slug_key" ON "collections"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "collection_products_collection_id_listing_id_key" ON "collection_products"("collection_id", "listing_id");

-- CreateIndex
CREATE INDEX "warehouses_vendor_id_idx" ON "warehouses"("vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_listing_id_warehouse_id_key" ON "stocks"("listing_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "stock_reservations_stock_id_idx" ON "stock_reservations"("stock_id");

-- CreateIndex
CREATE INDEX "purchase_orders_vendor_id_idx" ON "purchase_orders"("vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "transfers_transfer_number_key" ON "transfers"("transfer_number");

-- CreateIndex
CREATE INDEX "transfers_vendor_id_idx" ON "transfers"("vendor_id");

-- CreateIndex
CREATE INDEX "inventory_logs_vendor_id_idx" ON "inventory_logs"("vendor_id");

-- CreateIndex
CREATE INDEX "inventory_logs_listing_id_idx" ON "inventory_logs"("listing_id");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_vendor_id_idx" ON "orders"("vendor_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_listing_id_idx" ON "order_items"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_id_key" ON "carts"("user_id");

-- CreateIndex
CREATE INDEX "cart_items_cart_id_idx" ON "cart_items"("cart_id");

-- CreateIndex
CREATE INDEX "cart_items_listing_id_idx" ON "cart_items"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_order_id_key" ON "disputes"("order_id");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

-- CreateIndex
CREATE UNIQUE INDEX "surplus_categories_name_key" ON "surplus_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "surplus_categories_slug_key" ON "surplus_categories"("slug");

-- CreateIndex
CREATE INDEX "surplus_categories_parent_id_idx" ON "surplus_categories"("parent_id");

-- CreateIndex
CREATE INDEX "surplus_categories_slug_idx" ON "surplus_categories"("slug");

-- CreateIndex
CREATE INDEX "surplus_items_city_idx" ON "surplus_items"("city");

-- CreateIndex
CREATE INDEX "surplus_items_city_status_idx" ON "surplus_items"("city", "status");

-- CreateIndex
CREATE INDEX "wanted_items_company_id_idx" ON "wanted_items"("company_id");

-- CreateIndex
CREATE INDEX "wanted_items_user_id_idx" ON "wanted_items"("user_id");

-- CreateIndex
CREATE INDEX "wanted_items_category_id_idx" ON "wanted_items"("category_id");

-- CreateIndex
CREATE INDEX "demand_matches_buyer_item_id_idx" ON "demand_matches"("buyer_item_id");

-- CreateIndex
CREATE INDEX "demand_matches_seller_item_id_idx" ON "demand_matches"("seller_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "trade_offers_down_payment_hold_id_key" ON "trade_offers"("down_payment_hold_id");

-- CreateIndex
CREATE UNIQUE INDEX "barter_swap_sessions_trade_offer_id_key" ON "barter_swap_sessions"("trade_offer_id");

-- CreateIndex
CREATE UNIQUE INDEX "barter_swap_sessions_from_collateral_hold_id_key" ON "barter_swap_sessions"("from_collateral_hold_id");

-- CreateIndex
CREATE UNIQUE INDEX "barter_swap_sessions_to_collateral_hold_id_key" ON "barter_swap_sessions"("to_collateral_hold_id");

-- CreateIndex
CREATE UNIQUE INDEX "barter_parts_swap_session_id_part_number_key" ON "barter_parts"("swap_session_id", "part_number");

-- CreateIndex
CREATE UNIQUE INDEX "trade_completions_trade_offer_id_key" ON "trade_completions"("trade_offer_id");

-- CreateIndex
CREATE INDEX "trade_completions_trade_offer_id_idx" ON "trade_completions"("trade_offer_id");

-- CreateIndex
CREATE INDEX "trade_reviews_trade_offer_id_idx" ON "trade_reviews"("trade_offer_id");

-- CreateIndex
CREATE INDEX "trade_reviews_from_user_id_idx" ON "trade_reviews"("from_user_id");

-- CreateIndex
CREATE INDEX "trade_reviews_to_user_id_idx" ON "trade_reviews"("to_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "trade_reviews_trade_offer_id_from_user_id_key" ON "trade_reviews"("trade_offer_id", "from_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "trade_matches_offer_id_key" ON "trade_matches"("offer_id");

-- CreateIndex
CREATE INDEX "auctions_status_end_time_idx" ON "auctions"("status", "end_time");

-- CreateIndex
CREATE INDEX "auctions_listing_id_idx" ON "auctions"("listing_id");

-- CreateIndex
CREATE INDEX "auction_winners_auction_id_idx" ON "auction_winners"("auction_id");

-- CreateIndex
CREATE INDEX "auction_winners_user_id_idx" ON "auction_winners"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auction_winners_auction_id_position_key" ON "auction_winners"("auction_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "auction_participations_hold_id_key" ON "auction_participations"("hold_id");

-- CreateIndex
CREATE UNIQUE INDEX "auction_participations_auction_id_user_id_key" ON "auction_participations"("auction_id", "user_id");

-- CreateIndex
CREATE INDEX "auction_bids_auction_id_idx" ON "auction_bids"("auction_id");

-- CreateIndex
CREATE INDEX "auction_bids_user_id_idx" ON "auction_bids"("user_id");

-- CreateIndex
CREATE INDEX "lotteries_end_time_idx" ON "lotteries"("end_time");

-- CreateIndex
CREATE INDEX "lotteries_status_idx" ON "lotteries"("status");

-- CreateIndex
CREATE INDEX "lottery_tickets_lottery_id_idx" ON "lottery_tickets"("lottery_id");

-- CreateIndex
CREATE INDEX "lottery_tickets_user_id_idx" ON "lottery_tickets"("user_id");

-- CreateIndex
CREATE INDEX "home_banners_platform_order_idx" ON "home_banners"("platform", "order");

-- CreateIndex
CREATE INDEX "home_quad_cards_platform_order_idx" ON "home_quad_cards"("platform", "order");

-- CreateIndex
CREATE INDEX "home_quad_card_items_quad_card_id_order_idx" ON "home_quad_card_items"("quad_card_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "help_categories_slug_key" ON "help_categories"("slug");

-- CreateIndex
CREATE INDEX "help_categories_platform_order_idx" ON "help_categories"("platform", "order");

-- CreateIndex
CREATE UNIQUE INDEX "help_articles_slug_key" ON "help_articles"("slug");

-- CreateIndex
CREATE INDEX "help_articles_platform_category_id_status_idx" ON "help_articles"("platform", "category_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "policies_slug_key" ON "policies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "dynamic_contents_key_key" ON "dynamic_contents"("key");

-- CreateIndex
CREATE UNIQUE INDEX "seo_metadata_path_key" ON "seo_metadata"("path");

-- CreateIndex
CREATE INDEX "seo_metadata_platform_path_idx" ON "seo_metadata"("platform", "path");

-- CreateIndex
CREATE INDEX "ad_campaigns_ad_status_idx" ON "ad_campaigns"("ad_status");

-- CreateIndex
CREATE INDEX "ad_campaigns_ad_type_idx" ON "ad_campaigns"("ad_type");

-- CreateIndex
CREATE INDEX "ad_campaigns_platform_idx" ON "ad_campaigns"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "ad_slots_slot_type_platform_key" ON "ad_slots"("slot_type", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "ad_campaign_products_ad_campaign_id_listing_id_key" ON "ad_campaign_products"("ad_campaign_id", "listing_id");

-- CreateIndex
CREATE INDEX "ad_campaign_metrics_date_idx" ON "ad_campaign_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ad_campaign_metrics_ad_campaign_id_date_key" ON "ad_campaign_metrics"("ad_campaign_id", "date");

-- CreateIndex
CREATE INDEX "ad_locations_tag_idx" ON "ad_locations"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "ad_locations_home_banner_id_tag_key" ON "ad_locations"("home_banner_id", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "ad_locations_side_ad_id_tag_key" ON "ad_locations"("side_ad_id", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "ad_locations_ad_campaign_id_tag_key" ON "ad_locations"("ad_campaign_id", "tag");

-- CreateIndex
CREATE INDEX "side_ads_is_active_order_side_idx" ON "side_ads"("is_active", "order", "side");

-- CreateIndex
CREATE UNIQUE INDEX "membership_tiers_name_key" ON "membership_tiers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_levels_user_id_key" ON "user_levels"("user_id");

-- CreateIndex
CREATE INDEX "user_levels_user_id_idx" ON "user_levels"("user_id");

-- CreateIndex
CREATE INDEX "xp_transactions_user_id_idx" ON "xp_transactions"("user_id");

-- CreateIndex
CREATE INDEX "xp_batches_account_id_idx" ON "xp_batches"("account_id");

-- CreateIndex
CREATE INDEX "xp_batches_expires_at_idx" ON "xp_batches"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "missions_key_key" ON "missions"("key");

-- CreateIndex
CREATE INDEX "user_missions_user_id_status_idx" ON "user_missions"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_missions_user_id_mission_id_key" ON "user_missions"("user_id", "mission_id");

-- CreateIndex
CREATE UNIQUE INDEX "milestone_trackers_user_id_key" ON "milestone_trackers"("user_id");

-- CreateIndex
CREATE INDEX "loyalty_tier_history_user_id_idx" ON "loyalty_tier_history"("user_id");

-- CreateIndex
CREATE INDEX "xp_distribution_rules_city_idx" ON "xp_distribution_rules"("city");

-- CreateIndex
CREATE INDEX "xp_distribution_rules_vendor_tier_idx" ON "xp_distribution_rules"("vendor_tier");

-- CreateIndex
CREATE INDEX "xp_spending_limit_rules_vendor_tier_idx" ON "xp_spending_limit_rules"("vendor_tier");

-- CreateIndex
CREATE INDEX "platinum_mission_logs_user_id_vendor_id_idx" ON "platinum_mission_logs"("user_id", "vendor_id");

-- CreateIndex
CREATE INDEX "analytics_events_event_type_idx" ON "analytics_events"("event_type");

-- CreateIndex
CREATE INDEX "analytics_events_user_id_idx" ON "analytics_events"("user_id");

-- CreateIndex
CREATE INDEX "analytics_events_session_id_idx" ON "analytics_events"("session_id");

-- CreateIndex
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");

-- CreateIndex
CREATE INDEX "product_activities_listing_id_idx" ON "product_activities"("listing_id");

-- CreateIndex
CREATE INDEX "product_activities_catalog_product_id_idx" ON "product_activities"("catalog_product_id");

-- CreateIndex
CREATE INDEX "product_activities_type_idx" ON "product_activities"("type");

-- CreateIndex
CREATE INDEX "product_activities_created_at_idx" ON "product_activities"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_order_id_key" ON "chat_rooms"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_trade_offer_id_key" ON "chat_rooms"("trade_offer_id");

-- CreateIndex
CREATE INDEX "chat_rooms_is_archived_idx" ON "chat_rooms"("is_archived");

-- CreateIndex
CREATE INDEX "chat_rooms_updated_at_idx" ON "chat_rooms"("updated_at");

-- CreateIndex
CREATE INDEX "chat_messages_room_id_idx" ON "chat_messages"("room_id");

-- CreateIndex
CREATE INDEX "chat_messages_sender_id_idx" ON "chat_messages"("sender_id");

-- CreateIndex
CREATE INDEX "chat_messages_room_id_created_at_idx" ON "chat_messages"("room_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "user_complaints_reporter_id_idx" ON "user_complaints"("reporter_id");

-- CreateIndex
CREATE INDEX "user_complaints_subject_id_idx" ON "user_complaints"("subject_id");

-- CreateIndex
CREATE INDEX "user_complaints_status_idx" ON "user_complaints"("status");

-- CreateIndex
CREATE UNIQUE INDEX "_BrandToCatalogProduct_AB_unique" ON "_BrandToCatalogProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_BrandToCatalogProduct_B_index" ON "_BrandToCatalogProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CampaignListings_AB_unique" ON "_CampaignListings"("A", "B");

-- CreateIndex
CREATE INDEX "_CampaignListings_B_index" ON "_CampaignListings"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sso_tokens" ADD CONSTRAINT "sso_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_ecosystem_id_fkey" FOREIGN KEY ("ecosystem_id") REFERENCES "brand_ecosystems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_profiles" ADD CONSTRAINT "vendor_profiles_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_settings" ADD CONSTRAINT "vendor_settings_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_b2b_data" ADD CONSTRAINT "vendor_b2b_data_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_metrics" ADD CONSTRAINT "vendor_metrics_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_stats" ADD CONSTRAINT "vendor_stats_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_banners" ADD CONSTRAINT "vendor_banners_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_followers" ADD CONSTRAINT "vendor_followers_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bank_accounts" ADD CONSTRAINT "vendor_bank_accounts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_categories" ADD CONSTRAINT "vendor_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_categories" ADD CONSTRAINT "vendor_categories_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_ecosystems" ADD CONSTRAINT "brand_ecosystems_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem_audit_logs" ADD CONSTRAINT "ecosystem_audit_logs_ecosystem_id_fkey" FOREIGN KEY ("ecosystem_id") REFERENCES "brand_ecosystems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_models" ADD CONSTRAINT "catalog_models_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_products" ADD CONSTRAINT "catalog_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_products" ADD CONSTRAINT "catalog_products_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "catalog_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_products" ADD CONSTRAINT "catalog_products_product_type_id_fkey" FOREIGN KEY ("product_type_id") REFERENCES "product_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_violations" ADD CONSTRAINT "brand_violations_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_catalog_product_id_fkey" FOREIGN KEY ("catalog_product_id") REFERENCES "catalog_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_ecosystem_id_fkey" FOREIGN KEY ("ecosystem_id") REFERENCES "brand_ecosystems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_price_history" ADD CONSTRAINT "listing_price_history_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_stats" ADD CONSTRAINT "listing_stats_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_analytics" ADD CONSTRAINT "listing_analytics_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "catalog_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_catalog_product_id_fkey" FOREIGN KEY ("catalog_product_id") REFERENCES "catalog_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_catalog_product_id_fkey" FOREIGN KEY ("catalog_product_id") REFERENCES "catalog_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_surplus_category_id_fkey" FOREIGN KEY ("surplus_category_id") REFERENCES "surplus_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_products" ADD CONSTRAINT "collection_products_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_products" ADD CONSTRAINT "collection_products_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_items" ADD CONSTRAINT "transfer_items_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_items" ADD CONSTRAINT "transfer_items_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_returns" ADD CONSTRAINT "order_returns_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surplus_categories" ADD CONSTRAINT "surplus_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "surplus_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surplus_items" ADD CONSTRAINT "surplus_items_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wanted_items" ADD CONSTRAINT "wanted_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "surplus_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wanted_items" ADD CONSTRAINT "wanted_items_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_matches" ADD CONSTRAINT "demand_matches_buyer_item_id_fkey" FOREIGN KEY ("buyer_item_id") REFERENCES "wanted_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_matches" ADD CONSTRAINT "demand_matches_seller_item_id_fkey" FOREIGN KEY ("seller_item_id") REFERENCES "wanted_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_matches" ADD CONSTRAINT "demand_matches_surplus_item_id_fkey" FOREIGN KEY ("surplus_item_id") REFERENCES "surplus_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_offers" ADD CONSTRAINT "trade_offers_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "trade_chains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_offers" ADD CONSTRAINT "trade_offers_from_company_id_fkey" FOREIGN KEY ("from_company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_offers" ADD CONSTRAINT "trade_offers_offered_item_id_fkey" FOREIGN KEY ("offered_item_id") REFERENCES "surplus_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_offers" ADD CONSTRAINT "trade_offers_parent_offer_id_fkey" FOREIGN KEY ("parent_offer_id") REFERENCES "trade_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_offers" ADD CONSTRAINT "trade_offers_requested_item_id_fkey" FOREIGN KEY ("requested_item_id") REFERENCES "surplus_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_offers" ADD CONSTRAINT "trade_offers_to_company_id_fkey" FOREIGN KEY ("to_company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_offer_items" ADD CONSTRAINT "trade_offer_items_offered_offer_id_fkey" FOREIGN KEY ("offered_offer_id") REFERENCES "trade_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_offer_items" ADD CONSTRAINT "trade_offer_items_requested_offer_id_fkey" FOREIGN KEY ("requested_offer_id") REFERENCES "trade_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barter_swap_sessions" ADD CONSTRAINT "barter_swap_sessions_trade_offer_id_fkey" FOREIGN KEY ("trade_offer_id") REFERENCES "trade_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barter_parts" ADD CONSTRAINT "barter_parts_swap_session_id_fkey" FOREIGN KEY ("swap_session_id") REFERENCES "barter_swap_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_completions" ADD CONSTRAINT "trade_completions_trade_offer_id_fkey" FOREIGN KEY ("trade_offer_id") REFERENCES "trade_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_reviews" ADD CONSTRAINT "trade_reviews_trade_offer_id_fkey" FOREIGN KEY ("trade_offer_id") REFERENCES "trade_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_winners" ADD CONSTRAINT "auction_winners_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_participations" ADD CONSTRAINT "auction_participations_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_bids" ADD CONSTRAINT "auction_bids_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotteries" ADD CONSTRAINT "lotteries_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lottery_tickets" ADD CONSTRAINT "lottery_tickets_lottery_id_fkey" FOREIGN KEY ("lottery_id") REFERENCES "lotteries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_quad_card_items" ADD CONSTRAINT "home_quad_card_items_quad_card_id_fkey" FOREIGN KEY ("quad_card_id") REFERENCES "home_quad_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_categories" ADD CONSTRAINT "help_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "help_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "help_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_slot_to_campaign" ADD CONSTRAINT "ad_slot_to_campaign_ad_campaign_id_fkey" FOREIGN KEY ("ad_campaign_id") REFERENCES "ad_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_slot_to_campaign" ADD CONSTRAINT "ad_slot_to_campaign_ad_slot_id_fkey" FOREIGN KEY ("ad_slot_id") REFERENCES "ad_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_campaign_products" ADD CONSTRAINT "ad_campaign_products_ad_campaign_id_fkey" FOREIGN KEY ("ad_campaign_id") REFERENCES "ad_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_campaign_products" ADD CONSTRAINT "ad_campaign_products_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_campaign_metrics" ADD CONSTRAINT "ad_campaign_metrics_ad_campaign_id_fkey" FOREIGN KEY ("ad_campaign_id") REFERENCES "ad_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_locations" ADD CONSTRAINT "ad_locations_ad_campaign_id_fkey" FOREIGN KEY ("ad_campaign_id") REFERENCES "ad_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_locations" ADD CONSTRAINT "ad_locations_home_banner_id_fkey" FOREIGN KEY ("home_banner_id") REFERENCES "home_banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_locations" ADD CONSTRAINT "ad_locations_side_ad_id_fkey" FOREIGN KEY ("side_ad_id") REFERENCES "side_ads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_levels" ADD CONSTRAINT "user_levels_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "membership_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToCatalogProduct" ADD CONSTRAINT "_BrandToCatalogProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToCatalogProduct" ADD CONSTRAINT "_BrandToCatalogProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignListings" ADD CONSTRAINT "_CampaignListings_A_fkey" FOREIGN KEY ("A") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignListings" ADD CONSTRAINT "_CampaignListings_B_fkey" FOREIGN KEY ("B") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
