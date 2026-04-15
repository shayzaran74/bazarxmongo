import { Injectable } from '@nestjs/common';

@Injectable()
export class ShipmentNumberService {
  public generate(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `SHP-${date}-${random}`;
  }
}
