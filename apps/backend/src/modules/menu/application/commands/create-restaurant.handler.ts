import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CreateRestaurantCommand } from './create-restaurant.command';
import { randomBytes } from 'crypto';

function slugify(name: string): string {
  return name.toLowerCase()
    .replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u').replace(/[ş]/g, 's')
    .replace(/[ı]/g, 'i').replace(/[ö]/g, 'o').replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    + '-' + randomBytes(3).toString('hex');
}

@CommandHandler(CreateRestaurantCommand)
export class CreateRestaurantHandler implements ICommandHandler<CreateRestaurantCommand> {
  private readonly logger = new Logger(CreateRestaurantHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateRestaurantCommand) {
    const { dto } = command;

    const restaurant = await this.prisma.restaurant.create({
      data: {
        name:             dto.name,
        slug:             slugify(dto.name),
        city:             dto.city,
        district:         dto.district,
        address:          dto.address,
        category:         dto.category,
        imageUrl:         dto.imageUrl,
        averageMenuPrice: dto.averageMenuPrice,
        vendorId:         dto.vendorId,
        isActive:         true,
      },
    });

    this.logger.log('Restoran oluşturuldu', { restaurantId: restaurant.id, name: dto.name });
    return { success: true, data: restaurant };
  }
}
