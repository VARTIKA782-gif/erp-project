require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminUser = require('./models/AdminUser');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_academic_db';

async function seedDatabase() {
  try {
    const { ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET } = process.env;
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
      throw new Error('ADMIN_USERNAME, ADMIN_PASSWORD, and JWT_SECRET must be set in the backend environment.');
    }

    console.log(`Connecting to MongoDB: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB.');

    // Clear existing data
    await Promise.all([
      AdminUser.deleteMany({}),
      Student.deleteMany({}),
      Teacher.deleteMany({}),
      Subject.deleteMany({}),
      Attendance.deleteMany({}),
    ]);
    console.log('Cleared existing collections.');

    // 1. Seed Admin Users
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = await AdminUser.create({
      username: ADMIN_USERNAME,
      password: hashedPassword,
    });
    console.log(` Seeded Admin user: ${admin.username}`);

    // 2. Seed Teachers
    const teachersData = [
      { teacherName: 'Dr. Anjali Sharma',  qualification: 'Ph.D Computer Science',       subjectTaught: 'Data Structures' },
      { teacherName: 'Prof. Ramesh Gupta', qualification: 'M.Tech Software Engineering', subjectTaught: 'Web Technologies' },
      { teacherName: 'Ms. Priya Singh',    qualification: 'MCA, M.Sc Mathematics',       subjectTaught: 'Mathematics' },
      { teacherName: 'Mr. Vikram Mehta',   qualification: 'M.Tech Database Management',  subjectTaught: 'DBMS' },
    ];
    const teachers = await Teacher.insertMany(teachersData);
    console.log(` Seeded ${teachers.length} teachers.`);

    // 3. Seed Subjects (linked to teachers)
    const subjectsData = [
      { subjectName: 'Data Structures',  teacherId: teachers[0]._id },
      { subjectName: 'Web Technologies', teacherId: teachers[1]._id },
      { subjectName: 'Mathematics',      teacherId: teachers[2]._id },
      { subjectName: 'DBMS',             teacherId: teachers[3]._id },
    ];
    const subjects = await Subject.insertMany(subjectsData);
    console.log(` Seeded ${subjects.length} subjects.`);

    // 4. Seed Students
    const studentsData = [
      { studentName: 'Rahul Kumar',  rollNumber: 'MCA001', course: 'MCA', semester: 1 },
      { studentName: 'Priya Verma',  rollNumber: 'MCA002', course: 'MCA', semester: 1 },
      { studentName: 'Amit Singh',   rollNumber: 'MCA003', course: 'MCA', semester: 2 },
      { studentName: 'Sneha Patel',  rollNumber: 'MCA004', course: 'MCA', semester: 3 },
      { studentName: 'Rajesh Yadav', rollNumber: 'MCA005', course: 'MCA', semester: 2 },
    ];
    const students = await Student.insertMany(studentsData);
    console.log(` Seeded ${students.length} students.`);

    // 5. Seed Attendance Records
    const attendanceData = [
      { studentId: students[0]._id, subjectId: subjects[0]._id, attendanceDate: new Date('2026-08-01'), status: 'Present' },
      { studentId: students[0]._id, subjectId: subjects[0]._id, attendanceDate: new Date('2026-08-03'), status: 'Present' },
      { studentId: students[0]._id, subjectId: subjects[0]._id, attendanceDate: new Date('2026-08-05'), status: 'Absent' },
      { studentId: students[0]._id, subjectId: subjects[0]._id, attendanceDate: new Date('2026-08-07'), status: 'Present' },
      { studentId: students[0]._id, subjectId: subjects[0]._id, attendanceDate: new Date('2026-08-10'), status: 'Present' },
      { studentId: students[0]._id, subjectId: subjects[1]._id, attendanceDate: new Date('2026-08-02'), status: 'Present' },
      { studentId: students[0]._id, subjectId: subjects[1]._id, attendanceDate: new Date('2026-08-04'), status: 'Absent' },
      { studentId: students[0]._id, subjectId: subjects[1]._id, attendanceDate: new Date('2026-08-06'), status: 'Present' },
      { studentId: students[1]._id, subjectId: subjects[0]._id, attendanceDate: new Date('2026-08-01'), status: 'Present' },
      { studentId: students[1]._id, subjectId: subjects[0]._id, attendanceDate: new Date('2026-08-03'), status: 'Present' },
      { studentId: students[1]._id, subjectId: subjects[0]._id, attendanceDate: new Date('2026-08-05'), status: 'Present' },
      { studentId: students[1]._id, subjectId: subjects[0]._id, attendanceDate: new Date('2026-08-07'), status: 'Absent' },
      { studentId: students[2]._id, subjectId: subjects[2]._id, attendanceDate: new Date('2026-08-01'), status: 'Present' },
      { studentId: students[2]._id, subjectId: subjects[2]._id, attendanceDate: new Date('2026-08-03'), status: 'Absent' },
      { studentId: students[2]._id, subjectId: subjects[2]._id, attendanceDate: new Date('2026-08-05'), status: 'Absent' },
      { studentId: students[2]._id, subjectId: subjects[2]._id, attendanceDate: new Date('2026-08-07'), status: 'Present' },
    ];
    const attendance = await Attendance.insertMany(attendanceData);
    console.log(` Seeded ${attendance.length} attendance records.`);

    console.log('\n Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error(' Seeding failed:', err.message);
    process.exit(1);
  }
}

seedDatabase();
