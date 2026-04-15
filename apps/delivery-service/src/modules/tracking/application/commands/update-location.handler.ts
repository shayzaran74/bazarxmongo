import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { UpdateLocationCommand } from './update-location.command';
import { ShipmentLocationDocument } from '../../infrastructure/persistence/schemas/shipment-location.schema';
import { TrackingGateway } from '../../infrastructure/websocket/tracking.gateway';

@CommandHandler(UpdateLocationCommand)
export class UpdateLocationHandler implements ICommandHandler<UpdateLocationCommand, void> {
  constructor(
    @InjectModel(ShipmentLocationDocument.name)
    private readonly locationModel: Model<ShipmentLocationDocument>,
    private readonly trackingGateway: TrackingGateway,
  ) {}

  async execute(command: UpdateLocationCommand): Promise<void> {
    const { shipmentId, latitude, longitude, speed, heading } = command;

    // 1. Veritabanına kaydet
    const locationEntry = new this.locationModel({
      _id: uuidv4(),
      shipmentId,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      speed,
      heading,
    });
    await locationEntry.save();

    // 2. Canlı yayın yap
    this.trackingGateway.broadcastLocationUpdate(shipmentId, {
      latitude,
      longitude,
      speed,
      heading,
    });
  }
}
