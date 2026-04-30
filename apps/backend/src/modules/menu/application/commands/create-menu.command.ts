export interface CreateMenuDto {
  restaurantId:  string;
  title:         string;
  description?:  string;
  originalPrice: number;
  imageUrl?:     string;
  validDays?:    number;  // QR geçerlilik gün sayısı (default: 30)
  dailyLimit?:   number;
}

export class CreateMenuCommand {
  constructor(
    public readonly dto:     CreateMenuDto,
    public readonly adminId: string,
  ) {}
}
