const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:examplepassword@localhost:27018/school-management?authSource=admin';

async function run() {
  const isRollback = process.argv.includes('--rollback');
  console.log(`Starting migration... Mode: ${isRollback ? 'ROLLBACK' : 'MIGRATION'}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const usersCollection = mongoose.connection.db.collection('users');

    if (isRollback) {
      // Rollback: remove 'roles' field from all users
      const result = await usersCollection.updateMany(
        { roles: { $exists: true } },
        { $unset: { roles: '' } }
      );
      console.log(`Rollback completed successfully. Modified ${result.modifiedCount} user documents.`);
    } else {
      // Migration: find users with 'role' but without 'roles' or empty 'roles'
      const cursor = usersCollection.find({
        role: { $exists: true, $ne: null },
        $or: [
          { roles: { $exists: false } },
          { roles: { $size: 0 } }
        ]
      });

      const usersToMigrate = await cursor.toArray();
      console.log(`Found ${usersToMigrate.length} users to migrate.`);

      let successCount = 0;
      for (const user of usersToMigrate) {
        const result = await usersCollection.updateOne(
          { _id: user._id },
          { $set: { roles: [user.role] } }
        );
        if (result.modifiedCount > 0) {
          successCount++;
        }
      }

      console.log(`Migration completed successfully. Migrated ${successCount} user documents.`);
    }
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();
