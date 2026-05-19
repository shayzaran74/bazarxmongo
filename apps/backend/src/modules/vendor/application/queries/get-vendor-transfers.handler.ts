import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { GetVendorTransfersQuery } from './get-vendor-transfers.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { ITransferRepository } from '../../../inventory/domain/repositories/transfer.repository.interface';

@QueryHandler(GetVendorTransfersQuery)
export class GetVendorTransfersHandler
  implements IQueryHandler<GetVendorTransfersQuery> {

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('ITransferRepository') private readonly transferRepo: ITransferRepository,
  ) {}

  async execute(query: GetVendorTransfersQuery) {
    const vendor = await this.vendorRepo.findByUserId(query.userId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    const vendorProps = vendor.getProps();
    const vendorId = (vendorProps as any).id || vendor.id;

    return this.transferRepo.findByVendorId(vendorId);
  }
}
