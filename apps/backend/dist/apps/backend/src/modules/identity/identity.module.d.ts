import { GoogleOAuthStrategy } from '@barterborsa/shared-security';
export declare class IdentityModule {
    private readonly googleStrategy;
    constructor(googleStrategy: GoogleOAuthStrategy);
}
