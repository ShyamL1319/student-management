import 'reflect-metadata';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

config({ path: '../../.env' });
config();

const requiredEnv = ['MONGODB_URI', 'SEED_ADMIN_NAME', 'SEED_ADMIN_EMAIL', 'SEED_ADMIN_PASSWORD'];

async function seedAdmin() {
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      throw new Error(`${key} is required to seed the admin user`);
    }
  }

  await mongoose.connect(process.env.MONGODB_URI as string);

  const users = mongoose.connection.collection('users');
  const email = (process.env.SEED_ADMIN_EMAIL as string).toLowerCase();
  const existingUser = await users.findOne({ email });

  if (existingUser) {
    console.log(`Admin user already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD as string, 12);
  await users.insertOne({
    name: process.env.SEED_ADMIN_NAME,
    email,
    passwordHash,
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`Seeded admin user: ${email}`);
  await mongoose.disconnect();
}

seedAdmin().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
