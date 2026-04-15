import { CommandBus } from '@nestjs/cqrs';
import { IUserRepository, UserResponseDto } from '@barterborsa/domain-identity';
import { LoginUserInput } from '@barterborsa/shared-types';
import { TokenService } from './token.service';
import { PrismaService } from '@barterborsa/shared-persistence';
export declare class AuthService {
    private readonly commandBus;
    private readonly tokenService;
    private readonly prisma;
    private readonly userRepository;
    private readonly logger;
    constructor(commandBus: CommandBus, tokenService: TokenService, prisma: PrismaService, userRepository: IUserRepository);
    /**
     * E-posta ve şifre ile giriş işlemi.
     */
    login(input: LoginUserInput): Promise<{
        accessToken: string;
        refreshToken: string;
        user: UserResponseDto;
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
        user: UserResponseDto;
    }>;
    /**
     * Refresh token ile yeni access token üretir.
     */
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    /**
     * Çıkış işlemi: Session silinir ve token blacklist'e eklenir.
     */
    logout(userId: string, refreshToken?: string): Promise<void>;
    private createSession;
    private generateUserTokens;
}
