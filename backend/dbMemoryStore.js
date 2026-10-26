// In-memory fallback data store for when local MongoDB daemon is not running.
// Allows complete application testing and evaluation out of the box.

let teachers = [
  { _id: 't1', teacherName: 'Dr. Anjali Sharma', qualification: 'Ph.D Computer Science', experience: '8 Years', subjectTaught: 'Data Structures' },
  { _id: 't2', teacherName: 'Prof. Ramesh Gupta', qualification: 'M.Tech Software Engineering', experience: '10 Years', subjectTaught: 'Web Technologies' },
  { _id: 't3', teacherName: 'Ms. Priya Singh', qualification: 'MCA, M.Sc Mathematics', experience: '4 Years', subjectTaught: 'Mathematics' },
  { _id: 't4', teacherName: 'Mr. Vikram Mehta', qualification: 'M.Tech Database Management', experience: '6 Years', subjectTaught: 'DBMS' },
];

let subjects = [
  { _id: 'sub1', subjectName: 'Data Structures', teacherId: 't1' },
  { _id: 'sub2', subjectName: 'Web Technologies', teacherId: 't2' },
  { _id: 'sub3', subjectName: 'Mathematics', teacherId: 't3' },
  { _id: 'sub4', subjectName: 'DBMS', teacherId: 't4' },
];

let students = [
  { _id: 's1', studentName: 'Rahul Kumar', rollNumber: 'MCA001', course: 'MCA', semester: 1 },
  { _id: 's2', studentName: 'Priya Verma', rollNumber: 'MCA002', course: 'MCA', semester: 1 },
  { _id: 's3', studentName: 'Amit Singh', rollNumber: 'MCA003', course: 'MCA', semester: 2 },
  { _id: 's4', studentName: 'Sneha Patel', rollNumber: 'MCA004', course: 'MCA', semester: 3 },
  { _id: 's5', studentName: 'Rajesh Yadav', rollNumber: 'MCA005', course: 'MCA', semester: 2 },
];

let attendance = [
  { _id: 'a1', studentId: 's1', subjectId: 'sub1', attendanceDate: '2026-08-01', status: 'Present' },
  { _id: 'a2', studentId: 's1', subjectId: 'sub1', attendanceDate: '2026-08-03', status: 'Present' },
  { _id: 'a3', studentId: 's1', subjectId: 'sub1', attendanceDate: '2026-08-05', status: 'Absent' },
  { _id: 'a4', studentId: 's1', subjectId: 'sub1', attendanceDate: '2026-08-07', status: 'Present' },
  { _id: 'a5', studentId: 's1', subjectId: 'sub1', attendanceDate: '2026-08-10', status: 'Present' },
  { _id: 'a6', studentId: 's1', subjectId: 'sub2', attendanceDate: '2026-08-02', status: 'Present' },
  { _id: 'a7', studentId: 's1', subjectId: 'sub2', attendanceDate: '2026-08-04', status: 'Absent' },
  { _id: 'a8', studentId: 's1', subjectId: 'sub2', attendanceDate: '2026-08-06', status: 'Present' },
  { _id: 'a9', studentId: 's2', subjectId: 'sub1', attendanceDate: '2026-08-01', status: 'Present' },
  { _id: 'a10', studentId: 's2', subjectId: 'sub1', attendanceDate: '2026-08-03', status: 'Present' },
  { _id: 'a11', studentId: 's2', subjectId: 'sub1', attendanceDate: '2026-08-05', status: 'Present' },
  { _id: 'a12', studentId: 's2', subjectId: 'sub1', attendanceDate: '2026-08-07', status: 'Absent' },
  { _id: 'a13', studentId: 's3', subjectId: 'sub3', attendanceDate: '2026-08-01', status: 'Present' },
  { _id: 'a14', studentId: 's3', subjectId: 'sub3', attendanceDate: '2026-08-03', status: 'Absent' },
  { _id: 'a15', studentId: 's3', subjectId: 'sub3', attendanceDate: '2026-08-05', status: 'Absent' },
  { _id: 'a16', studentId: 's3', subjectId: 'sub3', attendanceDate: '2026-08-07', status: 'Present' },
];

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

