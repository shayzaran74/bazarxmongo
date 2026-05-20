// apps/backend/src/modules/catalog/application/dtos/listing-response.dto.ts
// Master Plan v4.3 §4.4 + §5.3 — Ekosistem (Kör Havuz) listing response'unda
// vendorId/dealerId asla expose edilmez; yerine deterministik anonymousId döner.

import { AnonymizerService } from '../../../barterborsa/application/services/anonymizer.service';

export interface PublicListingResponse {
  id: string;
  catalogProductId: string;
  title: string;
  description?: string;
  price: string;
  stock: number;
  status: string;
  visibility: string;
  condition: string;
  tags: string[];
  ecosystemId?: string;
  visibleTo?: string;
  availableFrom?: Date;
  availableTo?: Date;
  allowOnlineResale?: boolean;
  maxOrderQtyPerDealer?: number;
  createdAt?: Date;
  updatedAt?: Date;
  vendorId?: string;
}

export interface EcosystemMaskedListingResponse extends Omit<PublicListingResponse, 'vendorId'> {
  // Master Plan §4.4 — Sipariş onayı gerçekleşene kadar gerçek kimlik gizli
  anonymousVendorId: string;
}

/**
 * Listing kaydını client-bound response'a dönüştürür. Ekosistem (fabrika havuzu)
 * listing'lerinde vendorId asla geri dönmez — sadece anonymousVendorId.
 */
export function toListingResponse(
  doc: Record<string, unknown>,
  anonymizer: AnonymizerService,
): PublicListingResponse | EcosystemMaskedListingResponse {
  const base: PublicListingResponse = {
    id: String(doc.id ?? doc._id ?? ''),
    catalogProductId: String(doc.catalogProductId ?? ''),
    title: String(doc.title ?? ''),
    description: doc.description as string | undefined,
    price: String(doc.price ?? '0'),
    stock: Number(doc.stock ?? 0),
    status: String(doc.status ?? ''),
    visibility: String(doc.visibility ?? ''),
    condition: String(doc.condition ?? ''),
    tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : [],
    ecosystemId: doc.ecosystemId as string | undefined,
    visibleTo: doc.visibleTo as string | undefined,
    availableFrom: doc.availableFrom as Date | undefined,
    availableTo: doc.availableTo as Date | undefined,
    allowOnlineResale: doc.allowOnlineResale as boolean | undefined,
    maxOrderQtyPerDealer: doc.maxOrderQtyPerDealer as number | undefined,
    createdAt: doc.createdAt as Date | undefined,
    updatedAt: doc.updatedAt as Date | undefined,
    vendorId: doc.vendorId as string | undefined,
  };

  // Ekosistem listing → vendorId maskeli, gerçek kimlik gizli
  if (base.ecosystemId && base.vendorId) {
    const masked: EcosystemMaskedListingResponse = {
      ...base,
      anonymousVendorId: anonymizer.anonymize(base.vendorId, 'vendor'),
    };
    delete (masked as Partial<PublicListingResponse>).vendorId;
    return masked;
  }

  return base;
}
