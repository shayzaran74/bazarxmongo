// apps/backend/src/modules/vendor/domain/entities/early-payment-request.entity.ts

import { AggregateRoot, DomainException } from '@barterborsa/shared-core';
import { EarlyPaymentStatus } from '../enums/early-payment-status.enum';

export interface EarlyPaymentRequestProps {
  vendorId: string;
  amount: number;          // Talep edilen ana tutar
  interestRate: number;    // Günlük faiz oranı (0.0005 = %0.05)
  interestAmount: number;  // Hesaplanan faiz tutarı
  totalAmount: number;     // Toplam ödenecek tutar
  status: EarlyPaymentStatus;
  payeeAccountId?: string;
  transactionId?: string;
  requestedAt: Date;
  processedAt?: Date;
  rejectionReason?: string;
  idempotencyKey: string;
  orderId?: string;
  earnedAmount: number;     // Hak edilmiş toplam tutar
  availableAmount: number;  // Çekilebilir tutar (%80'e kadar)
}

const VALID_TRANSITIONS: Record<EarlyPaymentStatus, EarlyPaymentStatus[]> = {
  [EarlyPaymentStatus.PENDING]:   [EarlyPaymentStatus.APPROVED, EarlyPaymentStatus.REJECTED, EarlyPaymentStatus.CANCELLED],
  [EarlyPaymentStatus.APPROVED]:  [EarlyPaymentStatus.PAID],
  [EarlyPaymentStatus.REJECTED]:   [],
  [EarlyPaymentStatus.PAID]:      [],
  [EarlyPaymentStatus.CANCELLED]:  [],
};

export class EarlyPaymentRequest extends AggregateRoot<EarlyPaymentRequestProps> {
  private constructor(props: EarlyPaymentRequestProps, id?: string) {
    super(props, id);
  }

  /**
   * Erken ödeme talebi oluştur — Master Plan §3.5.4
   * Formül: günlük faiz = remainingDays * 0.0005 * amount
   * Maksimum çekilebilir: %80 hakediş
   */
  public static create(props: {
    vendorId: string;
    earnedAmount: number;
    requestedAmount: number;
    idempotencyKey: string;
    orderId?: string;
  }): EarlyPaymentRequest {
    const MIN_AMOUNT = 500; // Minimum talep: 500₺
    const MAX_RATE = 0.80;  // Maksimum %80 çekilebilir

    const availableAmount = Math.min(props.earnedAmount * MAX_RATE, props.earnedAmount);

    if (availableAmount < MIN_AMOUNT) {
      throw new DomainException(`Erken ödeme için minimum hak edilmiş tutar ${MIN_AMOUNT}₺ olmalıdır`);
    }

    if (props.requestedAmount > availableAmount) {
      throw new DomainException(`Talep edilen tutar (${props.requestedAmount}₺) çekilebilir maksimumu (${availableAmount.toFixed(2)}₺) aşıyor`);
    }

    const now = new Date();
    const DAILY_INTEREST_RATE = 0.0005; // %0.05/gün

    // Faiz hesabı: basit fail, vadeye kalan gün * anapara * günlük oran
    // Şimdilik 0 gün vade = faiz yok (gerçek hayatta settlement date'e kadar hesaplanır)
    const interestAmount = 0;

    return new EarlyPaymentRequest({
      vendorId: props.vendorId,
      amount: props.requestedAmount,
      interestRate: DAILY_INTEREST_RATE,
      interestAmount,
      totalAmount: props.requestedAmount + interestAmount,
      status: EarlyPaymentStatus.PENDING,
      requestedAt: now,
      idempotencyKey: props.idempotencyKey,
      earnedAmount: props.earnedAmount,
      availableAmount,
      orderId: props.orderId,
    });
  }

  public static fromPersistence(props: EarlyPaymentRequestProps, id: string): EarlyPaymentRequest {
    return new EarlyPaymentRequest(props, id);
  }

  public transitionTo(newStatus: EarlyPaymentStatus): void {
    const current = this.props.status;
    const allowed = VALID_TRANSITIONS[current] || [];
    if (!allowed.includes(newStatus)) {
      throw new DomainException(`Invalid state transition: ${current} → ${newStatus}`);
    }
    this.props.status = newStatus;
  }

  public approve(payeeAccountId: string): void {
    this.transitionTo(EarlyPaymentStatus.APPROVED);
    this.props.payeeAccountId = payeeAccountId;
  }

  public reject(reason: string): void {
    this.transitionTo(EarlyPaymentStatus.REJECTED);
    this.props.rejectionReason = reason;
  }

  public markPaid(transactionId: string): void {
    this.props.status = EarlyPaymentStatus.PAID;
    this.props.transactionId = transactionId;
    this.props.processedAt = new Date();
  }

  public cancel(): void {
    this.transitionTo(EarlyPaymentStatus.CANCELLED);
  }

  get vendorId(): string { return this.props.vendorId; }
  get amount(): number { return this.props.amount; }
  get totalAmount(): number { return this.props.totalAmount; }
  get status(): EarlyPaymentStatus { return this.props.status; }
  get availableAmount(): number { return this.props.availableAmount; }
  get earnedAmount(): number { return this.props.earnedAmount; }
  get requestedAt(): Date { return this.props.requestedAt; }
  get processedAt(): Date | undefined { return this.props.processedAt; }
  get transactionId(): string | undefined { return this.props.transactionId; }
}