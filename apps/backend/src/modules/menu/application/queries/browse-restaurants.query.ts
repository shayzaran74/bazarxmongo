export class BrowseRestaurantsQuery {
  constructor(
    public readonly filters: {
      city?:     string;
      district?: string;
      category?: string;
      search?:   string;
      page?:     number;
      limit?:    number;
    },
  ) {}
}
