const mongoose = require('mongoose');

const uri = "mongodb://barterborsa:barterborsa123@127.0.0.1:27017/bazarxmongo?authSource=admin&directConnection=true";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB!");

  try {
    // 1. Get all campaigns and their vendorIds
    const campaigns = await mongoose.connection.db.collection('ad_campaigns').find({}).toArray();
    console.log(`\n=== ${campaigns.length} Campaigns ===`);
    for (const c of campaigns) {
      console.log(`  Campaign: "${c.name}" | vendorId: "${c.vendorId}" | adType: ${c.adType}`);
    }

    // 2. Collect unique vendorIds
    const vendorIds = [...new Set(campaigns.map(c => c.vendorId).filter(Boolean))];
    console.log(`\n=== Unique vendorIds from campaigns: ${JSON.stringify(vendorIds)} ===`);

    // 3. Check vendor_profiles for these vendorIds
    const profiles = await mongoose.connection.db.collection('vendor_profiles')
      .find({ vendorId: { $in: vendorIds } })
      .toArray();
    console.log(`\n=== ${profiles.length} Matching Vendor Profiles ===`);
    for (const p of profiles) {
      console.log(`  Profile: vendorId="${p.vendorId}" | storeName="${p.storeName}" | logo="${p.logo}"`);
    }

    // 4. If no profiles found, list ALL vendor_profiles to see what vendorId format they use
    if (profiles.length === 0) {
      console.log('\n=== No matching profiles found. Listing all vendor_profiles (first 10): ===');
      const allProfiles = await mongoose.connection.db.collection('vendor_profiles')
        .find({}).limit(10).toArray();
      for (const p of allProfiles) {
        console.log(`  Profile: _id="${p._id}" | id="${p.id}" | vendorId="${p.vendorId}" | storeName="${p.storeName}"`);
      }

      // 5. Also check vendors collection
      console.log('\n=== Listing vendors collection (first 10): ===');
      const vendors = await mongoose.connection.db.collection('vendors')
        .find({}).limit(10).toArray();
      for (const v of vendors) {
        console.log(`  Vendor: _id="${v._id}" | id="${v.id}" | userId="${v.userId}" | storeName="${v.storeName || v.businessName || '(none)'}"`);
      }

      // 6. Also check companies collection
      console.log('\n=== Listing companies collection (first 10): ===');
      const companies = await mongoose.connection.db.collection('companies')
        .find({}).limit(10).toArray();
      for (const co of companies) {
        console.log(`  Company: _id="${co._id}" | id="${co.id}" | vendorId="${co.vendorId}" | businessName="${co.businessName || co.companyName || '(none)'}"`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
