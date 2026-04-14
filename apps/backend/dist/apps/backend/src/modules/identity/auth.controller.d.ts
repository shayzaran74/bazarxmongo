import { RegisterUserInput, LoginUserInput } from '@barterborsa/shared-types';
import { RegisterUserUseCase, LoginUserUseCase } from '@barterborsa/domain-identity';
export declare class AuthController {
    private readonly registerUseCase;
    private readonly loginUseCase;
    constructor(registerUseCase: RegisterUserUseCase, loginUseCase: LoginUserUseCase);
    register(input: RegisterUserInput): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            role: string;
            firstName: string | undefined;
            lastName: string | undefined;
        };
    }>;
    login(input: LoginUserInput): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            role: string;
            firstName: string | undefined;
            lastName: string | undefined;
        };
    }>;
}
