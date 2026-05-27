// apps/backend/src/modules/catalog/application/queries/list-catalog-listings/list-catalog-listings.query.ts

export class ListCatalogListingsQuery {
  constructor(
    public readonly userId?: string,
    public readonly userRole?: string,
    public readonly filters: {
      search?: string;
      page?: number;
      limit?: number;
      vendorType?: string;
      vendorId?: string;   // belirli bir vendor'ın ürünlerini getir (public restoran sayfası)
      scope?: string;
      // Konum filtresi — vendor profil şehrinden eşleştirilir
      city?: string;
      // Kategori filtresi — CatalogProduct.categoryId üzerinden
      categoryId?: string;
      // Ürün tipi filtreleri
      isFeatured?: boolean;
      isFlashSale?: boolean;
      isSpecialOffer?: boolean;
      isActive?: boolean;
    } = {}
  ) {}
}
