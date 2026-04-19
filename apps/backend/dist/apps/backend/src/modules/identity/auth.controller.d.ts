import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserDto } from '@barterborsa/domain-identity';
import { AuthService } from './infrastructure/auth/auth.service';
export declare class AuthController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly authService;
    constructor(commandBus: CommandBus, queryBus: QueryBus, authService: AuthService);
    me(req: any): Promise<any>;
    register(dto: RegisterUserDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    login(input: any): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: import("@barterborsa/domain-identity").UserResponseDto;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        success: boolean;
        data: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    logout(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    forgotPassword(dto: any): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(dto: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
