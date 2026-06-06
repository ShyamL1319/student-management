const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:examplepassword@localhost:27018/school-management?authSource=admin';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await mongoose.connection.db.collection('users').find().toArray();
    console.log('Users found:', users.length);
    users.forEach(u => {
      console.log(`- ${u.email} (${u.firstName} ${u.lastName}) role: ${u.role} roleType: ${u.roleType}`);
    });

    const roles = await mongoose.connection.db.collection('roles').find().toArray();
    console.log('Roles found:', roles.length);
    roles.forEach(r => {
      console.log(`- ${r.name} (${r._id})`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

check();
