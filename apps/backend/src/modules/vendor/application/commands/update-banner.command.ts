export interface UpdateBannerDto {
  imageUrl?: string;
  linkUrl?: string;
  type?: number;
  template?: string;
  order?: number;
  targetCities?: string[];
  targetDistricts?: string[];
}

export class UpdateBannerCommand {
  constructor(
    public readonly userId: string,
    public readonly bannerId: string,
    public readonly dto: UpdateBannerDto,
  ) {}
}
