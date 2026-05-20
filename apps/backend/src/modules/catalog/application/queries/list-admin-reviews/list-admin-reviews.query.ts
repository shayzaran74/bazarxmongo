export class ListAdminReviewsQuery {
  constructor(
    public readonly filters: {
      page?: number;
      limit?: number;
      searchProduct?: string;
      searchUser?: string;
      isApproved?: boolean;
    }
  ) {}
}
