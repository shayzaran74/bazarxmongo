import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
export declare class RabbitMQService {
    private readonly amqpConnection;
    constructor(amqpConnection: AmqpConnection);
    publish(exchange: string, routingKey: string, payload: unknown): Promise<void>;
    publishTransactional(tx: any, aggregateId: string, aggregateType: string, eventType: string, exchange: string, routingKey: string, payload: any): Promise<void>;
}
