export interface CreateBannerDto {
  imageUrl: string;
  linkUrl?: string;
  type?: number;
  template?: string;
  order?: number;
  targetCities?: string[];
  targetDistricts?: string[];
}

export class CreateBannerCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateBannerDto,
  ) {}
}
