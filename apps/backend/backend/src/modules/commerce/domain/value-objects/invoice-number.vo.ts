export class InvoiceNumber {
  private constructor(public readonly value: string) {}

  static generate(type: 'BUYER' | 'VENDOR'): InvoiceNumber {
    const prefix = type === 'BUYER' ? 'INV-B' : 'INV-V';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return new InvoiceNumber(`${prefix}-${year}${month}-${random}`);
  }

  static fromValue(value: string): InvoiceNumber {
    return new InvoiceNumber(value);
  }
}
