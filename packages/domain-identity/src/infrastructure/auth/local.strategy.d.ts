import { Strategy } from 'passport-local';
import { CommandBus } from '@nestjs/cqrs';
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private readonly commandBus;
    constructor(commandBus: CommandBus);
    validate(email: string, password: string): Promise<any>;
}
export {};
