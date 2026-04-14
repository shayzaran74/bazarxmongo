import { RegisterUserInput, LoginUserInput } from '@barterborsa/shared-types';
import { RegisterUserUseCase } from '@barterborsa/domain-identity';
import { AuthService } from './infrastructure/auth/auth.service';
export declare class AuthController {
    private readonly registerUseCase;
    private readonly authService;
    constructor(registerUseCase: RegisterUserUseCase, authService: AuthService);
    /**
     * Yeni kullanıcı kaydı.
     */
    register(input: RegisterUserInput): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            role: "USER" | "VENDOR" | "ADMIN" | "SUPER_ADMIN";
        };
    }>;
    /**
     * Standart giriş (E-posta + Şifre).
     * Başarılı ise Access ve Refresh token döner.
     */
    login(input: LoginUserInput): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: string;
                email: string;
                role: "USER" | "VENDOR" | "ADMIN" | "SUPER_ADMIN";
                firstName: string | undefined;
                lastName: string | undefined;
            };
        };
    }>;
    /**
     * Çıkış işlemi (Blacklist kontrolü vb. burada tetiklenebilir).
     */
    logout(): Promise<{
        success: boolean;
        message: string;
    }>;
}
