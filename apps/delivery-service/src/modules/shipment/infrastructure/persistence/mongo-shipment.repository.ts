import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '@barterborsa/shared-persistence';
import { Shipment } from '../../domain/entities/shipment.entity';
import { ShipmentDocument } from './schemas/shipment.schema';
import { ShipmentMapper } from './mappers/shipment.mapper';
import { IShipmentRepository } from '../../domain/repositories/shipment.repository.interface';

@Injectable()
export class MongoShipmentRepository 
  extends BaseMongoRepository<Shipment, ShipmentDocument>
  implements IShipmentRepository 
{
  constructor(
    @InjectModel(ShipmentDocument.name) 
    protected readonly shipmentModel: Model<ShipmentDocument>
  ) {
    super(shipmentModel, {
      toDomain: ShipmentMapper.toDomain,
      toPersistence: ShipmentMapper.toPersistence,
    });
  }

  async findByShipmentNumber(shipmentNumber: string): Promise<Shipment | null> {
    const doc = await this.shipmentModel.findOne({ shipmentNumber }).exec();
    return doc ? ShipmentMapper.toDomain(doc) : null;
  }

  async findByOrderId(orderId: string): Promise<Shipment[]> {
    const docs = await this.shipmentModel.find({ orderId }).exec();
    return docs.map(doc => ShipmentMapper.toDomain(doc));
  }

  async findByBarterSessionId(sessionId: string): Promise<Shipment[]> {
    const docs = await this.shipmentModel.find({ barterSessionId: sessionId }).exec();
    return docs.map(doc => ShipmentMapper.toDomain(doc));
  }
}
