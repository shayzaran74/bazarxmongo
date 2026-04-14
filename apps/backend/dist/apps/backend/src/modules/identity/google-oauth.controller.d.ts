import { AuthService } from './infrastructure/auth/auth.service';
export declare class GoogleOAuthController {
    private readonly authService;
    constructor(authService: AuthService);
    /**
     * Google girişini başlatır.
     */
    googleAuth(): Promise<void>;
    /**
     * Google callback endpoint'i.
     */
    googleAuthRedirect(req: any, res: any): Promise<any>;
}
