import { Command } from '@barterborsa/shared-core';
export declare class DeleteAddressCommand extends Command {
    readonly userId: string;
    readonly addressId: string;
    constructor(userId: string, addressId: string);
}
