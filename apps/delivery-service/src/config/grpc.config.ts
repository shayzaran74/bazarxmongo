import { join } from 'path';

export default () => ({
  port: parseInt(process.env.DELIVERY_GRPC_PORT || '50052', 10),
  protoPath: join(__dirname, '../grpc/delivery.proto'),
  package: 'barterborsa.delivery',
});
