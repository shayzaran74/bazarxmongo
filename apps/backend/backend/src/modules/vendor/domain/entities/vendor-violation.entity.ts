// apps/backend/src/modules/vendor/domain/entities/vendor-violation.entity.ts

import { AggregateRoot, DomainException } from '@barterborsa/shared-core';
import { VendorViolationType } from '../enums/vendor-violation-type.enum';

export interface VendorViolationProps {
  vendorId: string;
  type: VendorViolationType;
  severity: 'WARNING' | 'PENALTY' | 'FREEZE';
  description: string;
  relatedEntityId?: string;  // SwapSession, Order, vs.
  relatedEntityType?: string;
  penaltyScore?: number;     // Kaç puan düşülecek
  isActive: boolean;
  expiresAt?: Date;          // Uyarıların süresi
  createdAt: Date;
}

export class VendorViolation extends AggregateRoot<VendorViolationProps> {
  protected constructor(props: VendorViolationProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: VendorViolationProps, id: string): VendorViolation {
    return new VendorViolation(props, id);
  }

  /**
   * İhlal oluştur
   */
  public static create(props: {
    vendorId: string;
    type: VendorViolationType;
    description: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    severity?: 'WARNING' | 'PENALTY' | 'FREEZE';
    penaltyScore?: number;
  }): VendorViolation {
    // Uyumluluk ihlali ise otomatik ceza uygula
    const isComplianceViolation = [
      VendorViolationType.PRICE_FLOOR_VIOLATION,
      VendorViolationType.QUOTA_VIOLATION,
    ].includes(props.type);

    const severity = props.severity ?? (isComplianceViolation ? 'WARNING' : 'PENALTY');
    const penaltyScore = props.penaltyScore ?? (isComplianceViolation ? 0 : 10);

    // Uyarılar 30 gün sonra expire olur
    const expiresAt = severity === 'WARNING' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined;

    return new VendorViolation({
      vendorId: props.vendorId,
      type: props.type,
      severity,
      description: props.description,
      relatedEntityId: props.relatedEntityId,
      relatedEntityType: props.relatedEntityType,
      penaltyScore,
      isActive: true,
      expiresAt,
      createdAt: new Date(),
    });
  }

  /**
   * İhlali pasif yap (affetme durumunda)
   */
  public deactivate(): void {
    this.props.isActive = false;
    this._updatedAt = new Date();
  }

  /**
   * Süresi dolmuş mu?
   */
  public isExpired(): boolean {
    if (!this.props.expiresAt) return false;
    return new Date() > this.props.expiresAt;
  }

  // Getters
  get vendorId(): string { return this.props.vendorId; }
  get type(): VendorViolationType { return this.props.type; }
  get severity(): 'WARNING' | 'PENALTY' | 'FREEZE' { return this.props.severity; }
  get description(): string { return this.props.description; }
  get penaltyScore(): number | undefined { return this.props.penaltyScore; }
  get isActive(): boolean { return this.props.isActive; }
  get expiresAt(): Date | undefined { return this.props.expiresAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get relatedEntityId(): string | undefined { return this.props.relatedEntityId; }
}