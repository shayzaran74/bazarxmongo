import { Command } from '@barterborsa/shared-core';
import { RegisterUserDto } from '../dtos/register-user.dto';
export declare class RegisterUserCommand extends Command {
    readonly dto: RegisterUserDto;
    constructor(dto: RegisterUserDto);
}
