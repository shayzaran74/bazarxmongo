export declare enum Platform {
    BAZARX = "BAZARX",
    BARTERBORSA = "BARTERBORSA"
}
export declare class RegisterUserInput {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    platform?: Platform;
}
