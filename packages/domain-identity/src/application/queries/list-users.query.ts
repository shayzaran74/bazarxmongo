import { Query } from '@barterborsa/shared-core';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class ListUsersQuery extends Query {
  constructor(
    public readonly pagination: PaginationParams,
    public readonly filters?: {
      role?: string;
      status?: string;
      search?: string;
    }
  ) {
    super();
  }
}
