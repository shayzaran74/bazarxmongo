export class ListAdminReviewsQuery {
  constructor(
    public readonly filters: {
      page?: number;
      limit?: number;
    }
  ) {}
}
