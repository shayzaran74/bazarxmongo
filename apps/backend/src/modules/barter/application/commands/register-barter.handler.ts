// apps/backend/src/modules/barter/application/commands/register-barter.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterBarterCommand } from './register-barter.command';
import { BadRequestException } from '@nestjs/common';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';

@CommandHandler(RegisterBarterCommand)
export class RegisterBarterHandler implements ICommandHandler<RegisterBarterCommand> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
  ) {}

  async execute(command: RegisterBarterCommand) {
    const vendor = await this.vendorRepository.findByUserId(command.userId);

    if (!vendor) {
      throw new BadRequestException('Önce satıcı kaydı yapılmalıdır');
    }
    const props = vendor.getProps();
    if (props.status !== 'APPROVED') {
      throw new BadRequestException('Barter sistemine katılmak için satıcı hesabı onaylı olmalıdır');
    }

    // Vendor tier'ı güncelle — barter erişimi aç
    await this.vendorRepository.update(vendor.id, { barterEnabled: true });

    return {
      success: true,
      message: 'Barter sistemine başarıyla kayıt oldunuz',
      data: { vendorId: vendor.id },
    };
  }
}