const mongoose = require('mongoose');

const uri = "mongodb://barterborsa:barterborsa123@127.0.0.1:27017/bazarxmongo?authSource=admin&directConnection=true";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB!");

  try {
    const campaigns = await mongoose.connection.db.collection('ad_campaigns').find({}).toArray();
    console.log(`Found ${campaigns.length} campaigns:`);
    for (const c of campaigns) {
      console.log(JSON.stringify({
        id: c._id || c.id,
        name: c.name,
        adType: c.adType,
        adStatus: c.adStatus,
        budget: c.budget,
        vendorId: c.vendorId,
        targetKeywords: c.targetKeywords
      }, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
