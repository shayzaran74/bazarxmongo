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

    const vendorProps = vendor.getProps();
    const vendorId = (vendorProps as any).id || vendor.id;

    const { items, total } = await this.invoiceRepository.findByRecipientId(
      vendorId,
      { page, limit }
    );

    return {
      items: items.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: (inv as any).invoiceNumber || (inv.getProps && inv.getProps().invoiceNumber),
        status: (inv as any).status || (inv.getProps && inv.getProps().status),
        totalAmount: inv.getProps ? Number(inv.getProps().totalAmount ?? 0) : Number((inv as any).totalAmount ?? 0),
        currency: inv.getProps ? inv.getProps().currency : (inv as any).currency || 'TRY',
        issuedAt: inv.getProps ? inv.getProps().issuedAt : (inv as any).issuedAt,
        pdfUrl: (inv as any).pdfUrl,
        orderId: inv.getProps ? inv.getProps().orderId : (inv as any).orderId,
      })),
      total,
      page,
      limit
    };
  }
}
