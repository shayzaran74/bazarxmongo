export declare class UpdateProfileDto {
    birthday?: string;
    firstName?: string;
    lastName?: string;
    /**
     * Frontend `phoneNumber` olarak gönderir – backend DTO'da aynı isimde tutuyoruz.
     */
    phoneNumber?: string;
    avatar?: string;
    avatarUrl?: string;
    bio?: string;
    gender?: string;
    city?: string;
    cityId?: number;
    district?: string;
    districtId?: number;
    neighborhood?: string;
    companyName?: string;
    taxNumber?: string;
    taxOffice?: string;
}
