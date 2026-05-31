// apps/backend/src/modules/bazarxgo/application/commands/place-order.command.ts

import { GoOrderMode } from '../../domain/enums/go-order-mode.enum';

export class PlaceGoOrderCommand {
  constructor(
    public readonly userId: string,
    public readonly restaurantId: string,
    public readonly mode: GoOrderMode,
    public readonly items: Array<{ menuItemId: string; qty: number }>,
    public readonly couponCode: string | undefined,
    public readonly addressLine: string | undefined,
  ) {}
}
