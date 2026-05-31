// apps/backend/src/modules/bazarxgo/domain/enums/go-order-status.enum.ts

export enum GoOrderStatus {
  RECEIVED   = 'received',
  PREPARING  = 'preparing',
  ON_WAY     = 'on_way',
  READY      = 'ready',
  DELIVERED  = 'delivered',
  CANCELLED  = 'cancelled',
}

// Teslimat siparişi için geçerli geçişler
export const DELIVERY_TRANSITIONS: Record<GoOrderStatus, GoOrderStatus[]> = {
  [GoOrderStatus.RECEIVED]:  [GoOrderStatus.PREPARING, GoOrderStatus.CANCELLED],
  [GoOrderStatus.PREPARING]: [GoOrderStatus.ON_WAY, GoOrderStatus.CANCELLED],
  [GoOrderStatus.ON_WAY]:    [GoOrderStatus.DELIVERED],
  [GoOrderStatus.READY]:     [],
  [GoOrderStatus.DELIVERED]: [],
  [GoOrderStatus.CANCELLED]: [],
};

// Gel-Al siparişi için geçerli geçişler
export const GELAL_TRANSITIONS: Record<GoOrderStatus, GoOrderStatus[]> = {
  [GoOrderStatus.RECEIVED]:  [GoOrderStatus.PREPARING, GoOrderStatus.CANCELLED],
  [GoOrderStatus.PREPARING]: [GoOrderStatus.READY, GoOrderStatus.CANCELLED],
  [GoOrderStatus.READY]:     [GoOrderStatus.DELIVERED],
  [GoOrderStatus.ON_WAY]:    [],
  [GoOrderStatus.DELIVERED]: [],
  [GoOrderStatus.CANCELLED]: [],
};
