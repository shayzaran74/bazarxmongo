import { LoginUserUseCase, IUserRepository } from '@barterborsa/domain-identity';
import { LoginUserInput } from '@barterborsa/shared-types';
import { TokenService } from './token.service';
import { HashingService } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';
export declare class AuthService {
    private readonly loginUserUseCase;
    private readonly tokenService;
    private readonly hashingService;
    private readonly prisma;
    private readonly userRepository;
    constructor(loginUserUseCase: LoginUserUseCase, tokenService: TokenService, hashingService: HashingService, prisma: PrismaService, userRepository: IUserRepository);
    /**
     * E-posta ve şifre ile giriş işlemi.
     */
    login(input: LoginUserInput): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: "USER" | "VENDOR" | "ADMIN" | "SUPER_ADMIN";
            firstName: string | undefined;
            lastName: string | undefined;
        };
    }>;
    /**
     * Google OAuth ile giriş veya otomatik kayıt işlemi.
     */
    googleLogin(googleProfile: {
        email: string;
        googleId: string;
        firstName?: string;
        lastName?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: "USER" | "VENDOR" | "ADMIN" | "SUPER_ADMIN";
            firstName: string | undefined;
            lastName: string | undefined;
        };
    }>;
    /**
     * Kullanıcı için Session oluşturur (PostgreSQL).
     * Redis session mantığı TokenService/Blacklist üzerinden yürütülür.
     */
    private createSession;
    /**
     * Kullanıcı için yeni token seti üretir.
     */
    private generateUserTokens;
    /**
     * User entity'sini frontend'e dönecek güvenli bir nesneye çevirir.
     */
    private toResponseDto;
}
