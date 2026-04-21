import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IInvoiceRepository }
  from '../../../commerce/domain/repositories/invoice.repository.interface';
import { GetVendorInvoicesQuery } from './get-vendor-invoices.query';

@QueryHandler(GetVendorInvoicesQuery)
export class GetVendorInvoicesHandler
  implements IQueryHandler<GetVendorInvoicesQuery> {

  constructor(
    private readonly prisma: PrismaService,
    @Inject('IInvoiceRepository')
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(query: GetVendorInvoicesQuery) {
    const { userId, filters } = query;
    const { page = 1, limit = 20 } = filters;

    const vendor = await this.prisma.vendor.findUnique({
      where: { userId }
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const { items, total } = await this.invoiceRepository.findByRecipientId(
      vendor.id,
      { page, limit }
    );

    return {
      items: items.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        status: inv.status,
        totalAmount: inv.getProps().totalAmount,
        currency: inv.getProps().currency,
        issuedAt: inv.getProps().issuedAt,
        pdfUrl: inv.pdfUrl,
        orderId: inv.getProps().orderId,
      })),
      total,
      page,
      limit
    };
  }
}
