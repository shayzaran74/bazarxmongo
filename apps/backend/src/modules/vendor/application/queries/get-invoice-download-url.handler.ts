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

    const props = invoice.getProps ? invoice.getProps() as unknown as Record<string, unknown> : invoice as unknown as Record<string, unknown>;

    const vendor = await this.vendorRepo.findByUserId(userId);
    const vendorId = vendor?.id ?? null;

    const isOwner =
      (props.recipientId as string) === userId ||
      (props.recipientId as string) === vendorId;

    if (!isOwner) {
      throw new ForbiddenException('Bu faturaya erişim yetkiniz yok');
    }

    const pdfUrl = (invoice as { pdfUrl?: string }).pdfUrl;
    if (!pdfUrl) {
      throw new NotFoundException('PDF henüz oluşturulmamış');
    }

    return {
      invoiceNumber: (invoice as { invoiceNumber?: string }).invoiceNumber || (props.invoiceNumber as string),
      pdfUrl,
      status: (props.status as string) || (invoice as { status?: string }).status,
    };
  }
}
