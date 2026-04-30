export interface UpdateBrandDto {
  description?: string;
  aliases?: string[];
}

export class UpdateBrandCommand {
  constructor(
    public readonly userId: string,
    public readonly brandId: string,
    public readonly dto: UpdateBrandDto,
  ) {}
}
