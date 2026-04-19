export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  isOfficial?: boolean;
  productCount?: number;
  popularityScore?: number;
  topProducts?: any[];
  icon?: string;
  image?: string;
}
