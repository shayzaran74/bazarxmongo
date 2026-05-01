import { join } from 'path';
import { existsSync } from 'fs';

export default () => {
  const devPath = join(process.cwd(), 'src/grpc/delivery.proto');
  const distPath = join(__dirname, '../grpc/delivery.proto');
  const fallbackPath = join(__dirname, '../../src/grpc/delivery.proto');

  let protoPath = distPath;
  if (existsSync(devPath)) protoPath = devPath;
  else if (existsSync(fallbackPath)) protoPath = fallbackPath;

  return {
    grpcPort: parseInt(process.env.DELIVERY_GRPC_PORT || '50052', 10),
    protoPath,
    package: 'barterborsa.delivery',
  };
};
