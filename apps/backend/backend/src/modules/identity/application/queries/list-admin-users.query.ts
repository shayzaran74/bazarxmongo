export class ListAdminUsersQuery {
  constructor(
    public readonly filters: {
      search?: string;
      status?: string;
      role?: string;
      page?: number;
      limit?: number;
    }
  ) {}
}
