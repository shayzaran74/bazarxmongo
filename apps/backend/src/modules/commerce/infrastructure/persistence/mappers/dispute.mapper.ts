// apps/backend/src/modules/commerce/infrastructure/persistence/mappers/dispute.mapper.ts
// DisputeMapper — Prisma → Mongoose (ADR-005 Faz 2a)
// Dispute does not have a full domain entity; uses Prisma-style raw object

import { IDispute, DisputeStatus } from '@barterborsa/shared-persistence/schemas/backend/dispute.schema';

export interface DisputeDocument extends IDispute {
  _id?: string;
}

export interface DisputeDto {
  id: string;
  orderId: string;
  userId: string;
  vendorId: string;
  reason: string;
  description: string | null;
  status: string;
  evidenceUrls: string[];
  adminNote: string | null;
  resolvedAt: Date | null;
  resolutionType: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class DisputeMapper {
  public static toDomain(doc: DisputeDocument): DisputeDto {
    return {
      id: doc.id,
      orderId: doc.orderId,
      userId: doc.userId,
      vendorId: doc.vendorId,
      reason: doc.reason,
      description: doc.description || null,
      status: doc.status,
      evidenceUrls: [],
      adminNote: doc.adminNote || null,
      resolvedAt: doc.resolvedAt || null,
      resolutionType: doc.resolutionType || null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  public static toPersistence(domain: DisputeDto): Record<string, unknown> {
    return {
      _id: domain.id,
      id: domain.id,
      orderId: domain.orderId,
      userId: domain.userId,
      vendorId: domain.vendorId,
      reason: domain.reason,
      description: domain.description,
      status: domain.status,
      adminNote: domain.adminNote,
      resolvedAt: domain.resolvedAt,
      resolutionType: domain.resolutionType,
    };
  }
}