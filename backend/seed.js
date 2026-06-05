// @ts-nocheck
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:examplepassword@mongodb:27017/school-management?authSource=admin';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const roleSchema = new mongoose.Schema({
    name: String,
    description: String,
    permissions: Array
  });
  const Role = mongoose.model('Role', roleSchema);

  const userSchema = new mongoose.Schema({
    email: String,
    passwordHash: String,
    firstName: String,
    lastName: String,
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  });
  const User = mongoose.model('User', userSchema);

  // Clear existing to avoid duplicates during test
  await Role.deleteMany({});
  await User.deleteMany({});

  // Create Role
  const superAdminRole = await Role.create({
    name: 'SUPER_ADMIN',
    description: 'Super Administrator with all permissions'
  });
  console.log('Created Role:', superAdminRole.name);

  // Create User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const adminUser = await User.create({
    email: 'admin@school.com',
    passwordHash: passwordHash,
    firstName: 'Super',
    lastName: 'Admin',
    role: superAdminRole._id
  });
  console.log('Created User:', adminUser.email);

  await mongoose.disconnect();
  console.log('Disconnected');
}

seed().catch(console.error);
