import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IInvoiceRepository } from '../../../commerce/domain/repositories/invoice.repository.interface';
import { GetVendorInvoicesQuery } from './get-vendor-invoices.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';

@QueryHandler(GetVendorInvoicesQuery)
export class GetVendorInvoicesHandler
  implements IQueryHandler<GetVendorInvoicesQuery> {

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IInvoiceRepository')
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(query: GetVendorInvoicesQuery) {
    const { userId, filters } = query;
    const { page = 1, limit = 20 } = filters;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    const vendorId = vendor.id;

    const { items, total } = await this.invoiceRepository.findByRecipientId(
      vendorId,
      { page, limit }
    );

    return {
      items: items.map((inv) => {
        const props = inv.getProps();
        return {
          id: inv.id,
          invoiceNumber: props.invoiceNumber.value,
          status: props.status,
          totalAmount: props.totalAmount,
          currency: props.currency,
          issuedAt: props.issuedAt,
          pdfUrl: props.pdfUrl,
          orderId: props.orderId,
        };
      }),
      total,
      page,
      limit
    };
  }
}
