export default () => ({
  port: parseInt(process.env.DELIVERY_PORT || '3005', 10),
  environment: process.env.NODE_ENV || 'development',
});
