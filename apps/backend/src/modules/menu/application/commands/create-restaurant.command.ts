export interface CreateRestaurantDto {
  name:             string;
  city:             string;
  district?:        string;
  address?:         string;
  category?:        string;
  imageUrl?:        string;
  averageMenuPrice?: number;
  vendorId?:        string;
}

export class CreateRestaurantCommand {
  constructor(
    public readonly dto:     CreateRestaurantDto,
    public readonly adminId: string,
  ) {}
}
