const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://barterborsa:barterborsa123@127.0.0.1:27017/bazarxmongo?authSource=admin&directConnection=true';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const orders = await db.collection('orders').find({}).limit(5).toArray();
  console.log('\n--- ORDERS FROM DB ---');
  console.log(JSON.stringify(orders, null, 2));

  await mongoose.disconnect();
}

main().catch(console.error);
