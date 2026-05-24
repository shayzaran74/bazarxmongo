// apps/backend/src/modules/vendor/domain/entities/brand-ecosystem.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { EcosystemCreatedEvent } from '../events/ecosystem-created.event';

export interface BrandEcosystemProps {
  name: string;
  slug: string;
  description?: string;
  status: string; // ACTIVE, INACTIVE
  ownerId: string; // Vendor ID
  internalCommRate: number;
  isBlindPool: boolean;
  logoUrl?: string;
}

export class BrandEcosystem extends AggregateRoot<BrandEcosystemProps> {
  private constructor(props: BrandEcosystemProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<BrandEcosystemProps, 'status' | 'internalCommRate' | 'isBlindPool'>): BrandEcosystem {
    const ecosystem = new BrandEcosystem({
      ...props,
      status: 'ACTIVE',
      internalCommRate: 4.0,
      isBlindPool: true,
    });

    ecosystem.addDomainEvent(new EcosystemCreatedEvent(ecosystem.id, props.name, props.ownerId));
    return ecosystem;
  }

  public setCommissionRate(rate: number): void {
    if (rate < 1 || rate > 20) {
      throw new Error('Komisyon oranı 1-20 arasında olmalıdır');
    }
    this.props.internalCommRate = rate;
    (this as unknown as { _updatedAt: Date })._updatedAt = new Date();
  }

  get name(): string { return this.props.name; }
  get ownerId(): string { return this.props.ownerId; }
}
