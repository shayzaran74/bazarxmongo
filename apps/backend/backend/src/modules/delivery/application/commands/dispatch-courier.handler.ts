// apps/backend/src/modules/delivery/application/commands/dispatch-courier.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DispatchCourierCommand } from './dispatch-courier.command';
import { IDeliveryDispatchRepository } from '../../domain/repositories/delivery-dispatch.repository.interface';
import { IOrderRepository } from '../../../commerce/domain/repositories/order.repository.interface';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { Company } from '@barterborsa/shared-persistence/schemas/backend/company.schema';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DeliveryDispatch } from '../../domain/entities/delivery-dispatch.entity';
import { OrderStatus } from '../../../commerce/domain/enums/order-status.enum';
import { DELIVERY_DISPATCH_QUEUE } from '@barterborsa/shared-queue';
import { DispatchNotificationJob } from '../workers/dispatch-notification.processor';

@CommandHandler(DispatchCourierCommand)
export class DispatchCourierHandler implements ICommandHandler<DispatchCourierCommand> {
  constructor(
    @Inject('IDeliveryDispatchRepository') private readonly dispatchRepo: IDeliveryDispatchRepository,
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    private readonly auditLog: AuditLogService,
    @InjectQueue(DELIVERY_DISPATCH_QUEUE) private readonly dispatchQueue: Queue,
  ) {}

  async execute(command: DispatchCourierCommand): Promise<{ dispatchId: string; status: string }> {
    const { orderId, courierId, userId } = command;

    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Sipariş bulunamadı.');

    const vendor = await Vendor.findOne({ userId, id: (order as { vendorId?: string }).vendorId })
      .select('id vendorType companyId')
      .exec();
    if (!vendor) throw new ForbiddenException('Bu sipariş üzerinde işlem yetkiniz yok.');
    if (vendor.vendorType !== 'RESTAURANT') {
      throw new BadRequestException('Bu aksiyon yalnızca RESTAURANT siparişlerinde geçerlidir.');
    }

    const company = vendor.companyId
      ? await Company.findOne({ id: vendor.companyId }).select('name').exec()
      : null;

    if (![OrderStatus.READY, OrderStatus.AWAITING_PICKUP].includes(order.status)) {
      throw new BadRequestException('Sipariş kuryeye ancak READY veya AWAITING_PICKUP durumlarında verilebilir.');
    }

    const orderProps = order.getProps ? order.getProps() as unknown as { props?: { shippingAddress?: { addressLine1?: string; firstName?: string; phone?: string } }; shippingAddress?: { addressLine1?: string; firstName?: string; phone?: string } } : order as unknown as { props?: { shippingAddress?: { addressLine1?: string; firstName?: string; phone?: string } }; shippingAddress?: { addressLine1?: string; firstName?: string; phone?: string } };
    const shippingAddress = (orderProps.props ?? orderProps).shippingAddress;

    let dispatch = await this.dispatchRepo.findByOrderId(orderId);
    if (!dispatch) {
      dispatch = DeliveryDispatch.create(orderId);
    }

    dispatch.assignCourier(courierId);
    await this.dispatchRepo.save(dispatch);

    order.dispatchToCourier();
    await this.orderRepository.save(order);

    // Kuryeye async bildirim gönder (BullMQ)
    const notificationJob: DispatchNotificationJob = {
      dispatchId: dispatch.id!,
      orderId,
      restaurantName: company?.name || 'Restoran',
      pickupAddress: shippingAddress?.addressLine1 || '',
      customerName: shippingAddress?.firstName || '',
      customerPhone: shippingAddress?.phone || '',
      estimatedDeliveryMinutes: 30,
    };

    await this.dispatchQueue.add('courier-assigned', notificationJob, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
    });

    await this.auditLog.log({
      actorId:      userId,
      action:       'ORDER_DISPATCHED_TO_COURIER',
      resourceType: 'DeliveryDispatch',
      resourceId:   dispatch.id!,
      newValue:     { orderId, courierId, status: dispatch.status },
    });

    return { dispatchId: dispatch.id!, status: dispatch.status };
  }
}