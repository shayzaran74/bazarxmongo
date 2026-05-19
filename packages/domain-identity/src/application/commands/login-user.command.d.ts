import { Command } from '@barterborsa/shared-core';
import { LoginUserInput } from '@barterborsa/shared-types';
export declare class LoginUserCommand extends Command {
    readonly dto: LoginUserInput;
    constructor(dto: LoginUserInput);
}
