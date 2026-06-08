const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management';

async function initDB() {
  console.log('Starting Database Initialization...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;

  try {
    // --- PART 1: TENANCY SETUP ---
    console.log('--- Step 1: Tenancy Setup ---');
    const tenantSchema = new mongoose.Schema({ name: String, subdomain: String, isActive: { type: Boolean, default: true } });
    const Tenant = mongoose.model('Tenant', tenantSchema);

    const schoolSchema = new mongoose.Schema({ tenantId: mongoose.Schema.Types.ObjectId, name: String, address: String, phone: String, email: String, isActive: { type: Boolean, default: true } });
    const School = mongoose.model('School', schoolSchema);

    let defaultSchool = await School.findOne();
    let defaultTenant;

    if (!defaultSchool) {
      console.log('No existing School found. Creating a default tenant and school...');
      defaultTenant = await Tenant.create({ name: 'PSEI Tenant', subdomain: 'psei', isActive: true });
      defaultSchool = await School.create({ tenantId: defaultTenant._id, name: 'PSEI High School', address: 'PSEI, Sikar', phone: '555-0113', email: 'psei@school.com', isActive: true });
    } else {
      if (!defaultSchool.tenantId) {
        defaultTenant = await Tenant.findOne({ subdomain: 'psei' });
        if (!defaultTenant) {
          defaultTenant = await Tenant.create({ name: 'PSEI Tenant', subdomain: 'psei', isActive: true });
        }
        defaultSchool.tenantId = defaultTenant._id;
        await defaultSchool.save();
      }
    }
    const defaultSchoolId = defaultSchool._id;

    const globalCollections = ['tenants', 'schools', 'roles', 'permissions', 'counters', 'auditlogs', 'systemsettings'];
    const collections = await db.listCollections().toArray();
    for (const collectionInfo of collections) {
      const colName = collectionInfo.name;
      if (globalCollections.includes(colName) || colName.startsWith('system.') || colName.startsWith('backup_')) continue;
      
      const col = db.collection(colName);
      await col.updateMany({ schoolId: { $exists: false } }, { $set: { schoolId: defaultSchoolId } });
      
      try {
        await col.createIndex({ schoolId: 1 });
      } catch (e) {
        console.log(`Index creation for ${colName} might exist:`, e.message);
      }
    }

    try {
      await db.collection('tenants').createIndex({ subdomain: 1 }, { unique: true });
      await db.collection('schools').createIndex({ tenantId: 1 });
    } catch(e) {}


    // --- PART 2: ROLES & USERS MIGRATION ---
    console.log('--- Step 2: Roles and User Migration ---');
    const roleSchema = new mongoose.Schema({ name: { type: String, unique: true }, description: String, permissions: Array });
    const Role = mongoose.model('Role', roleSchema);

    const rolesToEnsure = [
      { name: 'SUPER_ADMIN', description: 'Super Administrator with all permissions' },
      { name: 'ADMIN', description: 'Administrator with role management permissions' },
      { name: 'TEACHER', description: 'Teacher role with attendance and marks permissions' },
      { name: 'STAFF', description: 'Staff role with department access' },
      { name: 'STUDENT', description: 'Student role with limited access to profile, attendance, and marks' },
      { name: 'PARENT', description: 'Parent role with access to linked children data' }
    ];

    const roleIds = {};
    for (const r of rolesToEnsure) {
      let roleDoc = await Role.findOne({ name: r.name });
      if (!roleDoc) {
        roleDoc = await Role.create(r);
        console.log(`Created Role: ${r.name}`);
      }
      roleIds[r.name] = roleDoc._id;
    }

    const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
    const User = mongoose.model('User', userSchema);

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('ChangeMe123!', salt);

    function splitName(fullName) {
      if (!fullName) return { firstName: 'N/A', lastName: 'N/A' };
      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] || 'N/A';
      const lastName = parts.slice(1).join(' ') || 'N/A';
      return { firstName, lastName };
    }

    // Teachers
    const teacherCol = db.collection('teachers');
    if (await teacherCol.countDocuments() > 0) {
      for (const t of await teacherCol.find().toArray()) {
        if (!await User.findOne({ $or: [{ _id: t._id }, { email: t.email?.toLowerCase() }] })) {
          const { firstName, lastName } = splitName(t.name);
          await User.create({ _id: t._id, email: t.email?.toLowerCase(), passwordHash: defaultPasswordHash, firstName, lastName, phone: t.phone || '', role: roleIds['TEACHER'], roleType: 'TEACHER', isActive: t.isActive !== false, subjects: t.subjects || [], classes: t.classes || [], profile: t.profile || '', createdAt: t.createdAt || new Date(), updatedAt: t.updatedAt || new Date(), schoolId: defaultSchoolId });
        }
      }
      await teacherCol.rename('backup_teachers');
    }

    // Staff
    const staffCol = db.collection('staffs');
    if (await staffCol.countDocuments() > 0) {
      for (const s of await staffCol.find().toArray()) {
        if (!await User.findOne({ $or: [{ _id: s._id }, { email: s.email?.toLowerCase() }] })) {
          const { firstName, lastName } = splitName(s.name);
          await User.create({ _id: s._id, email: s.email?.toLowerCase(), passwordHash: defaultPasswordHash, firstName, lastName, phone: s.phone || '', role: roleIds['STAFF'], roleType: 'STAFF', isActive: s.isActive !== false, department: s.department || null, createdAt: s.createdAt || new Date(), updatedAt: s.updatedAt || new Date(), schoolId: defaultSchoolId });
        }
      }
      await staffCol.rename('backup_staffs');
    }

    // Parents & Students
    const studentCol = db.collection('students');
    if (await studentCol.countDocuments() > 0) {
      const parentsCol = db.collection('parents');
      const parentDetailsMap = new Map();
      for (const p of await parentsCol.find().toArray()) {
        const pName = p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'N/A';
        parentDetailsMap.set(p._id.toString(), { id: p._id, name: pName, email: p.email ? p.email.toLowerCase() : `parent.${p._id.toString()}@school.com`, phone: p.phone || '', firstName: p.firstName || pName.split(/\s+/)[0] || 'N/A', lastName: p.lastName || pName.split(/\s+/).slice(1).join(' ') || '', relationshipType: p.relationshipType || 'Guardian', occupation: p.occupation || '', address: p.address || '' });
      }

      async function getNextSeq(counterName) {
        const result = await db.collection('counters').findOneAndUpdate({ _id: counterName }, { $inc: { seq: 1 } }, { returnDocument: 'after', upsert: true });
        return (result.value || result).seq;
      }

      for (const st of await studentCol.find().toArray()) {
        let parentId = null, parentName = 'N/A';
        if (st.parent && parentDetailsMap.has(st.parent.toString())) {
          const pDet = parentDetailsMap.get(st.parent.toString());
          parentName = pDet.name;
          let parentUser = await User.findOne({ email: pDet.email });
          if (!parentUser) {
            parentUser = await User.create({ email: pDet.email, passwordHash: defaultPasswordHash, firstName: pDet.firstName, lastName: pDet.lastName, phone: pDet.phone, role: roleIds['PARENT'], roleType: 'PARENT', isActive: true, children: [st._id], relationshipType: pDet.relationshipType, occupation: pDet.occupation, address: pDet.address, createdAt: new Date(), updatedAt: new Date(), schoolId: defaultSchoolId });
          } else if (!(parentUser.children || []).map(c=>c.toString()).includes(st._id.toString())) {
            await User.updateOne({ _id: parentUser._id }, { $addToSet: { children: st._id } });
          }
          parentId = parentUser._id;
        }

        const activeYearDoc = await db.collection('academicyears').findOne({ isActive: true });
        const activeYearId = activeYearDoc ? activeYearDoc._id : 'default';

        const admissionNumber = st.admissionNumber || `ADM-${new Date().getFullYear()}-${String(await getNextSeq(`admission_number:${new Date().getFullYear()}`)).padStart(6, '0')}`;
        const classIdStr = st.class ? st.class.toString() : 'default';
        const yearIdStr = activeYearId.toString();
        const shortClassId = classIdStr.length > 6 ? classIdStr.substring(classIdStr.length - 6) : classIdStr;
        const rollNumber = st.rollNumber || `ROLL-${shortClassId}-${String(await getNextSeq(`roll_number:${classIdStr}:${yearIdStr}`)).padStart(6, '0')}`;

        const email = st.email ? st.email.toLowerCase() : `student.${admissionNumber}@school.com`;
        if (!await User.findOne({ $or: [{ _id: st._id }, { email }] })) {
          await User.create({ _id: st._id, email, passwordHash: defaultPasswordHash, firstName: st.firstName || 'N/A', lastName: st.lastName || 'N/A', phone: st.phone || '', role: roleIds['STUDENT'], roleType: 'STUDENT', isActive: st.isActive !== false, admissionNumber, rollNumber, dob: st.dob || null, gender: st.gender || '', bloodGroup: st.bloodGroup || '', address: st.address || '', parent: parentName, parentId: parentId, class: st.class || null, section: st.section || null, history: st.history || [], createdAt: st.createdAt || new Date(), updatedAt: st.updatedAt || new Date(), schoolId: defaultSchoolId });
        }
      }
      await studentCol.rename('backup_students');
      
      const colls = await db.listCollections().toArray();
      const collNames = colls.map(c => c.name);
      if (collNames.includes('parents')) {
        await db.collection('parents').rename('backup_parents');
      }
    }


    // --- PART 3: SEED ADMIN ---
    console.log('--- Step 3: Seed Admin User ---');
    const existingAdmin = await User.findOne({ email: 'admin@school.com' });
    if (!existingAdmin) {
      const adminPasswordHash = await bcrypt.hash('password123', salt);
      await User.create({
        email: 'admin@school.com',
        passwordHash: adminPasswordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: roleIds['SUPER_ADMIN'],
        roleType: 'SUPER_ADMIN',
        schoolId: defaultSchoolId,
        isActive: true
      });
      console.log('Created Admin User: admin@school.com');
    }

  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Initialization completed. Disconnected from MongoDB.');
  }
}

initDB();
