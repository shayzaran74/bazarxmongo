// apps/backend/src/modules/commerce/domain/enums/einvoice-status.enum.ts

export enum EInvoiceStatus {
  DRAFT         = 'DRAFT',
  XML_GENERATED = 'XML_GENERATED',
  SIGNED        = 'SIGNED',
  SENT_TO_GIB   = 'SENT_TO_GIB',
  GIB_ACCEPTED  = 'GIB_ACCEPTED',
  GIB_REJECTED  = 'GIB_REJECTED',
  CANCELLED     = 'CANCELLED',
}

export enum RecipientType {
  BUYER  = 'BUYER',
  VENDOR = 'VENDOR',
}