const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://barterborsa:barterborsa123@127.0.0.1:27017/bazarxmongo?authSource=admin&directConnection=true';

const UserSchema = new mongoose.Schema({
  _id: { type: String },
  id: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'users'
});

const User = mongoose.model('User', UserSchema);

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const adminId = 'admin-user-123';
  const email = 'admin@bazarx.com';
  const passwordHash = '$2b$10$cr//Hg.V7FVyiWFFiKWAZOzwOdsgs7eCraevg4sSx2LvMpy9oD0SK'; // admin123

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
  } else {
    await User.create({
      _id: adminId,
      id: adminId,
      email,
      password: passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true
    });
    console.log('Admin user successfully seeded!');
  }

  await mongoose.disconnect();
}

main().catch(console.error);
