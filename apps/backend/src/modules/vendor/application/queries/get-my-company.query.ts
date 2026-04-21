export class GetMyCompanyQuery {
  constructor(
    public readonly userId: string,
    public readonly userRole: string
  ) {}
}
