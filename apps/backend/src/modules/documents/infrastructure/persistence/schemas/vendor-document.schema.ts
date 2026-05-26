// apps/backend/src/modules/documents/infrastructure/persistence/schemas/vendor-document.schema.ts

import { Schema, Document } from 'mongoose';
import { DocumentType } from '../../../domain/enums/document-type.enum';

export interface IVendorDocument extends Document {
  id: string;
  vendorId: string;
  documentType: DocumentType;
  fileKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export const VendorDocumentSchema = new Schema<IVendorDocument>({
  id: { type: String, required: true, unique: true },
  vendorId: { type: String, required: true, index: true },
  documentType: { type: String, enum: Object.values(DocumentType), required: true },
  fileKey: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String, required: true },
}, {
  timestamps: true,
  collection: 'vendor_documents'
});
