// apps/backend/src/modules/content/application/dtos/content-responses.dtos.ts

export class HomeBannerResponseDto {
  id!: string;
  title!: string;
  description?: string;
  order!: number;
  buttonText?: string;
  image!: string;
  isActive!: boolean;
  link?: string;
  subtitle?: string;
  tag?: string;
  startDate?: Date;
  endDate?: Date;
}

export class QuadCardItemResponseDto {
  id!: string;
  title!: string;
  image!: string;
  link?: string;
  productId?: string;
  order!: number;
}

export class QuadCardResponseDto {
  id!: string;
  title!: string;
  order!: number;
  isActive!: boolean;
  items!: QuadCardItemResponseDto[];
}

export class HelpCategoryResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  description?: string;
  icon?: string;
  order!: number;
  parentId?: string;
  children?: HelpCategoryResponseDto[];
}

export class HelpArticleResponseDto {
  id!: string;
  title!: string;
  slug!: string;
  content!: string;
  excerpt?: string;
  status!: string;
  upvotes!: number;
  downvotes!: number;
  viewCount!: number;
  createdAt!: Date;
}

export class AnnouncementResponseDto {
  id!: string;
  title!: string;
  content!: string;
  type!: string;
  priority!: number;
  startDate!: Date;
  endDate?: Date;
  imageUrl?: string;
  linkText?: string;
  linkUrl?: string;
}

export class PolicyResponseDto {
  id!: string;
  title!: string;
  slug!: string;
  content!: string;
  type!: string;
  version!: string;
  updatedAt!: Date;
}
