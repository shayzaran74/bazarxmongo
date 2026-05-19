import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { DeleteBrandCommand } from './delete-brand.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoBrandRepository } from '../../infrastructure/persistence/mongo-brand.repository';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';

@CommandHandler(DeleteBrandCommand)
export class DeleteBrandHandler implements ICommandHandler<DeleteBrandCommand> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly brandRepo: MongoBrandRepository,
  ) {}

  async execute(command: DeleteBrandCommand) {
    const { userId, brandId } = command;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    const brand = await this.brandRepo.findById(brandId);
    if (!brand || brand.vendorId !== vendor.id || brand.status !== 'PENDING') {
      throw new NotFoundException('Silinebilir başvuru bulunamadı');
    }

    await this.brandRepo.delete(brandId);
    return { success: true };
  }
}
