import { Command } from '@barterborsa/shared-core';
export declare class SetTransactionPinCommand extends Command {
    readonly userId: string;
    readonly pin: string;
    constructor(userId: string, pin: string);
}
