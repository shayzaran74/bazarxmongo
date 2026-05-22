// apps/backend/src/modules/communication/infrastructure/persistence/mappers/user-complaint.mapper.ts
// UserComplaintMapper — Prisma → Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { IUserComplaint } from '@barterborsa/shared-persistence/schemas/backend/userComplaint.schema';
import { UserComplaint, UserComplaintProps } from '../../../domain/entities/user-complaint.entity';
import { ComplaintStatus } from '../../../domain/enums/complaint-status.enum';

export interface UserComplaintDocument extends IUserComplaint {
  _id?: string;
}

@Injectable()
export class UserComplaintMapper {
  static toDomain(doc: UserComplaintDocument): UserComplaint {
    const props: UserComplaintProps = {
      reporterId: doc.reporterId,
      subjectId: doc.subjectId,
      reason: doc.reason,
      description: doc.description ?? undefined,
      status: (doc as { status?: string }).status as ComplaintStatus ?? ComplaintStatus.PENDING,
      adminNote: doc.adminNote ?? undefined,
      resolvedAt: doc.resolvedAt ?? undefined,
      resolvedBy: doc.resolvedBy ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return UserComplaint.createFrom(props, doc.id);
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