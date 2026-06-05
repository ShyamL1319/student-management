const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:examplepassword@localhost:27018/school-management?authSource=admin';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({ email: String, firstName: String, lastName: String }));
    const Role = mongoose.model('Role', new mongoose.Schema({ name: String }));

    const users = await User.find().populate('role');
    console.log('Users found:', users.length);
    users.forEach(u => {
      console.log(`- ${u.email} (${u.firstName} ${u.lastName})`);
    });

    const roles = await Role.find();
    console.log('Roles found:', roles.length);
    roles.forEach(r => {
      console.log(`- ${r.name}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

check();
