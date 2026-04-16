// apps/backend/src/modules/communication/infrastructure/persistence/mappers/user-complaint.mapper.ts

import { Injectable } from '@nestjs/common';
import { UserComplaint } from '../../../domain/entities/user-complaint.entity';
import { ComplaintStatus } from '../../../domain/enums/complaint-status.enum';

@Injectable()
export class UserComplaintMapper {
  toDomain(raw: any): UserComplaint {
    return (UserComplaint as any).createFrom({
      ...raw,
      status: raw.status as ComplaintStatus,
    }, raw.id);
  }

  toPersistence(domain: UserComplaint): any {
    const props = domain.getProps();
    return {
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
