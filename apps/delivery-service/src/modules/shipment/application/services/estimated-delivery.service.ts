import { Injectable } from '@nestjs/common';

@Injectable()
export class EstimatedDeliveryService {
  public calculate(originCity: string, destinationCity: string): Date {
    const now = new Date();
    // Basit bir mantık: Aynı şehirse 1 gün, farklı ise 2-3 gün
    const daysToAdd = originCity.toLowerCase() === destinationCity.toLowerCase() ? 1 : 3;
    
    const estimated = new Date(now);
    estimated.setDate(now.getDate() + daysToAdd);
    return estimated;
  }
}
