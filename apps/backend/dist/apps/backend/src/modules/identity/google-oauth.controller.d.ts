import { AuthService } from './infrastructure/auth/auth.service';
export declare class GoogleOAuthController {
    private readonly authService;
    constructor(authService: AuthService);
    googleAuth(): Promise<void>;
    googleAuthRedirect(req: any, res: any): Promise<any>;
}
