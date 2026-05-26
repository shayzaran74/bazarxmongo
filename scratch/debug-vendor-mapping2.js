const mongoose = require('mongoose');

const uri = "mongodb://barterborsa:barterborsa123@127.0.0.1:27017/bazarxmongo?authSource=admin&directConnection=true";

async function run() {
  await mongoose.connect(uri);
  
  // The campaign vendorId = "76380bed-8fcb-4419-a933-de859d32090a" (user UUID)
  // vendors entry: _id="fbe52522-3fe7-45ee-9b8c-39bcc16da857", userId="76380bed..."
  const vendorUserId = "76380bed-8fcb-4419-a933-de859d32090a";
  
  // Step 1: Find the vendor doc
  const vendor = await mongoose.connection.db.collection('vendors')
    .findOne({ userId: vendorUserId });
  console.log('=== Vendor doc ===');
  console.log(JSON.stringify(vendor, null, 2));

  if (vendor) {
    const vendorDocId = String(vendor._id);
    const vendorIdField = vendor.id;
    console.log(`\nvendor._id = ${vendorDocId}`);
    console.log(`vendor.id = ${vendorIdField}`);

    // Step 2: Try to find profile by vendor._id
    const profileById = await mongoose.connection.db.collection('vendor_profiles')
      .findOne({ vendorId: vendorDocId });
    console.log('\n=== Profile by vendor._id ===');
    console.log(JSON.stringify(profileById, null, 2));

    // Step 3: Try to find profile by vendor.id
    const profileByField = await mongoose.connection.db.collection('vendor_profiles')
      .findOne({ vendorId: vendorIdField });
    console.log('\n=== Profile by vendor.id ===');
    console.log(JSON.stringify(profileByField, null, 2));

    // Step 4: List all profiles to see structure
    const allProfiles = await mongoose.connection.db.collection('vendor_profiles').find({}).toArray();
    console.log('\n=== ALL vendor_profiles (full docs) ===');
    for (const p of allProfiles) {
      console.log(JSON.stringify(p, null, 2));
    }
  }

  await mongoose.disconnect();
}

run();
