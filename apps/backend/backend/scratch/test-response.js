// apps/backend/scratch/test-response.js
const mongoose = require('mongoose');
const { Types } = mongoose;

// Stub the domain classes or use ts-node
const uri = 'mongodb://barterborsa:barterborsa123@127.0.0.1:27017/bazarxmongo?authSource=admin&directConnection=true';

async function run() {
  try {
    await mongoose.connect(uri);
    const OrderCollection = mongoose.connection.db.collection('orders');
    const orderDoc = await OrderCollection.findOne({ id: '13b7f625-b116-4852-84e7-420aa3944553' });
    
    console.log('Stored Order Doc orderNumber:', orderDoc.orderNumber, typeof orderDoc.orderNumber);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
