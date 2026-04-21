import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IInvoiceRepository }
  from '../../../commerce/domain/repositories/invoice.repository.interface';
import { GetInvoiceDownloadUrlQuery }
  from './get-invoice-download-url.query';

@QueryHandler(GetInvoiceDownloadUrlQuery)
export class GetInvoiceDownloadUrlHandler
  implements IQueryHandler<GetInvoiceDownloadUrlQuery> {

  constructor(
    private readonly prisma: PrismaService,
    @Inject('IInvoiceRepository')
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(query: GetInvoiceDownloadUrlQuery) {
    const { invoiceId, userId } = query;

    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) throw new NotFoundException('Fatura bulunamadı');

    const props = invoice.getProps();

    // Yetki kontrolü: sadece kendi faturasını indirebilir
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId }
    });
    
    const isOwner =
      props.recipientId === userId ||          // buyer
      props.recipientId === vendor?.id;         // vendor

    if (!isOwner) {
      throw new ForbiddenException('Bu faturaya erişim yetkiniz yok');
    }

    if (!invoice.pdfUrl) {
      throw new NotFoundException('PDF henüz oluşturulmamış');
    }

    return {
      invoiceNumber: invoice.invoiceNumber,
      pdfUrl: invoice.pdfUrl,
      status: invoice.status,
    };
  }
}
