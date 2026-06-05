// backend/migrate.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management';

async function migrate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  const db = mongoose.connection.db;

  // 1. Ensure target roles exist and fetch their ObjectIds
  const roleSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    description: String,
    permissions: Array
  });
  const Role = mongoose.model('Role', roleSchema);

  const rolesToEnsure = [
    { name: 'SUPER_ADMIN', description: 'Super Administrator with all permissions' },
    { name: 'ADMIN', description: 'Administrator with role management permissions' },
    { name: 'TEACHER', description: 'Teacher role with attendance and marks permissions' },
    { name: 'STAFF', description: 'Staff role with department access' },
    { name: 'STUDENT', description: 'Student role with limited access to profile, attendance, and marks' }
  ];

  const roleIds = {};
  for (const r of rolesToEnsure) {
    let roleDoc = await Role.findOne({ name: r.name });
    if (!roleDoc) {
      roleDoc = await Role.create(r);
      console.log(`Created Role: ${r.name}`);
    } else {
      console.log(`Role exists: ${r.name}`);
    }
    roleIds[r.name] = roleDoc._id;
  }

  // Define User schema for writing
  // Note: we use strict: false so we can write all discriminator-specific fields directly
  const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
  const User = mongoose.model('User', userSchema);

  // Generate default password hash
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('ChangeMe123!', salt);

  // Helper to split full name into first and last name
  function splitName(fullName) {
    if (!fullName) return { firstName: 'N/A', lastName: 'N/A' };
    const cleanName = fullName.trim();
    const parts = cleanName.split(/\s+/);
    const firstName = parts[0] || 'N/A';
    const lastName = parts.slice(1).join(' ') || 'N/A';
    return { firstName, lastName };
  }

  // 2. Migrate Teachers
  const teacherCol = db.collection('teachers');
  const teachersCount = await teacherCol.countDocuments();
  console.log(`Found ${teachersCount} teachers to migrate.`);
  if (teachersCount > 0) {
    const teachersList = await teacherCol.find().toArray();
    for (const t of teachersList) {
      // Check if user already exists with this ID or email
      const existingUser = await User.findOne({ $or: [{ _id: t._id }, { email: t.email.toLowerCase() }] });
      if (!existingUser) {
        const { firstName, lastName } = splitName(t.name);
        await User.create({
          _id: t._id,
          email: t.email.toLowerCase(),
          passwordHash: defaultPasswordHash,
          firstName,
          lastName,
          phone: t.phone || '',
          role: roleIds['TEACHER'],
          roleType: 'TEACHER',
          isActive: t.isActive !== false,
          subjects: t.subjects || [],
          classes: t.classes || [],
          profile: t.profile || '',
          createdAt: t.createdAt || new Date(),
          updatedAt: t.updatedAt || new Date()
        });
        console.log(`Migrated teacher user: ${t.email}`);
      } else {
        console.log(`User already exists for teacher: ${t.email}, skipping.`);
      }
    }
  }

  // 3. Migrate Staff
  const staffCol = db.collection('staffs');
  const staffCount = await staffCol.countDocuments();
  console.log(`Found ${staffCount} staff to migrate.`);
  if (staffCount > 0) {
    const staffList = await staffCol.find().toArray();
    for (const s of staffList) {
      const existingUser = await User.findOne({ $or: [{ _id: s._id }, { email: s.email.toLowerCase() }] });
      if (!existingUser) {
        const { firstName, lastName } = splitName(s.name);
        await User.create({
          _id: s._id,
          email: s.email.toLowerCase(),
          passwordHash: defaultPasswordHash,
          firstName,
          lastName,
          phone: s.phone || '',
          role: roleIds['STAFF'],
          roleType: 'STAFF',
          isActive: s.isActive !== false,
          department: s.department || null,
          createdAt: s.createdAt || new Date(),
          updatedAt: s.updatedAt || new Date()
        });
        console.log(`Migrated staff user: ${s.email}`);
      } else {
        console.log(`User already exists for staff: ${s.email}, skipping.`);
      }
    }
  }

  // 4. Migrate Students
  const studentCol = db.collection('students');
  const studentCount = await studentCol.countDocuments();
  console.log(`Found ${studentCount} students to migrate.`);

  // Load parents map
  const parentsCol = db.collection('parents');
  const parentsList = await parentsCol.find().toArray();
  const parentMap = new Map();
  for (const p of parentsList) {
    const pName = p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'N/A';
    parentMap.set(p._id.toString(), pName);
  }

  // Load active academic year
  const academicyearCol = db.collection('academicyears');
  const activeYearDoc = await academicyearCol.findOne({ isActive: true });
  const activeYearId = activeYearDoc ? activeYearDoc._id : 'default';

  // Helper functions for sequence generation
  async function getNextSeq(counterName) {
    const result = await db.collection('counters').findOneAndUpdate(
      { _id: counterName },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    const doc = result.value || result;
    return doc.seq;
  }

  async function generateAdmissionNumber() {
    const year = new Date().getFullYear();
    const seq = await getNextSeq(`admission_number:${year}`);
    const paddedSeq = String(seq).padStart(6, '0');
    return `ADM-${year}-${paddedSeq}`;
  }

  async function generateRollNumber(classId, academicYearId) {
    const classIdStr = classId ? classId.toString() : 'default';
    const yearIdStr = academicYearId ? academicYearId.toString() : 'default';
    const counterKey = `roll_number:${classIdStr}:${yearIdStr}`;
    const seq = await getNextSeq(counterKey);
    const paddedSeq = String(seq).padStart(6, '0');
    const shortClassId = classIdStr.length > 6 ? classIdStr.substring(classIdStr.length - 6) : classIdStr;
    return `ROLL-${shortClassId}-${paddedSeq}`;
  }

  if (studentCount > 0) {
    const studentsList = await studentCol.find().toArray();
    for (const st of studentsList) {
      // Find parent name
      let parentName = 'N/A';
      if (st.parent) {
        parentName = parentMap.get(st.parent.toString()) || 'N/A';
      }

      // Generate admission & roll number if missing
      const admissionNumber = st.admissionNumber || (await generateAdmissionNumber());
      const rollNumber = st.rollNumber || (await generateRollNumber(st.class, activeYearId));

      const email = st.email ? st.email.toLowerCase() : `student.${admissionNumber}@school.com`;
      const existingUser = await User.findOne({ $or: [{ _id: st._id }, { email }] });
      if (!existingUser) {
        await User.create({
          _id: st._id,
          email,
          passwordHash: defaultPasswordHash,
          firstName: st.firstName || 'N/A',
          lastName: st.lastName || 'N/A',
          phone: st.phone || '',
          role: roleIds['STUDENT'],
          roleType: 'STUDENT',
          isActive: st.isActive !== false,
          admissionNumber,
          rollNumber,
          dob: st.dob || null,
          gender: st.gender || '',
          bloodGroup: st.bloodGroup || '',
          address: st.address || '',
          parent: parentName,
          class: st.class || null,
          section: st.section || null,
          history: st.history || [],
          createdAt: st.createdAt || new Date(),
          updatedAt: st.updatedAt || new Date()
        });
        console.log(`Migrated student user: ${email}`);
      } else {
        console.log(`User already exists for student: ${email}, skipping.`);
      }
    }
  }

  // 5. Back up and clean up old collections
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  if (collectionNames.includes('teachers')) {
    console.log('Renaming teachers collection to backup_teachers...');
    await db.collection('teachers').rename('backup_teachers');
  }
  if (collectionNames.includes('staffs')) {
    console.log('Renaming staffs collection to backup_staffs...');
    await db.collection('staffs').rename('backup_staffs');
  }
  if (collectionNames.includes('students')) {
    console.log('Renaming students collection to backup_students...');
    await db.collection('students').rename('backup_students');
  }
  if (collectionNames.includes('parents')) {
    console.log('Renaming parents collection to backup_parents...');
    await db.collection('parents').rename('backup_parents');
  }

  console.log('Migration finished successfully!');
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
