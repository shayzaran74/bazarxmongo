export class UpdateShipmentStatusCommand {
  constructor(
    public readonly shipmentId: string,
    public readonly status: string,
    public readonly trackingNumber?: string,
    public readonly carrierCode?: string,
    public readonly notes?: string,
  ) {}
}
