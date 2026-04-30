export class GetLaunchPartnersQuery {
  constructor(
    public readonly filters: {
      phase?:  string;
      city?:   string;
      page?:   number;
      limit?:  number;
    } = {},
  ) {}
}
