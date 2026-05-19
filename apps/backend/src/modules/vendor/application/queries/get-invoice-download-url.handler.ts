import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { IInvoiceRepository } from '../../../commerce/domain/repositories/invoice.repository.interface';
import { GetInvoiceDownloadUrlQuery } from './get-invoice-download-url.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';

@QueryHandler(GetInvoiceDownloadUrlQuery)
export class GetInvoiceDownloadUrlHandler
  implements IQueryHandler<GetInvoiceDownloadUrlQuery> {

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IInvoiceRepository')
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(query: GetInvoiceDownloadUrlQuery) {
    const { invoiceId, userId } = query;

    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) throw new NotFoundException('Fatura bulunamadı');

    const props = invoice.getProps ? invoice.getProps() : invoice;

    const vendor = await this.vendorRepo.findByUserId(userId);
    const vendorId = vendor ? ((vendor.getProps() as any).id || vendor.id) : null;

    const isOwner =
      (props as any).recipientId === userId ||
      (props as any).recipientId === vendorId;

    if (!isOwner) {
      throw new ForbiddenException('Bu faturaya erişim yetkiniz yok');
    }

    const pdfUrl = (invoice as any).pdfUrl;
    if (!pdfUrl) {
      throw new NotFoundException('PDF henüz oluşturulmamış');
    }

    return {
      invoiceNumber: (invoice as any).invoiceNumber || (props as any).invoiceNumber,
      pdfUrl,
      status: (props as any).status || (invoice as any).status,
    };
  }
}
