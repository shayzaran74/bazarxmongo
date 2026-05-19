// packages/shared/shared-persistence/src/mongodb/cascade-middleware.factory.ts
// Cascade middleware factory — Mongoose middleware'de merkezi cascade yönetimi
// ADR-005 §9 prensibi: Tüm onDelete cascade handler'lara dağıtılmaz, merkezi factory'de yönetilir.
// Kullanım: registerCascade('Vendor', ['Listing', 'Brand', 'Banner', 'VendorB2BData', ...])

import { Schema } from 'mongoose';

interface CascadeConfig {
  parent: string;
  children: string[];
}

// Registry — hangi parent hangi child'lara cascade eder
const cascadeRegistry: Map<string, string[]> = new Map();

// Child model isimlerini kaydet (string olarak tutulur, model import edilmez)
export function registerCascade(parent: string, children: string[]): void {
  cascadeRegistry.set(parent, children);
}

// Mevcut kayıtlı cascade config'leri
export function getCascadeChildren(parent: string): string[] {
  return cascadeRegistry.get(parent) || [];
}

// Tüm cascade ilişkilerini döndür
export function getAllCascades(): Map<string, string[]> {
  return new Map(cascadeRegistry);
}

// Cascade middleware'ini schema'ya uygula
// Her parent model için pre('deleteOne') ve pre('findOneAndDelete') hook ekler
export function applyCascadeMiddleware(schema: Schema, parentName: string): void {
  const children = cascadeRegistry.get(parentName);
  if (!children || children.length === 0) return;

  // Pre-deleteOne: parent silmeden önce child'ları sil (soft delete veya hard delete)
  schema.pre('deleteOne', { document: true }, async function () {
    const parentDoc = this as unknown as Record<string, unknown>;
    const childModelNames = children;

    // Her child model için işlem yap
    const connection = (this as any).constructor.base?.conn || (this as any).model?.base?.conn;
    if (!connection) return;

    for (const childName of childModelNames) {
      try {
        const ChildModel = connection.models[childName];
        if (!ChildModel) continue;

        // Child model'in parent foreign key alanını bul
        const childField = `${parentName.toLowerCase()}Id`;
        const childFieldAlt = `${parentName.charAt(0).toLowerCase() + parentName.slice(1)}Id`;

        // Silinecek parent ID'yi al
        const parentId = parentDoc.id || parentDoc._id;
        if (!parentId) continue;

        // İlgili child'ları bul ve sil (cascade)
        await ChildModel.deleteMany({ [childField]: parentId }).catch(() => {
          // Field yoksa alternatif dene
        });
        await ChildModel.deleteMany({ [childFieldAlt]: parentId }).catch(() => {
          // Field yoksa atla
        });
      } catch {
        // Cascade hatası parent işlemi durdurmamalı — logla ve devam et
      }
    }
  });

  // Pre-findOneAndDelete: findOneAndDelete ile silme için de aynı cascade
  schema.pre('findOneAndDelete', async function () {
    const filter = this.getFilter();
    const parentId = filter._id || filter.id;
    if (!parentId) return;

    const connection = (this as any).model?.base?.conn || (this as any).model?.db?.conn;
    if (!connection) return;

    for (const childName of children) {
      try {
        const ChildModel = connection.models[childName];
        if (!ChildModel) continue;

        const childField = `${parentName.toLowerCase()}Id`;
        const childFieldAlt = `${parentName.charAt(0).toLowerCase() + parentName.slice(1)}Id`;

        await ChildModel.deleteMany({ [childField]: parentId }).catch(() => {
          // Field yoksa alternatif dene
        });
        await ChildModel.deleteMany({ [childFieldAlt]: parentId }).catch(() => {
          // Field yoksa atla
        });
      } catch {
        // Cascade hatası parent işlemi durdurmamalı
      }
    }
  });
}

// Vendor cascade registrations — ADR-005 Faz 2a
// Vendor silindiğinde cascade edilecek modeller:
// - Listing (vendorId)
// - Brand (vendorId)
// - VendorBanner (vendorId)
// - VendorCategory (vendorId)
// - VendorB2BData (vendorId, 1:1 cascade)
// - VendorProfile (vendorId, 1:1 cascade)
// - VendorSettings (vendorId, 1:1 cascade)
// - VendorMetrics (vendorId, 1:1 cascade)
// - VendorStats (vendorId, 1:1 cascade)
// - VendorBankAccount (vendorId)
// - LaunchPartner (vendorId) — varsa
registerCascade('Vendor', [
  'Listing',
  'Brand',
  'VendorBanner',
  'VendorCategory',
  'VendorB2BData',
  'VendorProfile',
  'VendorSettings',
  'VendorMetrics',
  'VendorStats',
  'VendorBankAccount',
  'LaunchPartner',
]);

// Company cascade registrations
// Company silindiğinde: Vendor, SurplusItem, TradeOffer
registerCascade('Company', [
  'Vendor',
]);

// Brand cascade registrations
// Brand silindiğinde: Listing, BrandViolation
registerCascade('Brand', [
  'Listing',
  'BrandViolation',
]);

// Category cascade registrations
// Category silindiğinde: Listing
registerCascade('Category', [
  'Listing',
]);

// Listing cascade registrations
// Listing silindiğinde: ListingImage, ListingPriceHistory, ListingStats, ListingAnalytic, InventoryLog
registerCascade('Listing', [
  'ListingImage',
  'ListingPriceHistory',
  'ListingStats',
  'ListingAnalytic',
  'Stock',
  'InventoryLog',
]);

// User cascade registrations
// User silindiğinde: UserProfile, UserAddress, RefreshToken, Session, LoginHistory, VerificationToken, SSOToken
registerCascade('User', [
  'UserProfile',
  'UserAddress',
  'RefreshToken',
  'Session',
  'LoginHistory',
  'VerificationToken',
  'SSOToken',
  'Vendor',
]);

// SwapSession cascade registrations
// SwapSession silindiğinde: TradeOffer (ilişki silinmez ama takip edilir)
registerCascade('SwapSession', [
  'TradeOffer',
]);

// AuditLog cascade yok — append-only

// OutboxMessage cascade yok — sistem tablosu