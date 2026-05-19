// apps/backend/src/modules/communication/infrastructure/persistence/mappers/user-complaint.mapper.ts
// UserComplaintMapper — Prisma → Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { IUserComplaint } from '@barterborsa/shared-persistence/schemas/backend/userComplaint.schema';
import { UserComplaint } from '../../../domain/entities/user-complaint.entity';

export interface UserComplaintDocument extends IUserComplaint {
  _id?: string;
  status?: string;
}

@Injectable()
export class UserComplaintMapper {
  static toDomain(doc: UserComplaintDocument): UserComplaint {
    return (UserComplaint as any).createFrom({
      reporterId: doc.reporterId,
      subjectId: doc.subjectId,
      reason: doc.reason,
      description: doc.description ?? undefined,
      status: (doc.status as any) ?? 'PENDING',
      adminNote: doc.adminNote ?? undefined,
      resolvedAt: doc.resolvedAt ?? undefined,
      resolvedBy: doc.resolvedBy ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }, doc.id);
  }

  static toPersistence(domain: UserComplaint): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
      id: domain.id,
      reporterId: props.reporterId,
      subjectId: props.subjectId,
      reason: props.reason,
      description: props.description,
      status: props.status,
      adminNote: props.adminNote,
      resolvedAt: props.resolvedAt,
      resolvedBy: props.resolvedBy,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}