// apps/backend/src/modules/vendor/domain/entities/vendor-score.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { VendorScoreType } from '../enums/vendor-score-type.enum';

export interface VendorScoreProps {
  vendorId: string;
  commercialPerformanceScore: number; // 0-100
  xpLoyaltyScore: number;              // 0-100
  complianceScore: number;             // 0-100
  totalScore: number;                  // Ağırlıklı toplam
  lastCalculatedAt: Date;
  periodStart: Date;                   // Score hesaplama dönemi başı
  periodEnd: Date;                     // Score hesaplama dönemi sonu
  breakdown: {
    commercialPerformance: number;     // Raw değer
    xpLoyalty: number;                 // Raw değer
    compliance: number;               // Raw değer
  };
}

const WEIGHTS = {
  [VendorScoreType.COMMERCIAL_PERFORMANCE]: 0.40,
  [VendorScoreType.XP_LOYALTY]: 0.30,
  [VendorScoreType.COMPLIANCE]: 0.30,
};

export class VendorScore extends AggregateRoot<VendorScoreProps> {
  protected constructor(props: VendorScoreProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: VendorScoreProps, id: string): VendorScore {
    return new VendorScore(props, id);
  }

  /**
   * Yeni score oluştur — Master Plan §3.4
   */
  public static create(props: {
    vendorId: string;
    commercialPerformanceScore: number;
    xpLoyaltyScore: number;
    complianceScore: number;
    periodStart: Date;
    periodEnd: Date;
  }): VendorScore {
    const totalScore =
      props.commercialPerformanceScore * WEIGHTS[VendorScoreType.COMMERCIAL_PERFORMANCE] +
      props.xpLoyaltyScore * WEIGHTS[VendorScoreType.XP_LOYALTY] +
      props.complianceScore * WEIGHTS[VendorScoreType.COMPLIANCE];

    return new VendorScore({
      vendorId: props.vendorId,
      commercialPerformanceScore: props.commercialPerformanceScore,
      xpLoyaltyScore: props.xpLoyaltyScore,
      complianceScore: props.complianceScore,
      totalScore: Math.round(totalScore * 100) / 100,
      lastCalculatedAt: new Date(),
      periodStart: props.periodStart,
      periodEnd: props.periodEnd,
      breakdown: {
        commercialPerformance: props.commercialPerformanceScore,
        xpLoyalty: props.xpLoyaltyScore,
        compliance: props.complianceScore,
      },
    });
  }

  /**
   * VendorScore güncelle — yeni değerler geldiğinde
   */
  public recalculate(newScores: {
    commercialPerformanceScore: number;
    xpLoyaltyScore: number;
    complianceScore: number;
  }): void {
    this.props.commercialPerformanceScore = newScores.commercialPerformanceScore;
    this.props.xpLoyaltyScore = newScores.xpLoyaltyScore;
    this.props.complianceScore = newScores.complianceScore;

    this.props.totalScore =
      newScores.commercialPerformanceScore * WEIGHTS[VendorScoreType.COMMERCIAL_PERFORMANCE] +
      newScores.xpLoyaltyScore * WEIGHTS[VendorScoreType.XP_LOYALTY] +
      newScores.complianceScore * WEIGHTS[VendorScoreType.COMPLIANCE];

    this.props.totalScore = Math.round(this.props.totalScore * 100) / 100;
    this.props.lastCalculatedAt = new Date();
    this.props.breakdown = {
      commercialPerformance: newScores.commercialPerformanceScore,
      xpLoyalty: newScores.xpLoyaltyScore,
      compliance: newScores.complianceScore,
    };
    this._updatedAt = new Date();
  }

  /**
   * Uyumluluk puanını düşür — ihlal durumunda
   */
  public applyCompliancePenalty(penalty: number): void {
    this.props.complianceScore = Math.max(0, this.props.complianceScore - penalty);
    this.recalculate({
      commercialPerformanceScore: this.props.commercialPerformanceScore,
      xpLoyaltyScore: this.props.xpLoyaltyScore,
      complianceScore: this.props.complianceScore,
    });
  }

  // Getters
  get vendorId(): string { return this.props.vendorId; }
  get totalScore(): number { return this.props.totalScore; }
  get commercialPerformanceScore(): number { return this.props.commercialPerformanceScore; }
  get xpLoyaltyScore(): number { return this.props.xpLoyaltyScore; }
  get complianceScore(): number { return this.props.complianceScore; }
  get lastCalculatedAt(): Date { return this.props.lastCalculatedAt; }
  get periodStart(): Date { return this.props.periodStart; }
  get periodEnd(): Date { return this.props.periodEnd; }
  get breakdown() { return this.props.breakdown; }
}