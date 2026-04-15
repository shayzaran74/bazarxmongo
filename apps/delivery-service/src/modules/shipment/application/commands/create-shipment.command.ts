import { CreateShipmentDto } from '../dtos/create-shipment.dto';

export class CreateShipmentCommand {
  constructor(public readonly dto: CreateShipmentDto) {}
}
