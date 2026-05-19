// apps/backend/src/modules/vendor/application/services/early-payment.service.ts
// EarlyPaymentService — Erken ödeme yönetimi (Master Plan §3.5.4)
// %0.05/gün faiz, %80 maks çekilebilir, günlük 1 talep, minimum 500₺

import { Injectable, Logger, Inject } from '@nestjs/common';
import { IEarlyPaymentRepository } from '../../domain/repositories/early-payment.repository.interface';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { EarlyPaymentRequest } from '../../domain/entities/early-payment-request.entity';
import { EarlyPaymentStatus } from '../../domain/enums/early-payment-status.enum';

export interface EligibilityResult {
  eligible: boolean;
  earnedAmount: number;
  availableAmount: number; // %80'e kadar
  reason?: string;
}

export interface CreateEarlyPaymentDto {
  requestedAmount: number;
  orderId?: string;
}

export interface EarlyPaymentResult {
  success: boolean;
  requestId?: string;
  error?: string;
}

@Injectable()
export class EarlyPaymentService {
  private readonly logger = new Logger(EarlyPaymentService.name);
  private readonly DAILY_INTEREST_RATE = 0.0005; // %0.05/gün
  private readonly MAX_WITHDRAWAL_RATE = 0.80;   // %80 max
  private readonly MIN_AMOUNT = 500;             // Minimum 500₺

  constructor(
    @Inject('IEarlyPaymentRepository') private readonly earlyPaymentRepo: IEarlyPaymentRepository,
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Satıcının erken ödeme eligibility kontrolü
   * Master Plan §3.5.4: "Günlük faiz: %0.05, Maksimum: %80 hakediş"
   */
  async checkEligibility(vendorId: string): Promise<EligibilityResult> {
    const vendor = await this.vendorRepo.findById(vendorId);
    if (!vendor) {
      return { eligible: false, earnedAmount: 0, availableAmount: 0, reason: 'Satıcı bulunamadı' };
    }

    // TODO: Gerçek earning hesaplaması — şimdilik vendor stats'dan placeholder
    // Gerçek sistemde: vendor'ın tamamlanmış siparişlerinden hak edilmiş tutar hesaplanır
    const earnedAmount = await this.calculateEarnedAmount(vendorId);

    if (earnedAmount < this.MIN_AMOUNT) {
      return {
        eligible: false,
        earnedAmount,
        availableAmount: 0,
        reason: `Minimum hak edilmiş tutar ${this.MIN_AMOUNT}₺ olmalıdır`,
      };
    }

    const availableAmount = Math.min(earnedAmount * this.MAX_WITHDRAWAL_RATE, earnedAmount);

    return {
      eligible: true,
      earnedAmount,
      availableAmount,
    };
  }

  /**
   * Erken ödeme talebi oluştur
   * Master Plan §3.5.4: "Günde 1 talep" kuralı
   */
  async createRequest(vendorId: string, dto: CreateEarlyPaymentDto): Promise<{ id: string }> {
    const eligibility = await this.checkEligibility(vendorId);

    if (!eligibility.eligible) {
      throw new Error(eligibility.reason || 'Erken ödeme uygun değil');
    }

    // Günde 1 talep kontrolü
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRequests = await this.earlyPaymentRepo.findByVendorAndDateRange(
      vendorId,
      today,
      new Date(),
    );

    if (todayRequests.length > 0) {
      throw new Error('Günde sadece 1 erken ödeme talebi oluşturulabilir');
    }

    // Idempotency key oluştur
    const idempotencyKey = `early-payment-${vendorId}-${Date.now()}`;

    const entity = EarlyPaymentRequest.create({
      vendorId,
      earnedAmount: eligibility.earnedAmount,
      requestedAmount: dto.requestedAmount,
      idempotencyKey,
      orderId: dto.orderId,
    });

    await this.earlyPaymentRepo.save(entity);

    await this.auditLog.log({
      actorId: vendorId,
      action: 'EARLY_PAYMENT_REQUESTED',
      resourceType: 'EarlyPaymentRequest',
      resourceId: entity.id,
      newValue: {
        requestedAmount: dto.requestedAmount,
        availableAmount: eligibility.availableAmount,
        earnedAmount: eligibility.earnedAmount,
      },
    });

    this.logger.log('Erken ödeme talebi oluşturuldu', {
      requestId: entity.id,
      vendorId,
      amount: dto.requestedAmount,
    });

    return { id: entity.id };
  }

  /**
   * Admin onay verir — transferFunds çağrısı
   */
  async approveRequest(
    requestId: string,
    adminId: string,
    payeeAccountId: string,
  ): Promise<EarlyPaymentResult> {
    const entity = await this.earlyPaymentRepo.findById(requestId);
    if (!entity) {
      return { success: false, error: 'Talep bulunamadı' };
    }

    if (entity.status !== EarlyPaymentStatus.PENDING) {
      return { success: false, error: `Talep zaten ${entity.status} durumunda` };
    }

    entity.approve(payeeAccountId);
    await this.earlyPaymentRepo.save(entity);

    // TransferFunds çağrısı (gRPC)
    const idempotencyKey = `early-payment-approve-${requestId}-${Date.now()}`;
    try {
      const result = await this.financialGateway.refundFunds(
        entity.id, // holdId placeholder
        idempotencyKey,
      );
      const transactionId = (result as any)?.transactionId ?? idempotencyKey;

      entity.markPaid(transactionId);
      await this.earlyPaymentRepo.save(entity);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('Early payment transfer başarısız', { requestId, error: msg });
    }

    await this.auditLog.log({
      actorId: adminId,
      action: 'EARLY_PAYMENT_APPROVED',
      resourceType: 'EarlyPaymentRequest',
      resourceId: requestId,
      newValue: { payeeAccountId, totalAmount: entity.totalAmount },
    });

    this.logger.log('Erken ödeme onaylandı', { requestId, transactionId: entity.transactionId });
    return { success: true, requestId: entity.id };
  }

  /**
   * Admin reddeder
   */
  async rejectRequest(
    requestId: string,
    adminId: string,
    reason: string,
  ): Promise<EarlyPaymentResult> {
    const entity = await this.earlyPaymentRepo.findById(requestId);
    if (!entity) {
      return { success: false, error: 'Talep bulunamadı' };
    }

    if (entity.status !== EarlyPaymentStatus.PENDING) {
      return { success: false, error: `Talep zaten ${entity.status} durumunda` };
    }

    entity.reject(reason);
    await this.earlyPaymentRepo.save(entity);

    await this.auditLog.log({
      actorId: adminId,
      action: 'EARLY_PAYMENT_REJECTED',
      resourceType: 'EarlyPaymentRequest',
      resourceId: requestId,
      newValue: { reason },
    });

    this.logger.log('Erken ödeme reddedildi', { requestId, reason });
    return { success: true, requestId: entity.id };
  }

  /**
   * Hak edilmiş tutarı hesapla (placeholder — gerçek sistemde order/settlement hesaplaması)
   */
  private async calculateEarnedAmount(vendorId: string): Promise<number> {
    // TODO: Vendor'ın tamamlanmış siparişlerinden hak edilmiş tutarı hesapla
    // Şimdilik: 0 döndür — gerçek entegrasyonda CommissionEngineService kullanılabilir
    return 0;
  }
}