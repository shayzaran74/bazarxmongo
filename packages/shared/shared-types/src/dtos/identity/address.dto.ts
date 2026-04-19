export interface Address {
  id: string;
  userId: string;
  title: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}
