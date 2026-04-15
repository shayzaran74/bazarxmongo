export class UpdateLocationCommand {
  constructor(
    public readonly shipmentId: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly speed?: number,
    public readonly heading?: number,
  ) {}
}
