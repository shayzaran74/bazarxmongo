// apps/backend/src/modules/commerce/application/services/return.service.ts
// ReturnService — İade yönetimi iş mantığı (Master Plan §3.5.1)
// 14 gün cayma hakkı, 48s satıcı timeout → auto-approve, escrow refund tetiklemesi

import { randomUUID } from 'crypto';
import { Injectable, Logger, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { IReturnRequestRepository } from '../../domain/repositories/return-request.repository.interface';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { ReturnStatus } from '../../domain/enums/return-status.enum';
import { ReturnReasonType } from '../../domain/enums/return-reason-type.enum';

export interface CreateReturnDto {
  orderId: string;
  items: Array<{ orderItemId: string; quantity: number; reason?: string }>;
  reason: string;
  reasonType: ReturnReasonType;
}

export interface ReturnApprovalResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

export interface RefundResult {
  refundId?: string;
  holdId?: string;
}

@Injectable()
export class ReturnService {
  private readonly logger = new Logger(ReturnService.name);

  constructor(
    @Inject('IReturnRequestRepository') private readonly returnRepo: IReturnRequestRepository,
    @Inject('IOrderRepository') private readonly orderRepo: IOrderRepository,
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  async createReturn(userId: string, dto: CreateReturnDto): Promise<{ id: string }> {
    const order = await this.orderRepo.findById(dto.orderId);
    if (!order) {
      throw new NotFoundException(`Order not found: ${dto.orderId}`);
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Sipariş size ait değil');
    }

    if (order.status !== 'DELIVERED' && order.status !== 'COMPLETED') {
      throw new BadRequestException('Sadece teslim edilmiş siparişler için iade açılabilir');
    }

    const DELIVERY_GRACE_DAYS = 14;
    const now = new Date();
    const created = order['createdAt'] ? new Date(order['createdAt']) : now;
    const graceDeadline = new Date(created);
    graceDeadline.setDate(graceDeadline.getDate() + DELIVERY_GRACE_DAYS);

    if (now > graceDeadline) {
      throw new BadRequestException('İade süresi doldu (14 gün)');
    }

    const existing = await this.returnRepo.findByOrderId(dto.orderId);
    if (existing && [ReturnStatus.PENDING, ReturnStatus.APPROVED, ReturnStatus.AUTO_APPROVED].includes(existing.status as ReturnStatus)) {
      throw new BadRequestException('Bu sipariş için aktif iade talebi zaten mevcut');
    }

    // Toplam iade tutarını hesapla
    let totalRefund = 0;
    const orderItems = order.items;
    const returnItems = dto.items.map(item => {
      const orderItem = orderItems.find(oi => oi.id === item.orderItemId);
      if (!orderItem) {
        throw new NotFoundException(`OrderItem not found: ${item.orderItemId}`);
      }
      const price = Number(orderItem.price) || 0;
      const refundAmount = price * item.quantity;
      totalRefund += refundAmount;
      return {
        id: randomUUID(),
        orderItemId: item.orderItemId,
        quantity: item.quantity,
        refundAmount,
        reason: item.reason,
      };
    });

    const returnReq = (await import('../../domain/entities/return-request.entity'))
      .ReturnRequest;
    const entity = returnReq.create({
      orderId: dto.orderId,
      userId,
      reason: dto.reason,
      reasonType: dto.reasonType,
      items: returnItems,
      totalRefund: totalRefund,
      sellerId: order.vendorId,
    });

    await this.returnRepo.save(entity);

    await this.auditLog.log({
      actorId: userId,
      action: 'RETURN_REQUEST_CREATED',
      resourceType: 'ReturnRequest',
      resourceId: entity.id,
      newValue: {
        orderId: dto.orderId,
        reasonType: dto.reasonType,
        totalRefund,
        itemCount: returnItems.length,
      },
    });

    this.logger.log('İade talebi oluşturuldu', { returnId: entity.id, orderId: dto.orderId });
    return { id: entity.id };
  }

  async approveReturn(returnId: string, vendorId: string): Promise<ReturnApprovalResult> {
    const entity = await this.returnRepo.findById(returnId);
    if (!entity) {
      return { success: false, error: 'İade talebi bulunamadı' };
    }

    if (vendorId !== 'SYSTEM_AUTO_APPROVE' && entity.sellerId !== vendorId) {
      return { success: false, error: 'Bu siparişe ait değilsiniz' };
    }

    if (entity.status !== ReturnStatus.PENDING) {
      return { success: false, error: `İade zaten ${entity.status} durumunda` };
    }

    const deadline = new Date();
    if (deadline > entity.sellerDeadlineAt) {
      return { success: false, error: 'Onay süresi doldu' };
    }

    // Önce finansal iade — başarısız olursa entity kaydedilmez
    const order = await this.orderRepo.findById(entity.orderId);
    const holdId = order?.escrowHoldId ?? `return-refund-${returnId}`;
    const idempotencyKey = `return-approve-${returnId}-${Date.now()}`;

    let refundId: string;
    try {
      const refundResult = await this.financialGateway.refundFunds(holdId, idempotencyKey);
      refundId = (refundResult as RefundResult)?.refundId ?? (refundResult as RefundResult)?.holdId ?? idempotencyKey;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('Refund çağrısı başarısız — iade onaylanamadı', { returnId, holdId, error: msg });
      return { success: false, error: 'Finansal iade işlemi başarısız. Lütfen tekrar deneyin.' };
    }

    // Refund başarılı → entity durumunu güncelle ve kaydet
    entity.approve();
    await this.returnRepo.save(entity);

    try {
      await this.orderRepo.updateStatus(entity.orderId, 'REFUNDED');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.warn('Sipariş REFUNDED güncellemesi yapılamadı', { orderId: entity.orderId, error: msg });
    }

    await this.auditLog.log({
      actorId: vendorId,
      action: 'RETURN_APPROVED',
      resourceType: 'ReturnRequest',
      resourceId: returnId,
      newValue: { holdId, refundId, totalRefund: String(entity.totalRefund) },
    });

    this.logger.log('İade onaylandı', { returnId, refundId });
    return { success: true, refundId };
  }

  async rejectReturn(returnId: string, vendorId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const entity = await this.returnRepo.findById(returnId);
    if (!entity) {
      return { success: false, error: 'İade talebi bulunamadı' };
    }

    if (entity.sellerId !== vendorId) {
      return { success: false, error: 'Bu siparişe ait değilsiniz' };
    }

    if (entity.status !== ReturnStatus.PENDING) {
      return { success: false, error: `İade zaten ${entity.status} durumunda` };
    }

    entity.reject();
    await this.returnRepo.save(entity);

    await this.auditLog.log({
      actorId: vendorId,
      action: 'RETURN_REJECTED',
      resourceType: 'ReturnRequest',
      resourceId: returnId,
      newValue: { reason },
    });

    this.logger.log('İade reddedildi', { returnId, reason });
    return { success: true };
  }

  async adminArbitrate(returnId: string, adminId: string, decision: 'APPROVE' | 'REJECT'): Promise<{ success: boolean }> {
    const entity = await this.returnRepo.findById(returnId);
    if (!entity) {
      throw new NotFoundException('İade talebi bulunamadı');
    }

    entity.escalateToAdmin();

    if (decision === 'APPROVE') {
      const order = await this.orderRepo.findById(entity.orderId);
      const holdId = order?.escrowHoldId ?? `return-refund-${returnId}`;
      try {
        await this.financialGateway.refundFunds(holdId, `admin-arbitrate-${returnId}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        this.logger.error('Admin arbitration refund başarısız — işlem iptal edildi', { returnId, holdId, error: msg });
        throw new BadRequestException('Finansal iade işlemi başarısız. Tahkim iptal edildi.');
      }
      // Refund başarılı → onay durumuna geç
      entity.approve();
    } else {
      entity.reject();
    }

    await this.returnRepo.save(entity);

    await this.auditLog.log({
      actorId: adminId,
      action: 'RETURN_ADMIN_ARBITRATION',
      resourceType: 'ReturnRequest',
      resourceId: returnId,
      newValue: { decision, previousStatus: entity.status },
    });

    return { success: true };
  }
}