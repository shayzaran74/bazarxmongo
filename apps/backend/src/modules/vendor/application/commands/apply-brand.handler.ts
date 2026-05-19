import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException, Inject } from '@nestjs/common';
import { ApplyBrandCommand } from './apply-brand.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoBrandRepository } from '../../infrastructure/persistence/mongo-brand.repository';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';

@CommandHandler(ApplyBrandCommand)
export class ApplyBrandHandler implements ICommandHandler<ApplyBrandCommand> {
  private readonly logger = new Logger(ApplyBrandHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly brandRepo: MongoBrandRepository,
  ) {}

  async execute(command: ApplyBrandCommand) {
    const { userId, dto, slug } = command;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    // Unique constraint kontrolü — slug zaten varsa error
    const existing = await this.brandRepo.findBySlug(slug);
    if (existing) throw new BadRequestException('Bu marka adı zaten mevcut');

    const brand = await this.brandRepo.create({
      name: dto.name,
      slug,
      description: dto.description,
      aliases: dto.aliases ?? [],
      vendorId: vendor.id,
      status: 'PENDING',
      submittedAt: new Date(),
      image: (dto as any).image,
      documentUrl: (dto as any).documentUrl,
      invoiceChainUrl: (dto as any).invoiceChainUrl,
      authorizationUrl: (dto as any).authorizationUrl,
    });

    this.logger.log('Marka başvurusu oluşturuldu', { brandId: brand.id, vendorId: vendor.id });
    return { success: true, data: brand };
  }
}
