// apps/backend/src/modules/garage-sale/application/commands/create-garage-sale.handler.ts
// Master Plan v4.3 §4.4 — Garaj Günü oluşturma.
// Sadece APEX seviyesindeki fabrika kendi ekosistemi içinde Garaj Günü açabilir.

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IGarageSale, IListing, IVendor } from '@barterborsa/shared-persistence';
import { Money } from '@barterborsa/shared-core';
import { CreateGarageSaleCommand } from './create-garage-sale.command';
import { GarageSale } from '../../domain/garage-sale.entity';
import { VendorTier } from '../../../vendor/domain/enums/vendor-tier.enum';

@CommandHandler(CreateGarageSaleCommand)
export class CreateGarageSaleHandler implements ICommandHandler<CreateGarageSaleCommand> {
  private readonly logger = new Logger(CreateGarageSaleHandler.name);

  constructor(
    @InjectModel('GarageSale') private readonly gsModel: Model<IGarageSale>,
    @InjectModel('Listing')    private readonly listingModel: Model<IListing>,
    @InjectModel('Vendor')     private readonly vendorModel: Model<IVendor>,
  ) {}

  async execute(command: CreateGarageSaleCommand): Promise<{ id: string }> {
    const { userId, dto } = command;

    const vendor = await this.vendorModel.findOne({ userId }).lean();
    if (!vendor) throw new NotFoundException('Vendor bulunamadı');

    // Master Plan §4.1 — Sadece APEX fabrika ekosistem yönetir (Garaj Günü dahil).
    if ((vendor as { tier?: string }).tier !== VendorTier.APEX) {
      throw new ForbiddenException({
        code: 'GARAGE_SALE_REQUIRES_APEX',
        message: 'Garaj Günü kampanyası açabilmek için APEX seviyesi gereklidir.',
      });
    }

    const listing = await this.listingModel.findOne({ id: dto.listingId, vendorId: vendor.id }).lean();
    if (!listing) {
      throw new NotFoundException('İlan bulunamadı veya bu fabrikaya ait değil');
    }
    if ((listing as { ecosystemId?: string }).ecosystemId !== dto.ecosystemId) {
      throw new ForbiddenException({
        code: 'LISTING_NOT_IN_ECOSYSTEM',
        message: 'İlan bu ekosisteme ait değil.',
      });
    }

    const id = new Types.ObjectId().toString();
    const garageSale = GarageSale.create({
      id,
      factoryId: vendor.id,
      ecosystemId: dto.ecosystemId,
      listingId: dto.listingId,
      normalPrice: Money.from(dto.normalPrice),
      discountRate: dto.discountRate,
      maxTotalQty: dto.maxTotalQty,
      maxQtyPerDealer: dto.maxQtyPerDealer,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
    });

    await this.gsModel.create({
      _id: id,
      id,
      factoryId: garageSale.props.factoryId,
      ecosystemId: garageSale.props.ecosystemId,
      listingId: garageSale.props.listingId,
      discountRate: Types.Decimal128.fromString(garageSale.props.discountRate.toString()),
      maxTotalQty: garageSale.props.maxTotalQty,
      soldQty: 0,
      maxQtyPerDealer: garageSale.props.maxQtyPerDealer,
      startsAt: garageSale.props.startsAt,
      endsAt: garageSale.props.endsAt,
      status: garageSale.props.status,
      normalPrice: garageSale.props.normalPrice.toDecimal128(),
      discountedPrice: garageSale.props.discountedPrice.toDecimal128(),
    });

    this.logger.log('Garaj Günü oluşturuldu', { id, factoryId: vendor.id, listingId: dto.listingId });
    return { id };
  }
}
