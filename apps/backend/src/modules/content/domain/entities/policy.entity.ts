// apps/backend/src/modules/content/domain/entities/policy.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';

export interface PolicyProps {
  title: string;
  slug: string;
  content: string;
  type: string;
  version: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Policy extends AggregateRoot<PolicyProps> {
  private constructor(props: PolicyProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<PolicyProps, 'createdAt' | 'updatedAt'>, id?: string): Policy {
    return new Policy({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id);
  }
}
