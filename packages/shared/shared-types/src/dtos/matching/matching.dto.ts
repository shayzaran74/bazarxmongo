export interface WantedItem {
  id: string;
  userId: string;
  categoryId: string;
  category?: { name: string };
  description: string;
  keywords: string[];
  company?: { name: string };
  user?: { email: string; name?: string };
  createdAt: string;
  updatedAt: string;
}

export interface SurplusItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  categoryId: string;
  category?: { name: string };
  company?: { name: string };
  user?: { email: string; name?: string };
  wantedCategories: string[];
  createdAt: string;
  updatedAt: string;
}
