export class GetVendorAnalyticsQuery {
  constructor(
    public readonly userId: string,
    public readonly period: string,
  ) {}
}
