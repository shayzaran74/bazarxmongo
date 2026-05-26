const mongoose = require('mongoose');
async function run() {
  await mongoose.connect('mongodb://localhost:27017/bazarxmongo');
  const listings = await mongoose.connection.collection('listings').find().sort({_id:-1}).limit(1).toArray();
  console.log("LAST LISTING:", JSON.stringify(listings, null, 2));
  
  if (listings.length > 0) {
    const cpId = listings[0].catalogProductId;
    console.log("LOOKING FOR CATALOG PRODUCT:", cpId);
    const cp = await mongoose.connection.collection('catalog_products').findOne({ id: cpId });
    console.log("FOUND CP BY ID:", cp ? cp.id : "NOT FOUND");
    
    const cp2 = await mongoose.connection.collection('catalog_products').findOne({ _id: cpId });
    console.log("FOUND CP BY _id:", cp2 ? cp2._id : "NOT FOUND");
  }
  process.exit(0);
}
run();
