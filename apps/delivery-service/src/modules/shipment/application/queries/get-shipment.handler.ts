import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetShipmentQuery } from './get-shipment.query';
import { IShipmentRepository } from '../../domain/repositories/shipment.repository.interface';
import { NotFoundException } from '@barterborsa/shared-core';

@QueryHandler(GetShipmentQuery)
export class GetShipmentHandler implements IQueryHandler<GetShipmentQuery> {
  constructor(
    @Inject('IShipmentRepository') private readonly shipmentRepository: IShipmentRepository,
  ) {}

  async execute(query: GetShipmentQuery): Promise<any> {
    const shipment = await this.shipmentRepository.findById(query.id);
    if (!shipment) {
      throw new NotFoundException('Kargo bulunamadı.');
    }
    return shipment; // Burada normalde bir Response Mapper kullanılmalı
  }
}
