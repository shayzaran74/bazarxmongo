import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { DeleteBannerCommand } from './delete-banner.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorBannerRepository } from '../../infrastructure/persistence/mongo-vendor-banner.repository';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';

@CommandHandler(DeleteBannerCommand)
export class DeleteBannerHandler implements ICommandHandler<DeleteBannerCommand> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly bannerRepo: MongoVendorBannerRepository,
  ) {}

  async execute(command: DeleteBannerCommand) {
    const { userId, bannerId } = command;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    const existing = await this.bannerRepo.findById(bannerId);
    if (!existing || existing.vendorId !== vendor.id) throw new NotFoundException('Banner bulunamadı');

    await this.bannerRepo.delete(bannerId);
    return { success: true };
  }
}
