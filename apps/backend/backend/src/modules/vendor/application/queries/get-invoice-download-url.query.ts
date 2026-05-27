export class GetInvoiceDownloadUrlQuery {
  constructor(
    public readonly invoiceId: string,
    public readonly userId: string
  ) {}
}
