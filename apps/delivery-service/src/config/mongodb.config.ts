export default () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/barterborsa_delivery',
});
