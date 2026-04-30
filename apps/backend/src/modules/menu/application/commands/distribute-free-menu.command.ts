export class DistributeFreeMenuCommand {
  constructor(
    public readonly restaurantId: string,
    public readonly menuId:       string,
    public readonly userIds:      string[],  // hedef kullanıcı ID'leri
    public readonly adminId:      string,
  ) {}
}
