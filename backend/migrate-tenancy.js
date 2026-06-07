// backend/migrate-tenancy.js
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management';

async function migrate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected successfully.');

  const db = mongoose.connection.db;

  // 1. Define models for migrations
  const tenantSchema = new mongoose.Schema({
    name: String,
    subdomain: String,
    isActive: { type: Boolean, default: true }
  });
  const Tenant = mongoose.model('Tenant', tenantSchema);

  const schoolSchema = new mongoose.Schema({
    tenantId: mongoose.Schema.Types.ObjectId,
    name: String,
    address: String,
    phone: String,
    email: String,
    isActive: { type: Boolean, default: true }
  });
  const School = mongoose.model('School', schoolSchema);

  // 2. Ensure we have at least one Tenant and School
  let defaultSchool = await School.findOne();
  let defaultTenant;

  if (!defaultSchool) {
    console.log('No existing School found. Creating a default tenant and school...');
    defaultTenant = await Tenant.create({
      name: 'PSEI Tenant',
      subdomain: 'psei',
      isActive: true
    });
    console.log('Created Default Tenant:', defaultTenant.name);

    defaultSchool = await School.create({
      tenantId: defaultTenant._id,
      name: 'PSEI High School',
      address: 'PSEI, Sikar',
      phone: '555-0113',
      email: 'psei@school.com',
      isActive: true
    });
    console.log('Created Default School:', defaultSchool.name);
  } else {
    console.log('Existing School found:', defaultSchool.name);
    // Find or create tenant for this school
    if (!defaultSchool.tenantId) {
      defaultTenant = await Tenant.findOne({ subdomain: 'psei' });
      if (!defaultTenant) {
        defaultTenant = await Tenant.create({
          name: 'PSEI Tenant',
          subdomain: 'psei',
          isActive: true
        });
        console.log('Created Tenant for existing school:', defaultTenant.name);
      }
      defaultSchool.tenantId = defaultTenant._id;
      await defaultSchool.save();
      console.log('Linked School to Tenant:', defaultTenant._id);
    } else {
      defaultTenant = await Tenant.findById(defaultSchool.tenantId);
      console.log('School already linked to Tenant:', defaultTenant.name);
    }
  }

  const defaultSchoolId = defaultSchool._id;

  // 3. Define collections that should NOT be isolated by tenant (global/system collections)
  const globalCollections = [
    'tenants',
    'schools',
    'roles',
    'permissions',
    'counters',
    'auditlogs',
    'systemsettings'
  ];

  // 4. Retrieve all collections and migrate
  const collections = await db.listCollections().toArray();
  for (const collectionInfo of collections) {
    const colName = collectionInfo.name;

    if (globalCollections.includes(colName) || colName.startsWith('system.') || colName.startsWith('backup_')) {
      console.log(`Skipping global/system collection: ${colName}`);
      continue;
    }

    console.log(`Migrating collection: ${colName}...`);
    const col = db.collection(colName);

    // Update all documents missing schoolId to point to defaultSchoolId
    const updateResult = await col.updateMany(
      { schoolId: { $exists: false } },
      { $set: { schoolId: defaultSchoolId } }
    );
    console.log(`- Updated ${updateResult.modifiedCount} documents in ${colName}`);

    // Create index on schoolId
    console.log(`- Creating index on schoolId for ${colName}...`);
    await col.createIndex({ schoolId: 1 });
  }

  // 5. Build unique and index criteria on Tenant and School
  console.log('Ensuring indexes on tenants and schools...');
  await db.collection('tenants').createIndex({ subdomain: 1 }, { unique: true });
  await db.collection('schools').createIndex({ tenantId: 1 });

  console.log('Tenancy migration completed successfully.');
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
