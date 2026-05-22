import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const deliveryGrpcClientOptions: ClientsModuleOptions = [
  {
    name: 'DELIVERY_PACKAGE',
    transport: Transport.GRPC,
    options: {
      package: 'barterborsa.delivery',
      protoPath: join(__dirname, './delivery.proto'),
      url: process.env.DELIVERY_GRPC_URL || 'localhost:50052',
    },
  },
];
