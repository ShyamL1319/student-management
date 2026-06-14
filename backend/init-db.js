/* eslint-env node */
// backend/init-db.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management';
const {
  Types: { ObjectId },
} = mongoose;

// --- UTILITY GENERATORS ---
const firstNames = [
  'James',
  'Mary',
  'John',
  'Patricia',
  'Robert',
  'Jennifer',
  'Michael',
  'Linda',
  'William',
  'Elizabeth',
  'David',
  'Barbara',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Sarah',
  'Charles',
  'Karen',
  'Christopher',
  'Nancy',
  'Daniel',
  'Lisa',
  'Matthew',
  'Betty',
  'Anthony',
  'Margaret',
  'Mark',
  'Sandra',
];
const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
];

function getRandomName() {
  return {
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
  };
}

function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

async function seedMassiveData(db, schoolId, roleIds, defaultPasswordHash, adminId) {
  const studentCount = await db
    .collection('users')
    .countDocuments({ roleType: 'STUDENT' });
  if (studentCount >= 5) {
    console.log(
      'Database already has sufficient seed data. Skipping massive seed.',
    );
    return;
  }
  console.log(
    'Seeding massive data for UI/UX testing. This may take a moment...',
  );

  const currentYear = new Date().getFullYear();

  // --- 1. Departments ---
  console.log('Seeding Departments...');
  const depts = [
    { name: 'Human Resources', description: 'HR Department' },
    { name: 'Finance', description: 'Finance and Accounting' },
    { name: 'Operations', description: 'School Operations' },
    { name: 'IT Support', description: 'IT and Tech Support' },
    { name: 'Library', description: 'Library Management' },
    { name: 'Science Department', description: 'Science and Mathematics Academic Dept' },
    { name: 'Arts & Humanities', description: 'Languages, Arts and Social Studies' },
    {
      name: 'Empty Department',
      description: 'Department without staff for edge cases',
    },
  ];
  const insertedDepts = [];
  for (const d of depts) {
    const res = await db
      .collection('departments')
      .insertOne({
        ...d,
        school: schoolId,
        isActive: true,
        createdAt: new Date(),
      });
    insertedDepts.push({ _id: res.insertedId, ...d });
  }

  // --- 2. Subjects ---
  console.log('Seeding Subjects...');
  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'History',
    'Geography',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Art',
  ];
  const insertedSubjects = [];
  for (const s of subjects) {
    const res = await db
      .collection('subjects')
      .insertOne({
        name: s,
        code: s.substring(0, 3).toUpperCase(),
        school: schoolId,
        isActive: true,
        createdAt: new Date(),
      });
    insertedSubjects.push({ _id: res.insertedId, name: s });
  }

  // --- 3. Academic Years ---
  console.log('Seeding Academic Years...');
  const years = [
    {
      name: `${currentYear - 1}-${currentYear}`,
      startDate: new Date(currentYear - 1, 3, 1),
      endDate: new Date(currentYear, 2, 31),
      isActive: false,
    },
    {
      name: `${currentYear}-${currentYear + 1}`,
      startDate: new Date(currentYear, 3, 1),
      endDate: new Date(currentYear + 1, 2, 31),
      isActive: true,
    },
    {
      name: `${currentYear + 1}-${currentYear + 2}`,
      startDate: new Date(currentYear + 1, 3, 1),
      endDate: new Date(currentYear + 2, 2, 31),
      isActive: false,
    },
  ];
  const insertedYears = [];
  for (const y of years) {
    const res = await db
      .collection('academicyears')
      .insertOne({ ...y, school: schoolId, createdAt: new Date() });
    insertedYears.push({ _id: res.insertedId, ...y });
  }
  const activeYearId = insertedYears.find((y) => y.isActive)._id;

  // --- 4. Staff ---
  console.log('Seeding Staff...');
  const staffIds = [];
  const staffRecords = [];
  for (let i = 0; i < 5; i++) {
    const name = getRandomName();
    const email = `staff${i}@school.com`;
    // Map to all departments except the last 'Empty Department'
    const dept = insertedDepts[i % (insertedDepts.length - 1)];
    staffRecords.push({
      email,
      passwordHash: defaultPasswordHash,
      firstName: name.firstName,
      lastName: name.lastName,
      phone: `555-10${i.toString().padStart(2, '0')}`,
      role: roleIds['STAFF'],
      roleType: 'STAFF',
      isActive: i % 10 !== 0, // 1 inactive in 10
      department: dept._id,
      schoolId: schoolId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  const staffRes = await db.collection('users').insertMany(staffRecords);
  staffIds.push(...Object.values(staffRes.insertedIds));

  // Update Departments with Head of Department
  console.log('Assigning Head of Departments...');
  for (let i = 0; i < insertedDepts.length - 1; i++) {
    await db.collection('departments').updateOne(
      { _id: insertedDepts[i]._id },
      {
        $set: {
          headOfDepartment: staffIds[i],
          email: `contact@${insertedDepts[i].name.toLowerCase().replace(/\s+/g, '')}.school.com`,
          phone: `555-800${i}`
        }
      }
    );
  }

  // --- 5. Teachers ---
  console.log('Seeding Teachers...');
  const teacherIds = [];
  const teachers = [];
  const teacherRecords = [];
  for (let i = 0; i < 5; i++) {
    const name = getRandomName();
    const email = `teacher${i}@school.com`;
    const tSubjects = [
      insertedSubjects[i % insertedSubjects.length]._id,
      insertedSubjects[(i + 1) % insertedSubjects.length]._id,
    ];
    const academicDepts = insertedDepts.filter(d => ['Science Department', 'Arts & Humanities'].includes(d.name));
    const assignedDept = academicDepts[i % academicDepts.length];
    const tId = new ObjectId();
    teacherRecords.push({
      _id: tId,
      email,
      passwordHash: defaultPasswordHash,
      firstName: name.firstName,
      lastName: name.lastName,
      phone: `555-20${i.toString().padStart(2, '0')}`,
      role: roleIds['TEACHER'],
      roleType: 'TEACHER',
      isActive: true,
      subjects: tSubjects,
      department: assignedDept._id,
      schoolId: schoolId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    teacherIds.push(tId);
    teachers.push({ _id: tId, subjects: tSubjects });
  }
  await db.collection('users').insertMany(teacherRecords);

  // --- 6. Classes & Sections ---
  console.log('Seeding Classes & Sections...');
  const classNames = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
  const sectionNames = ['A', 'B', 'C'];
  const insertedClasses = [];
  const insertedSections = [];
  const academicDepts = insertedDepts.filter(d => ['Science Department', 'Arts & Humanities'].includes(d.name));
  let teacherIdx = 0;
  let classIdx = 0;

  for (const cName of classNames) {
    const classTeacherId = teacherIds[teacherIdx++];
    const classId = new ObjectId();

    const sectionIdsForClass = [];
    for (const sName of sectionNames) {
      const secRes = await db.collection('sections').insertOne({
        name: sName,
        classId: classId,
        school: schoolId,
        isActive: true,
        createdAt: new Date(),
      });
      insertedSections.push({ _id: secRes.insertedId, name: sName, classId });
      sectionIdsForClass.push(secRes.insertedId);
    }

    await db.collection('classes').insertOne({
      _id: classId,
      name: cName,
      sections: sectionIdsForClass,
      classTeacher: classTeacherId,
      department: academicDepts[classIdx % academicDepts.length]._id,
      school: schoolId,
      isActive: cName !== 'Grade 10', // Archive Grade 10 to test edge cases
      createdAt: new Date(),
    });
    classIdx++;
    insertedClasses.push({ _id: classId, name: cName });
  }

  // --- 7. Parents ---
  console.log('Seeding Parents...');
  const parentIds = [];
  const parents = [];
  const parentRecords = [];
  for (let i = 0; i < 5; i++) {
    const name = getRandomName();
    const email = `parent${i}@school.com`;
    const pId = new ObjectId();
    parentRecords.push({
      _id: pId,
      email,
      passwordHash: defaultPasswordHash,
      firstName: name.firstName,
      lastName: name.lastName,
      phone: `555-30${i.toString().padStart(2, '0')}`,
      role: roleIds['PARENT'],
      roleType: 'PARENT',
      isActive: true,
      relationshipType: i % 5 === 0 ? 'Mother' : 'Father',
      occupation: 'Engineer',
      address: '123 School St',
      children: [],
      schoolId: schoolId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    parentIds.push(pId);
    parents.push({
      _id: pId,
      lastName: name.lastName,
      firstName: name.firstName,
    });
  }
  await db.collection('users').insertMany(parentRecords);

  // --- 8. Students ---
  console.log('Seeding Students...');
  const studentIds = [];
  let studentCount1 = 1;
  const studentsBySection = {};
  const studentRecords = [];
  const parentUpdates = {}; // Tracks child mapping

  for (const section of insertedSections) {
    studentsBySection[section._id] = [];
    // 10 students per section = 150 students
    for (let i = 0; i < 5; i++) {
      // Randomly assign to a pool of 60 parents, forcing some parents to have multiple kids
      const parent = parents[Math.floor(Math.random() * parents.length)];
      const name = {
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: parent.lastName,
      };
      const email = `student${studentCount1}@school.com`;
      const dob = getRandomDate(new Date(2005, 0, 1), new Date(2012, 11, 31));
      const sId = new ObjectId();

      const cls = insertedClasses.find((c) => c._id.toString() === section.classId.toString());
      const clsName = cls ? cls.name.replace(/\s+/g, '') : 'Class';

      studentRecords.push({
        _id: sId,
        email,
        passwordHash: defaultPasswordHash,
        firstName: name.firstName,
        lastName: name.lastName,
        phone: `555-40${studentCount1.toString().padStart(3, '0')}`,
        role: roleIds['STUDENT'],
        roleType: 'STUDENT',
        isActive: studentCount1 % 15 !== 0, // 1 in 15 inactive
        admissionNumber: `ADM-${currentYear}-${studentCount1.toString().padStart(4, '0')}`,
        rollNumber: `R-${clsName}-${section.name}-${i + 1}`,
        dob,
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        bloodGroup: ['A+', 'A-', 'B+', 'O+', 'O-', 'AB+'][
          Math.floor(Math.random() * 6)
        ],
        address: '123 School St',
        parent: `${parent.firstName} ${parent.lastName}`,
        parentId: parent._id,
        class: section.classId,
        section: section._id,
        schoolId: schoolId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      studentIds.push(sId);
      studentsBySection[section._id].push(sId);

      if (!parentUpdates[parent._id]) parentUpdates[parent._id] = [];
      parentUpdates[parent._id].push(sId);

      studentCount1++;
    }
  }
  await db.collection('users').insertMany(studentRecords);

  // Bulk update parents with their aggregated children
  for (const pId of Object.keys(parentUpdates)) {
    await db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(pId) },
        { $set: { children: parentUpdates[pId] } },
      );
  }

  // --- 9. Timetables ---
  console.log('Seeding Timetables...');
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const times = [
    { start: '09:00', end: '09:45' },
    { start: '10:00', end: '10:45' },
    { start: '11:00', end: '11:45' },
    { start: '12:00', end: '12:45' },
    { start: '13:30', end: '14:15' },
  ];

  const timetables = [];
  for (const section of insertedSections) {
    for (const day of days) {
      for (let slot = 0; slot < times.length; slot++) {
        const subject =
          insertedSubjects[Math.floor(Math.random() * insertedSubjects.length)];
        // Force finding a teacher skilled in this subject
        const eligibleTeachers = teachers.filter((t) =>
          t.subjects.map((s) => s.toString()).includes(subject._id.toString()),
        );
        const teacher =
          eligibleTeachers.length > 0
            ? eligibleTeachers[
            Math.floor(Math.random() * eligibleTeachers.length)
            ]
            : teachers[Math.floor(Math.random() * teachers.length)];

        timetables.push({
          class: section.classId,
          academicYear: activeYearId,
          teacher: teacher._id,
          subject: subject._id,
          section: section._id,
          dayOfWeek: day,
          startTime: times[slot].start,
          endTime: times[slot].end,
          room: `Room ${100 + Math.floor(Math.random() * 50)}`,
          isActive: true,
          createdAt: new Date(),
        });
      }
    }
  }
  await db.collection('timetables').insertMany(timetables);

  // --- 10. Exams & Marks ---
  console.log('Seeding Exams & Marks...');
  const examTypes = ['Mid Term', 'Final'];
  const exams = [];
  for (const cls of insertedClasses) {
    for (const type of examTypes) {
      const examDate =
        type === 'Mid Term'
          ? new Date(currentYear, 9, 15)
          : new Date(currentYear + 1, 2, 10);
      const res = await db.collection('exams').insertOne({
        name: `${type} Examination`,
        type: type,
        date: examDate,
        class: cls._id,
        school: schoolId,
        isPublished: true,
        schedule: insertedSubjects.slice(0, 5).map((s, idx) => ({
          date: new Date(examDate.getTime() + idx * 86400000),
          subject: s._id,
          startTime: '09:00',
          endTime: '12:00',
        })),
        createdAt: new Date(),
      });
      exams.push({
        _id: res.insertedId,
        classId: cls._id,
        subjects: insertedSubjects.slice(0, 5),
      });
    }
  }

  const marks = [];
  for (const exam of exams) {
    const classSections = insertedSections.filter(
      (s) => s.classId.toString() === exam.classId.toString(),
    );
    for (const section of classSections) {
      const sIds = studentsBySection[section._id];
      for (const sId of sIds) {
        for (const sub of exam.subjects) {
          // Weighted random toward top-to-average performers
          const marksObtained = 40 + Math.floor(Math.random() * 60);
          marks.push({
            studentId: sId,
            subjectId: sub._id,
            examId: exam._id,
            marksObtained,
            maxMarks: 100,
            grade:
              marksObtained >= 90
                ? 'A'
                : marksObtained >= 75
                  ? 'B'
                  : marksObtained >= 60
                    ? 'C'
                    : 'D',
            createdAt: new Date(),
          });
        }
      }
    }
  }
  await db.collection('marks').insertMany(marks);

  // --- 11. Attendance ---
  console.log('Seeding Attendance...');
  const attendances = [];
  const today = new Date();
  for (let d = 0; d < 5; d++) {
    const attDate = new Date(today.getTime() - d * 86400000);
    if (attDate.getDay() === 0 || attDate.getDay() === 6) continue; // skip weekends

    // Students attendance
    for (const sId of studentIds) {
      const rand = Math.random();
      const status =
        rand > 0.1
          ? 'PRESENT'
          : rand > 0.05
            ? 'ABSENT'
            : rand > 0.02
              ? 'LATE'
              : 'EXCUSED';
      attendances.push({
        attendeeType: 'STUDENT',
        attendeeId: sId,
        student: sId,
        status,
        date: attDate,
        school: schoolId,
        createdAt: new Date(),
      });
    }
    // Teachers attendance
    for (const tId of teacherIds) {
      attendances.push({
        attendeeType: 'TEACHER',
        attendeeId: tId,
        status: Math.random() > 0.05 ? 'PRESENT' : 'ABSENT',
        date: attDate,
        school: schoolId,
        createdAt: new Date(),
      });
    }
  }
  // Batch insertion to avoid memory overflow limits
  for (let i = 0; i < attendances.length; i += 1000) {
    await db
      .collection('attendances')
      .insertMany(attendances.slice(i, i + 1000));
  }

  // --- 12. Fees ---
  console.log('Seeding Fees...');
  // Seed Fee Categories
  const feeCategoriesRes = await db.collection('feecategories').insertMany([
    { name: 'Tuition Fee', description: 'Standard Tuition', isActive: true, schoolId: schoolId, createdAt: new Date() },
    { name: 'Transport Fee', description: 'Bus service', isActive: true, schoolId: schoolId, createdAt: new Date() },
    { name: 'Library Fee', description: 'Library access', isActive: true, schoolId: schoolId, createdAt: new Date() }
  ]);
  const feeCategoryIds = Object.values(feeCategoriesRes.insertedIds);

  // Seed Fee Structures
  const feeStructuresRes = await db.collection('feestructures').insertMany([
    {
      feeName: 'Grade 6-8 Tuition',
      amount: 5000,
      discount: 0,
      frequency: 'SEMESTER',
      categoryId: feeCategoryIds[0],
      classId: insertedClasses[0]._id,
      academicYearId: activeYearId,
      dueDate: new Date(currentYear, 9, 1),
      applicability: 'APPLICABLE',
      schoolId: schoolId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      feeName: 'Transport Zone A',
      amount: 1500,
      discount: 0,
      frequency: 'MONTHLY',
      categoryId: feeCategoryIds[1],
      classId: insertedClasses[0]._id,
      academicYearId: activeYearId,
      dueDate: new Date(currentYear, 9, 1),
      applicability: 'APPLICABLE',
      schoolId: schoolId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const invoices = [];
  const feeCollections = [];
  let invNumber = 1000;
  for (const sId of studentIds) {
    const netAmount = 5000;

    // Invoice 1: Fully Paid (Past Date)
    const inv1Id = new ObjectId();
    invoices.push({
      _id: inv1Id,
      studentId: sId,
      invoiceNumber: `INV-${invNumber++}`,
      invoiceDate: new Date(currentYear, 5, 1),
      dueDate: new Date(currentYear, 5, 15),
      netAmount,
      paidAmount: netAmount,
      pendingAmount: 0,
      status: 'paid',
      schoolId: schoolId,
      feeItems: [{ name: 'Term 1 Tuition', amount: 5000, feeType: 'Tuition', categoryId: feeCategoryIds[0] }],
      createdAt: new Date(),
    });
    feeCollections.push({
      invoiceId: inv1Id,
      studentId: sId,
      amountPaid: netAmount,
      paymentDate: new Date(currentYear, 5, 10),
      paymentMethod: 'Card',
      status: 'completed',
      receiptNumber: `REC-${invNumber}`,
      schoolId: schoolId,
      createdAt: new Date(),
    });

    // Invoice 2: Mixed Status (paid, partial, overdue)
    const inv2Id = new ObjectId();
    const rand = Math.random();
    let paidAmt = 0;
    let status = 'pending';

    if (rand > 0.7) {
      paidAmt = 2000;
      status = 'partially_paid';
    } else if (rand > 0.9) {
      paidAmt = netAmount;
      status = 'paid';
    } else if (rand < 0.2) {
      status = 'overdue';
    }

    invoices.push({
      _id: inv2Id,
      studentId: sId,
      invoiceNumber: `INV-${invNumber++}`,
      invoiceDate: new Date(currentYear, 10, 1),
      dueDate: new Date(currentYear, 10, 15),
      netAmount,
      paidAmount: paidAmt,
      pendingAmount: netAmount - paidAmt,
      status,
      schoolId: schoolId,
      feeItems: [{ name: 'Term 2 Tuition', amount: 5000, feeType: 'Tuition', categoryId: feeCategoryIds[0] }],
      createdAt: new Date(),
    });
    if (paidAmt > 0) {
      feeCollections.push({
        invoiceId: inv2Id,
        studentId: sId,
        amountPaid: paidAmt,
        paymentDate: new Date(currentYear, 10, 5),
        paymentMethod: 'Bank Transfer',
        status: 'completed',
        receiptNumber: `REC-${invNumber}`,
        schoolId: schoolId,
        createdAt: new Date(),
      });
    }
  }
  await db.collection('invoices').insertMany(invoices);
  if (feeCollections.length > 0) {
    await db.collection('feecollections').insertMany(feeCollections);
  }

  // --- 13. Notifications ---
  console.log('Seeding Notifications...');

  // Seed Notification Preferences
  const preferences = [];
  for (const uId of [...studentIds, ...parentIds, ...teacherIds, ...staffIds, adminId].filter(Boolean)) {
    preferences.push({
      userId: uId,
      emailNotifications: true,
      smsNotifications: false,
      inAppNotifications: true,
      doNotDisturb: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  if (preferences.length > 0) {
    await db.collection('notificationpreferences').insertMany(preferences);
  }

  // Seed Notification Templates
  const templateRes = await db.collection('notificationtemplates').insertOne({
    name: 'Standard Fee Alert',
    eventType: 'fee-alert',
    channel: 'in-app',
    subject: 'Fee Reminder: {{studentName}}',
    message: 'Dear Parent, your fee of {{amount}} is due.',
    isActive: true,
    schoolId: schoolId,
    createdAt: new Date()
  });
  const templateId = templateRes.insertedId;

  const notifications = [];
  const notifEvents = [];
  const eventTypes = ['attendance-alert', 'fee-alert', 'result-alert', 'exam-schedule', 'timetable-change', 'announcement'];

  // Student notifications for infinite scrolling testing
  for (const sId of studentIds) {
    for (let i = 0; i < 5; i++) {
      const eType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const eventId = new ObjectId();
      const notifId = new ObjectId();

      notifEvents.push({
        _id: eventId,
        eventType: eType,
        triggeredBy: adminId || sId,
        relatedEntityId: sId,
        relatedEntityType: 'Student',
        notificationIds: [notifId],
        eventData: { generatedBySeed: true },
        successCount: 1,
        failureCount: 0,
        isActive: true,
        schoolId: schoolId,
        createdAt: new Date()
      });

      notifications.push({
        _id: notifId,
        recipientId: sId,
        eventType: eType,
        channel: 'in-app',
        subject: `Sample ${eType}`,
        message:
          'This is an autogenerated notification for testing UI/UX and infinite scroll.',
        status: Math.random() > 0.5 ? 'delivered' : 'opened',
        isRead: Math.random() > 0.5,
        schoolId: schoolId,
        createdAt: getRandomDate(new Date(currentYear, 5, 1), new Date()),
      });
    }
  }

  // Parent overdue fee notifications
  for (const pId of parentIds) {
    notifications.push({
      recipientId: pId,
      eventType: 'fee-alert',
      channel: 'in-app',
      templateId: templateId,
      subject: 'Fee Reminder',
      message: 'Your upcoming fee is due or overdue.',
      status: 'sent',
      isRead: false,
      schoolId: schoolId,
      createdAt: new Date(),
    });
  }
  await db.collection('notificationevents').insertMany(notifEvents);
  await db.collection('notifications').insertMany(notifications);

  console.log('Massive seed completed successfully.');
}

async function seedNewFeatures(db, schoolId, adminId) {
  console.log('Checking and seeding new features (Leaves, Admissions, Assignments)...');

  // Fetch basic references
  const students = await db.collection('users').find({ roleType: 'STUDENT' }).limit(10).toArray();
  const teachers = await db.collection('users').find({ roleType: 'TEACHER' }).limit(5).toArray();

  if (students.length === 0 || teachers.length === 0) {
    console.log('No students or teachers found. Skipping new features seeding.');
    return;
  }

  const studentIds = students.map(s => s._id);
  const teacherIds = teachers.map(t => t._id);

  // 1. Leave Requests
  const leaveCount = await db.collection('leaverequests').countDocuments();
  if (leaveCount === 0) {
    console.log('Seeding Leave Requests...');
    const leaveRequests = [
      {
        school: schoolId,
        requesterId: studentIds[0],
        requesterType: 'STUDENT',
        startDate: new Date(Date.now() + 86400000), // tomorrow
        endDate: new Date(Date.now() + 86400000 * 3),
        type: 'Sick',
        reason: 'Suffering from high fever',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        school: schoolId,
        requesterId: studentIds[1],
        requesterType: 'STUDENT',
        startDate: new Date(Date.now() - 86400000 * 5),
        endDate: new Date(Date.now() - 86400000 * 3),
        type: 'Casual',
        reason: 'Family wedding out of town',
        status: 'APPROVED',
        approvedBy: adminId,
        remarks: 'Approved. Please collect handouts when back.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        school: schoolId,
        requesterId: teacherIds[0],
        requesterType: 'TEACHER',
        startDate: new Date(Date.now() + 86400000 * 2),
        endDate: new Date(Date.now() + 86400000 * 3),
        type: 'Casual',
        reason: 'Personal legal business',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    await db.collection('leaverequests').insertMany(leaveRequests);
  }

  // 2. Admission Applications
  const admissionCount = await db.collection('admissionapplications').countDocuments();
  if (admissionCount === 0) {
    console.log('Seeding Admission Applications...');
    const admissionApplications = [
      {
        school: schoolId,
        applicantName: 'Harry Potter Jr.',
        gradeLevel: 'Grade 6',
        entranceScore: 92,
        status: 'Applied',
        parentEmail: 'james.potter@wizard.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        school: schoolId,
        applicantName: 'Hermione Granger Jr.',
        gradeLevel: 'Grade 7',
        entranceScore: 99,
        status: 'Verified',
        parentEmail: 'grangers@dentist.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        school: schoolId,
        applicantName: 'Ronald Weasley Jr.',
        gradeLevel: 'Grade 6',
        entranceScore: 65,
        status: 'Interview Scheduled',
        parentEmail: 'arthur.weasley@ministry.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    await db.collection('admissionapplications').insertMany(admissionApplications);
  }

  // 3. Assignments & Submissions
  const assignmentCount = await db.collection('assignments').countDocuments();
  if (assignmentCount === 0) {
    console.log('Seeding Assignments & Submissions...');
    const classes = await db.collection('classes').find().toArray();
    const subjects = await db.collection('subjects').find().toArray();

    if (classes.length > 0 && subjects.length > 0) {
      const assignments = [];
      const submissions = [];

      for (let idx = 0; idx < Math.min(5, classes.length); idx++) {
        const cls = classes[idx];
        const teacherId = cls.classTeacher || teacherIds[0];
        const subjectId = subjects[idx % subjects.length]._id;
        const assId = new ObjectId();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);

        assignments.push({
          _id: assId,
          school: schoolId,
          title: `${cls.name} Assignment ${idx + 1}`,
          description: 'Please read chapter 3 and complete review questions 1-10.',
          subject: subjectId,
          class: cls._id,
          teacher: teacherId,
          dueDate: dueDate,
          maxMarks: 100,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Find students in this class
        const classStudents = await db.collection('users').find({
          roleType: 'STUDENT',
          class: cls._id,
        }).toArray();

        for (let sIdx = 0; sIdx < Math.min(3, classStudents.length); sIdx++) {
          const student = classStudents[sIdx];
          const status = sIdx === 0 ? 'Graded' : 'Submitted';
          const marks = status === 'Graded' ? 88 + sIdx * 2 : undefined;
          const fb = status === 'Graded' ? 'Excellent analysis.' : undefined;

          submissions.push({
            school: schoolId,
            assignment: assId,
            student: student._id,
            fileUrl: 'https://example.com/submission.pdf',
            submittedAt: new Date(),
            status: status,
            marksObtained: marks,
            feedback: fb,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      if (assignments.length > 0) {
        await db.collection('assignments').insertMany(assignments);
      }
      if (submissions.length > 0) {
        await db.collection('assignmentsubmissions').insertMany(submissions);
      }
    }
  }
}

async function initDB() {
  console.log('Starting Database Initialization...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;

  try {
    // --- PART 1: TENANCY SETUP ---
    console.log('--- Step 1: Tenancy Setup ---');
    const tenantSchema = new mongoose.Schema({
      name: String,
      subdomain: String,
      isActive: { type: Boolean, default: true },
    });
    const Tenant = mongoose.model('Tenant', tenantSchema);

    const schoolSchema = new mongoose.Schema({
      tenantId: mongoose.Schema.Types.ObjectId,
      name: String,
      address: String,
      phone: String,
      email: String,
      isActive: { type: Boolean, default: true },
      emailNotificationsEnabled: { type: Boolean, default: true },
      smsAlertsEnabled: { type: Boolean, default: false },
      autoBackupEnabled: { type: Boolean, default: true },
    });
    const School = mongoose.model('School', schoolSchema);

    let defaultSchool = await School.findOne();
    let defaultTenant;

    if (!defaultSchool) {
      console.log(
        'No existing School found. Creating a default tenant and school...',
      );
      defaultTenant = await Tenant.create({
        name: 'PSEI Tenant',
        subdomain: 'psei',
        isActive: true,
      });
      defaultSchool = await School.create({
        tenantId: defaultTenant._id,
        name: 'PSEI High School',
        address: 'PSEI, Sikar',
        phone: '555-0113',
        email: 'psei@school.com',
        isActive: true,
        emailNotificationsEnabled: true,
        smsAlertsEnabled: false,
        autoBackupEnabled: true,
      });
    } else {
      if (!defaultSchool.tenantId) {
        defaultTenant = await Tenant.findOne({ subdomain: 'psei' });
        if (!defaultTenant) {
          defaultTenant = await Tenant.create({
            name: 'PSEI Tenant',
            subdomain: 'psei',
            isActive: true,
          });
        }
        defaultSchool.tenantId = defaultTenant._id;
        await defaultSchool.save();
      }
      // Ensure existing schools have default settings populated
      let needsUpdate = false;
      const updates = {};
      if (defaultSchool.emailNotificationsEnabled === undefined) {
        updates.emailNotificationsEnabled = true;
        needsUpdate = true;
      }
      if (defaultSchool.smsAlertsEnabled === undefined) {
        updates.smsAlertsEnabled = false;
        needsUpdate = true;
      }
      if (defaultSchool.autoBackupEnabled === undefined) {
        updates.autoBackupEnabled = true;
        needsUpdate = true;
      }
      if (needsUpdate) {
        await School.updateOne({ _id: defaultSchool._id }, { $set: updates });
      }
    }
    const defaultSchoolId = defaultSchool._id;

    const globalCollections = [
      'tenants',
      'schools',
      'roles',
      'permissions',
      'counters',
      'auditlogs',
      'systemsettings',
    ];
    const collections = await db.listCollections().toArray();
    for (const collectionInfo of collections) {
      const colName = collectionInfo.name;
      if (
        globalCollections.includes(colName) ||
        colName.startsWith('system.') ||
        colName.startsWith('backup_')
      )
        continue;

      const col = db.collection(colName);
      await col.updateMany(
        { schoolId: { $exists: false } },
        { $set: { schoolId: defaultSchoolId } },
      );

      try {
        await col.createIndex({ schoolId: 1 });
      } catch (e) {
        console.log(`Index creation for ${colName} might exist:`, e.message);
      }
    }

    try {
      await db
        .collection('tenants')
        .createIndex({ subdomain: 1 }, { unique: true });
      await db.collection('schools').createIndex({ tenantId: 1 });
    } catch (e) { }

    // --- PART 2: ROLES & USERS MIGRATION ---
    console.log('--- Step 2: Roles and User Migration ---');
    const roleSchema = new mongoose.Schema({
      name: { type: String, unique: true },
      description: String,
      permissions: Array,
    });
    const Role = mongoose.model('Role', roleSchema);

    const rolesToEnsure = [
      {
        name: 'SUPER_ADMIN',
        description: 'Super Administrator with all permissions',
      },
      {
        name: 'ADMIN',
        description: 'Administrator with role management permissions',
      },
      {
        name: 'TEACHER',
        description: 'Teacher role with attendance and marks permissions',
      },
      { name: 'STAFF', description: 'Staff role with department access' },
      {
        name: 'STUDENT',
        description:
          'Student role with limited access to profile, attendance, and marks',
      },
      {
        name: 'PARENT',
        description: 'Parent role with access to linked children data',
      },
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

    const userSchema = new mongoose.Schema(
      {},
      { strict: false, collection: 'users' },
    );
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
    if ((await teacherCol.countDocuments()) > 0) {
      for (const t of await teacherCol.find().toArray()) {
        if (
          !(await User.findOne({
            $or: [{ _id: t._id }, { email: t.email?.toLowerCase() }],
          }))
        ) {
          const { firstName, lastName } = splitName(t.name);
          await User.create({
            _id: t._id,
            email: t.email?.toLowerCase(),
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
            updatedAt: t.updatedAt || new Date(),
            schoolId: defaultSchoolId,
          });
        }
      }
      await teacherCol.rename('backup_teachers');
    }

    // Staff
    const staffCol = db.collection('staffs');
    if ((await staffCol.countDocuments()) > 0) {
      for (const s of await staffCol.find().toArray()) {
        if (
          !(await User.findOne({
            $or: [{ _id: s._id }, { email: s.email?.toLowerCase() }],
          }))
        ) {
          const { firstName, lastName } = splitName(s.name);
          await User.create({
            _id: s._id,
            email: s.email?.toLowerCase(),
            passwordHash: defaultPasswordHash,
            firstName,
            lastName,
            phone: s.phone || '',
            role: roleIds['STAFF'],
            roleType: 'STAFF',
            isActive: s.isActive !== false,
            department: s.department || null,
            createdAt: s.createdAt || new Date(),
            updatedAt: s.updatedAt || new Date(),
            schoolId: defaultSchoolId,
          });
        }
      }
      await staffCol.rename('backup_staffs');
    }

    // Parents & Students
    const studentCol = db.collection('students');
    if ((await studentCol.countDocuments()) > 0) {
      const parentsCol = db.collection('parents');
      const parentDetailsMap = new Map();
      for (const p of await parentsCol.find().toArray()) {
        const pName =
          p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'N/A';
        parentDetailsMap.set(p._id.toString(), {
          id: p._id,
          name: pName,
          email: p.email
            ? p.email.toLowerCase()
            : `parent.${p._id.toString()}@school.com`,
          phone: p.phone || '',
          firstName: p.firstName || pName.split(/\s+/)[0] || 'N/A',
          lastName: p.lastName || pName.split(/\s+/).slice(1).join(' ') || '',
          relationshipType: p.relationshipType || 'Guardian',
          occupation: p.occupation || '',
          address: p.address || '',
        });
      }

      async function getNextSeq(counterName) {
        const result = await db
          .collection('counters')
          .findOneAndUpdate(
            { _id: counterName },
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true },
          );
        return (result.value || result).seq;
      }

      for (const st of await studentCol.find().toArray()) {
        let parentId = null,
          parentName = 'N/A';
        if (st.parent && parentDetailsMap.has(st.parent.toString())) {
          const pDet = parentDetailsMap.get(st.parent.toString());
          parentName = pDet.name;
          let parentUser = await User.findOne({ email: pDet.email });
          if (!parentUser) {
            parentUser = await User.create({
              email: pDet.email,
              passwordHash: defaultPasswordHash,
              firstName: pDet.firstName,
              lastName: pDet.lastName,
              phone: pDet.phone,
              role: roleIds['PARENT'],
              roleType: 'PARENT',
              isActive: true,
              children: [st._id],
              relationshipType: pDet.relationshipType,
              occupation: pDet.occupation,
              address: pDet.address,
              createdAt: new Date(),
              updatedAt: new Date(),
              schoolId: defaultSchoolId,
            });
          } else if (
            !(parentUser.children || [])
              .map((c) => c.toString())
              .includes(st._id.toString())
          ) {
            await User.updateOne(
              { _id: parentUser._id },
              { $addToSet: { children: st._id } },
            );
          }
          parentId = parentUser._id;
        }

        const activeYearDoc = await db
          .collection('academicyears')
          .findOne({ isActive: true });
        const activeYearId = activeYearDoc ? activeYearDoc._id : 'default';

        const admissionNumber =
          st.admissionNumber ||
          `ADM-${new Date().getFullYear()}-${String(await getNextSeq(`admission_number:${new Date().getFullYear()}`)).padStart(6, '0')}`;
        const classIdStr = st.class ? st.class.toString() : 'default';
        const yearIdStr = activeYearId.toString();
        const shortClassId =
          classIdStr.length > 6
            ? classIdStr.substring(classIdStr.length - 6)
            : classIdStr;
        const rollNumber =
          st.rollNumber ||
          `ROLL-${shortClassId}-${String(await getNextSeq(`roll_number:${classIdStr}:${yearIdStr}`)).padStart(6, '0')}`;

        const email = st.email
          ? st.email.toLowerCase()
          : `student.${admissionNumber}@school.com`;
        if (!(await User.findOne({ $or: [{ _id: st._id }, { email }] }))) {
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
            parentId: parentId,
            class: st.class || null,
            section: st.section || null,
            history: st.history || [],
            createdAt: st.createdAt || new Date(),
            updatedAt: st.updatedAt || new Date(),
            schoolId: defaultSchoolId,
          });
        }
      }
      await studentCol.rename('backup_students');

      const colls = await db.listCollections().toArray();
      const collNames = colls.map((c) => c.name);
      if (collNames.includes('parents')) {
        await db.collection('parents').rename('backup_parents');
      }
    }

    // --- PART 3: SEED ADMIN ---
    console.log('--- Step 3: Seed Admin User ---');
    let adminId;
    const existingAdmin = await User.findOne({ email: 'admin@school.com' });
    if (!existingAdmin) {
      const adminDoc = await User.create({
        email: 'admin@school.com',
        passwordHash: defaultPasswordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: roleIds['SUPER_ADMIN'],
        roleType: 'SUPER_ADMIN',
        schoolId: defaultSchoolId,
        isActive: true,
      });
      adminId = adminDoc._id;
      console.log('Created Admin User: admin@school.com');
    } else {
      adminId = existingAdmin._id;
    }

    // --- PART 4: COMPREHENSIVE UI/UX DATA GENERATION ---
    await seedMassiveData(db, defaultSchoolId, roleIds, defaultPasswordHash, adminId);
    await seedNewFeatures(db, defaultSchoolId, adminId);
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Initialization completed. Disconnected from MongoDB.');
  }
}

initDB();
