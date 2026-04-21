export class GenerateInvoiceCommand {
  constructor(
    public readonly orderId: string,
    public readonly generatePdf: boolean = true
  ) {}
}
