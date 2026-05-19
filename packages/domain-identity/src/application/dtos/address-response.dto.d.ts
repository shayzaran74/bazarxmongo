import { UserAddress } from '../../domain/entities/user-address.entity';
export declare class AddressResponseDto {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    district: string;
    fullAddress: string;
    isDefault: boolean;
    static fromEntity(address: UserAddress): AddressResponseDto;
}
