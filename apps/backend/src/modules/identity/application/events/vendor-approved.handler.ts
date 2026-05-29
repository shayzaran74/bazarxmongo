import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { VendorApprovedEvent } from '../../../vendor/domain/events/vendor-approved.event';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@EventsHandler(VendorApprovedEvent)
export class IdentityVendorApprovedHandler implements IEventHandler<VendorApprovedEvent> {
  private readonly logger = new Logger(IdentityVendorApprovedHandler.name);

  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async handle(event: VendorApprovedEvent) {
    this.logger.log(`VendorApprovedEvent yakalandı: vendorId=${event.vendorId}, userId=${event.userId}`);
    
    try {
      const user = await this.userRepo.findById(event.userId);
      if (user && user.role !== 'VENDOR') {
        await this.userRepo.updateRole(event.userId, 'VENDOR');
        this.logger.log(`Kullanıcı rolü VENDOR olarak güncellendi: ${event.userId}`);
      }
    } catch (err: any) {
      this.logger.error(`Kullanıcı rolü güncellenirken hata oluştu: ${err.message}`, err.stack);
    }
  }
}
