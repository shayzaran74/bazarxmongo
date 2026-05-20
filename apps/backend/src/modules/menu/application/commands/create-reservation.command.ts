// apps/backend/src/modules/menu/application/commands/create-reservation.command.ts
export class CreateReservationCommand {
  constructor(
    public readonly userId:     string,
    public readonly purchaseId: string,
    public readonly vendorId:   string,
    public readonly date:       Date,
    public readonly timeSlot:   string,   // "19:00-20:00"
    public readonly partySize:  number,
    public readonly note?:      string,
  ) {}
}
