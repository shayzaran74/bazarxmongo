// apps/backend/src/modules/catalog/domain/enums/listing-status.enum.ts

export enum ListingStatus {
  DRAFT = 'DRAFT',
  // Satıcı tarafından oluşturuldu, admin onayı bekliyor (onaylanınca ACTIVE olur)
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}
