// apps/backend/src/modules/commerce/application/queries/list-admin-orders.query.ts
export interface ListAdminOrdersFilters {
  status?: string;
  vendorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class ListAdminOrdersQuery {
  constructor(public readonly filters: ListAdminOrdersFilters) {}
}
