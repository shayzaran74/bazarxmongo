import { Entity } from '@barterborsa/shared-core';
export interface UserProfileProps {
    userId: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    birthday?: Date;
    gender?: string;
    city?: string;
    district?: string;
}
export declare class UserProfile extends Entity<UserProfileProps> {
    private constructor();
    static create(props: UserProfileProps, id?: string): UserProfile;
    update(props: Partial<UserProfileProps>): void;
    getFullName(): string;
    get userId(): string;
    get firstName(): string | undefined;
    get lastName(): string | undefined;
    get avatar(): string | undefined;
    get bio(): string | undefined;
    get birthday(): Date | undefined;
    get gender(): string | undefined;
    get city(): string | undefined;
    get district(): string | undefined;
}
