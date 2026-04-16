// apps/backend/src/modules/barter/domain/entities/demand-match.entity.ts

import { Entity } from '@barterborsa/shared-core';
import { DemandMatchStatus } from '../enums/demand-match-status.enum';
import { DemandMatchType } from '../enums/demand-match-type.enum';

export interface DemandMatchProps {
  buyerItemId: string;
  sellerItemId?: string;
  surplusItemId?: string;
  score: number;
  matchType: DemandMatchType;
  status: DemandMatchStatus;
  notes?: string;
  actionAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DemandMatch extends Entity<DemandMatchProps> {
  private constructor(props: DemandMatchProps, id?: string) {
    super(props, id);
  }

  public static create(
    buyerItemId: string,
    score: number,
    matchType: DemandMatchType,
    surplusItemId?: string,
    sellerItemId?: string
  ): DemandMatch {
    const now = new Date();
    return new DemandMatch({
      buyerItemId,
      sellerItemId,
      surplusItemId,
      score,
      matchType,
      status: DemandMatchStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  public accept(): void {
    this.props.status = DemandMatchStatus.ACCEPTED;
    this.props.actionAt = new Date();
    this.props.updatedAt = new Date();
  }

  public reject(reason: string): void {
    this.props.status = DemandMatchStatus.REJECTED;
    this.props.rejectionReason = reason;
    this.props.actionAt = new Date();
    this.props.updatedAt = new Date();
  }
}
