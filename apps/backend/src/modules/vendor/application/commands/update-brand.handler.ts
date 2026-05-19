import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { UpdateBrandCommand } from './update-brand.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoBrandRepository } from '../../infrastructure/persistence/mongo-brand.repository';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';

@CommandHandler(UpdateBrandCommand)
export class UpdateBrandHandler implements ICommandHandler<UpdateBrandCommand> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly brandRepo: MongoBrandRepository,
  ) {}

  async execute(command: UpdateBrandCommand) {
    const { userId, brandId, dto } = command;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    const brand = await this.brandRepo.findById(brandId);
    if (!brand || brand.vendorId !== vendor.id) throw new NotFoundException('Marka bulunamadı');

    const updateData: Partial<{ description: string; aliases: string[] }> = {};
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.aliases !== undefined) updateData.aliases = dto.aliases;

    const updated = await this.brandRepo.update(brandId, updateData);
    return { success: true, data: updated };
  }
}
