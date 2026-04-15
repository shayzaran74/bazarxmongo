export interface IEventBus {
    publish(topic: string, data: any): Promise<void>;
    subscribe(topic: string, handler: (data: any) => Promise<void>): Promise<void>;
}
