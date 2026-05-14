import { Entity } from '@barterborsa/shared-core';
export interface UserAddressProps {
    userId: string;
    title: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    neighborhood?: string;
    postalCode?: string;
    isDefault: boolean;
}
export declare class UserAddress extends Entity<UserAddressProps> {
    private constructor();
    static create(props: Omit<UserAddressProps, 'isDefault'> & {
        isDefault?: boolean;
    }, id?: string): UserAddress;
    update(props: Partial<UserAddressProps>): void;
    setAsDefault(): void;
    removeDefault(): void;
    getFullAddress(): string;
    get userId(): string;
    get title(): string;
    get firstName(): string;
    get lastName(): string;
    get phone(): string;
    get addressLine1(): string;
    get addressLine2(): string | undefined;
    get city(): string;
    get district(): string;
    get neighborhood(): string | undefined;
    get postalCode(): string | undefined;
    get isDefault(): boolean;
}
