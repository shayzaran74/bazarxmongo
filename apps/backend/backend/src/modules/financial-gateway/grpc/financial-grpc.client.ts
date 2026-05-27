// apps/backend/src/modules/financial-gateway/grpc/financial-grpc.client.ts

import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const financialGrpcClientOptions: ClientsModuleOptions = [
  {
    name: 'FINANCIAL_PACKAGE',
    transport: Transport.GRPC,
    options: {
      package: 'financial',
      protoPath: join(__dirname, './financial.proto'),
      url: process.env.FINANCIAL_GRPC_URL || 'localhost:50051',
    },
  },
];
