// apps/backend/src/modules/communication/domain/entities/user-complaint.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { ComplaintStatus } from '../enums/complaint-status.enum';

export interface UserComplaintProps {
  reporterId: string;
  subjectId: string;
  reason: string;
  description?: string;
  status: ComplaintStatus;
  adminNote?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserComplaint extends AggregateRoot<UserComplaintProps> {
  private constructor(props: UserComplaintProps, id?: string) {
    super(props, id);
  }

  public static create(
    reporterId: string,
    subjectId: string,
    reason: string,
    description?: string
  ): UserComplaint {
    const now = new Date();
    return new UserComplaint({
      reporterId,
      subjectId,
      reason,
      description,
      status: ComplaintStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  public review(): void {
    if (this.props.status === ComplaintStatus.PENDING) {
      this.props.status = ComplaintStatus.UNDER_REVIEW;
      this.props.updatedAt = new Date();
    }
  }

  public resolve(adminNote: string, resolvedBy: string): void {
    this.props.status = ComplaintStatus.RESOLVED;
    this.props.adminNote = adminNote;
    this.props.resolvedBy = resolvedBy;
    this.props.resolvedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public reject(adminNote: string, resolvedBy: string): void {
    this.props.status = ComplaintStatus.REJECTED;
    this.props.adminNote = adminNote;
    this.props.resolvedBy = resolvedBy;
    this.props.resolvedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public static createFrom(props: UserComplaintProps, id: string): UserComplaint {
    return new UserComplaint(props, id);
  }
}
