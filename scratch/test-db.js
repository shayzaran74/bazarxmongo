// scratch/test-db.js
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://barterborsa:barterborsa123@127.0.0.1:27017/bazarxmongo?authSource=admin&directConnection=true';

const UserProfileSchema = new mongoose.Schema({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, alias: 'user_id' },
  firstName: { type: String, alias: 'first_name' },
  lastName: { type: String, alias: 'last_name' },
}, {
  timestamps: true,
  collection: 'user_profiles',
});

const UserProfile = mongoose.model('UserProfile', UserProfileSchema);

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB via Mongoose');

  const profiles = await UserProfile.find({}).lean();
  console.log('\n--- LEAN PROFILES FROM MONGOOSE ---');
  profiles.forEach(p => {
    console.log(p);
  });

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
});
