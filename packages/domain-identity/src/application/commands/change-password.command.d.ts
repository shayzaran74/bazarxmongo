import { Command } from '@barterborsa/shared-core';
import { ChangePasswordDto } from '../dtos/change-password.dto';
export declare class ChangePasswordCommand extends Command {
    readonly userId: string;
    readonly dto: ChangePasswordDto;
    constructor(userId: string, dto: ChangePasswordDto);
}
