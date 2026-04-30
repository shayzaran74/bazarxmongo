import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CreateMenuCommand } from './create-menu.command';
import { Decimal } from 'decimal.js';

@CommandHandler(CreateMenuCommand)
export class CreateMenuHandler implements ICommandHandler<CreateMenuCommand> {
  private readonly logger = new Logger(CreateMenuHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateMenuCommand) {
    const { dto } = command;

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
      select: { id: true, name: true },
    });
    if (!restaurant) throw new NotFoundException('Restoran bulunamadı');

    // %50 indirimli fiyat
    const discountedPrice = new Decimal(dto.originalPrice).mul(0.5).toDecimalPlaces(2);

    const menu = await this.prisma.bazarXMenu.create({
      data: {
        restaurantId:   dto.restaurantId,
        title:          dto.title,
        description:    dto.description,
        originalPrice:  dto.originalPrice,
        discountedPrice: discountedPrice.toNumber(),
        imageUrl:       dto.imageUrl,
        dailyLimit:     dto.dailyLimit,
        isActive:       true,
      },
    });

    this.logger.log('Menü oluşturuldu', { menuId: menu.id, restaurant: restaurant.name });
    return { success: true, data: menu };
  }
}