const memoryStore = {
  // Dashboard
  getCounts: () => ({
    students: students.length,
    teachers: teachers.length,
    subjects: subjects.length,
    attendance: attendance.length,
  }),

  // Students
  getStudents: (filter = {}) => {
    return students.filter((s) => {
      if (filter.course && s.course.toLowerCase() !== filter.course.toLowerCase()) return false;
      if (filter.semester && s.semester !== Number(filter.semester)) return false;
      if (filter.search) {
        const term = filter.search.toLowerCase();
        return (
          s.studentName.toLowerCase().includes(term) ||
          s.rollNumber.toLowerCase().includes(term) ||
          s.course.toLowerCase().includes(term)
        );
      }
      return true;
    });
  },

  createStudent: ({ studentName, rollNumber, course, semester }) => {
    const existing = students.find((s) => s.rollNumber.toLowerCase() === rollNumber.trim().toLowerCase());
    if (existing) throw new Error(`Roll number '${rollNumber}' is already registered.`);
    const newStudent = {
      _id: generateId('stu'),
      studentName: studentName.trim(),
      rollNumber: rollNumber.trim(),
      course: course.trim(),
      semester: Number(semester),
    };
    students.push(newStudent);
    return newStudent;
  },

  updateStudent: (id, { studentName, rollNumber, course, semester }) => {
    const idx = students.findIndex((s) => s._id === id);
    if (idx === -1) throw new Error('Student not found.');
    if (rollNumber && rollNumber.trim() !== students[idx].rollNumber) {
      const duplicate = students.find((s) => s.rollNumber.toLowerCase() === rollNumber.trim().toLowerCase() && s._id !== id);
      if (duplicate) throw new Error(`Roll number '${rollNumber}' is already in use.`);
      students[idx].rollNumber = rollNumber.trim();
    }
    if (studentName) students[idx].studentName = studentName.trim();
    if (course) students[idx].course = course.trim();
    if (semester !== undefined) students[idx].semester = Number(semester);
    return students[idx];
  },

  deleteStudent: (id) => {
    const idx = students.findIndex((s) => s._id === id);
    if (idx === -1) throw new Error('Student not found.');
    students.splice(idx, 1);
    attendance = attendance.filter((a) => a.studentId !== id);
    return true;
  },

  // Teachers
  getTeachers: (search) => {
    if (!search) return [...teachers];
    const term = search.toLowerCase();
    return teachers.filter(
      (t) =>
        t.teacherName.toLowerCase().includes(term) ||
        t.qualification.toLowerCase().includes(term) ||
        t.subjectTaught.toLowerCase().includes(term)
    );
  },

  createTeacher: ({ teacherName, qualification, subjectTaught }) => {
    const newTeacher = {
      _id: generateId('t'),
      teacherName: teacherName.trim(),
      qualification: qualification.trim(),
      subjectTaught: subjectTaught.trim(),
    };
    teachers.push(newTeacher);
    return newTeacher;
  },

  updateTeacher: (id, { teacherName, qualification, subjectTaught }) => {
    const idx = teachers.findIndex((t) => t._id === id);
    if (idx === -1) throw new Error('Teacher not found.');
    if (teacherName) teachers[idx].teacherName = teacherName.trim();
    if (qualification) teachers[idx].qualification = qualification.trim();
    if (subjectTaught) teachers[idx].subjectTaught = subjectTaught.trim();
    return teachers[idx];
  },

  deleteTeacher: (id) => {
    const idx = teachers.findIndex((t) => t._id === id);
    if (idx === -1) throw new Error('Teacher not found.');
    teachers.splice(idx, 1);
    subjects.forEach((sub) => {
      if (sub.teacherId === id) sub.teacherId = null;
    });
    return true;
  },

  // Subjects
  getSubjects: (search) => {
    let result = subjects.map((sub) => {
      const teacher = teachers.find((t) => t._id === sub.teacherId) || null;
      return {
        ...sub,
        teacherId: teacher,
      };
    });
    if (search) {
      const term = search.toLowerCase();
      result = result.filter((s) => s.subjectName.toLowerCase().includes(term));
    }
    return result;
  },

  createSubject: ({ subjectName, teacherId }) => {
    const newSubject = {
      _id: generateId('sub'),
      subjectName: subjectName.trim(),
      teacherId: teacherId || null,
    };
    subjects.push(newSubject);
    const teacher = teachers.find((t) => t._id === newSubject.teacherId) || null;
    return { ...newSubject, teacherId: teacher };
  },

  updateSubject: (id, { subjectName, teacherId }) => {
    const idx = subjects.findIndex((s) => s._id === id);
    if (idx === -1) throw new Error('Subject not found.');
    if (subjectName) subjects[idx].subjectName = subjectName.trim();
    subjects[idx].teacherId = teacherId || null;
    const teacher = teachers.find((t) => t._id === subjects[idx].teacherId) || null;
    return { ...subjects[idx], teacherId: teacher };
  },

  deleteSubject: (id) => {
    const idx = subjects.findIndex((s) => s._id === id);
    if (idx === -1) throw new Error('Subject not found.');
    subjects.splice(idx, 1);
    attendance = attendance.filter((a) => a.subjectId !== id);
    return true;
  },

  // Attendance
  getAttendance: (filter = {}) => {
    return attendance
      .filter((a) => {
        if (filter.studentId && a.studentId !== filter.studentId) return false;
        if (filter.subjectId && a.subjectId !== filter.subjectId) return false;
        if (filter.status && a.status !== filter.status) return false;
        if (filter.date && !a.attendanceDate.startsWith(filter.date)) return false;
        return true;
      })
      .map((a) => {
        const student = students.find((s) => s._id === a.studentId) || null;
        const subject = subjects.find((sub) => sub._id === a.subjectId) || null;
        return {
          ...a,
          studentId: student,
          subjectId: subject,
        };
      })
      .sort((a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate));
  },

  getAttendanceSummary: (filter = {}) => {
    const groups = {};
    attendance.forEach((a) => {
      if (filter.studentId && a.studentId !== filter.studentId) return;
      if (filter.subjectId && a.subjectId !== filter.subjectId) return;

      const key = `${a.studentId}_${a.subjectId}`;
      if (!groups[key]) {
        const stu = students.find((s) => s._id === a.studentId);
        const sub = subjects.find((s) => s._id === a.subjectId);
        if (!stu || !sub) return;
        groups[key] = {
          studentId: a.studentId,
          studentName: stu.studentName,
          rollNumber: stu.rollNumber,
          course: stu.course,
          semester: stu.semester,
          subjectId: a.subjectId,
          subjectName: sub.subjectName,
          totalClasses: 0,
          presentCount: 0,
          absentCount: 0,
        };
      }
      groups[key].totalClasses += 1;
      if (a.status === 'Present') groups[key].presentCount += 1;
      else groups[key].absentCount += 1;
    });

    return Object.values(groups).map((g) => ({
      ...g,
      percentage: g.totalClasses > 0 ? Math.round((g.presentCount / g.totalClasses) * 1000) / 10 : 0,
    })).sort((a, b) => a.studentName.localeCompare(b.studentName));
  },

  createAttendance: (body) => {
    if (Array.isArray(body.records)) {
      const created = body.records.map((r) => {
        const rec = {
          _id: generateId('att'),
          studentId: r.studentId,
          subjectId: r.subjectId,
          attendanceDate: r.attendanceDate || new Date().toISOString().split('T')[0],
          status: r.status === 'Absent' ? 'Absent' : 'Present',
        };
        attendance.push(rec);
        return rec;
      });
      return { message: `Recorded ${created.length} attendance entries.`, count: created.length };
    }

    const rec = {
      _id: generateId('att'),
      studentId: body.studentId,
      subjectId: body.subjectId,
      attendanceDate: body.attendanceDate || new Date().toISOString().split('T')[0],
      status: body.status === 'Absent' ? 'Absent' : 'Present',
    };
    attendance.push(rec);
    const stu = students.find((s) => s._id === rec.studentId);
    const sub = subjects.find((s) => s._id === rec.subjectId);
    return { ...rec, studentId: stu, subjectId: sub };
  },

  updateAttendance: (id, { status, attendanceDate }) => {
    const idx = attendance.findIndex((a) => a._id === id);
    if (idx === -1) throw new Error('Attendance record not found.');
    if (status) attendance[idx].status = status;
    if (attendanceDate) attendance[idx].attendanceDate = attendanceDate;
    const stu = students.find((s) => s._id === attendance[idx].studentId);
    const sub = subjects.find((s) => s._id === attendance[idx].subjectId);
    return { ...attendance[idx], studentId: stu, subjectId: sub };
  },

  deleteAttendance: (id) => {
    const idx = attendance.findIndex((a) => a._id === id);
    if (idx === -1) throw new Error('Attendance record not found.');
    attendance.splice(idx, 1);
    return true;
  },
};

module.exports = memoryStore;
