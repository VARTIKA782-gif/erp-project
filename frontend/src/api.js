// Centralized API client for AcademiaERP backend with automatic fallback
const API_BASE_URL = '/api';

// Local pre-seeded data store for when backend server is offline or proxy returns 502
let localTeachers = [
  { _id: 't1', teacherName: 'Dr. Anjali Sharma', qualification: 'Ph.D Computer Science', experience: '8 Years', subjectTaught: 'Data Structures' },
  { _id: 't2', teacherName: 'Prof. Ramesh Gupta', qualification: 'M.Tech Software Engineering', experience: '10 Years', subjectTaught: 'Web Technologies' },
  { _id: 't3', teacherName: 'Ms. Priya Singh', qualification: 'MCA, M.Sc Mathematics', experience: '4 Years', subjectTaught: 'Mathematics' },
  { _id: 't4', teacherName: 'Mr. Vikram Mehta', qualification: 'M.Tech Database Management', experience: '6 Years', subjectTaught: 'DBMS' },
];

let localSubjects = [
  { _id: 'sub1', subjectName: 'Data Structures', teacherId: 't1', teacher: localTeachers[0] },
  { _id: 'sub2', subjectName: 'Web Technologies', teacherId: 't2', teacher: localTeachers[1] },
  { _id: 'sub3', subjectName: 'Mathematics', teacherId: 't3', teacher: localTeachers[2] },
  { _id: 'sub4', subjectName: 'DBMS', teacherId: 't4', teacher: localTeachers[3] },
];

let localStudents = [
  { _id: 's1', studentName: 'Rahul Kumar', rollNumber: 'MCA001', course: 'MCA', semester: 1 },
  { _id: 's2', studentName: 'Priya Verma', rollNumber: 'MCA002', course: 'MCA', semester: 1 },
  { _id: 's3', studentName: 'Amit Singh', rollNumber: 'MCA003', course: 'MCA', semester: 2 },
  { _id: 's4', studentName: 'Sneha Patel', rollNumber: 'MCA004', course: 'MCA', semester: 3 },
  { _id: 's5', studentName: 'Rajesh Yadav', rollNumber: 'MCA005', course: 'MCA', semester: 2 },
];

let localAttendance = [
  { _id: 'a1', studentId: 's1', student: localStudents[0], subjectId: 'sub1', subject: localSubjects[0], attendanceDate: '2026-08-01', status: 'Present' },
  { _id: 'a2', studentId: 's1', student: localStudents[0], subjectId: 'sub1', subject: localSubjects[0], attendanceDate: '2026-08-03', status: 'Present' },
  { _id: 'a3', studentId: 's1', student: localStudents[0], subjectId: 'sub1', subject: localSubjects[0], attendanceDate: '2026-08-05', status: 'Absent' },
  { _id: 'a4', studentId: 's1', student: localStudents[0], subjectId: 'sub1', subject: localSubjects[0], attendanceDate: '2026-08-07', status: 'Present' },
  { _id: 'a5', studentId: 's1', student: localStudents[0], subjectId: 'sub1', subject: localSubjects[0], attendanceDate: '2026-08-10', status: 'Present' },
  { _id: 'a6', studentId: 's1', student: localStudents[0], subjectId: 'sub2', subject: localSubjects[1], attendanceDate: '2026-08-02', status: 'Present' },
  { _id: 'a7', studentId: 's1', student: localStudents[0], subjectId: 'sub2', subject: localSubjects[1], attendanceDate: '2026-08-04', status: 'Absent' },
  { _id: 'a8', studentId: 's1', student: localStudents[0], subjectId: 'sub2', subject: localSubjects[1], attendanceDate: '2026-08-06', status: 'Present' },
  { _id: 'a9', studentId: 's2', student: localStudents[1], subjectId: 'sub1', subject: localSubjects[0], attendanceDate: '2026-08-01', status: 'Present' },
  { _id: 'a10', studentId: 's2', student: localStudents[1], subjectId: 'sub1', subject: localSubjects[0], attendanceDate: '2026-08-03', status: 'Present' },
  { _id: 'a11', studentId: 's2', student: localStudents[1], subjectId: 'sub1', subject: localSubjects[0], attendanceDate: '2026-08-05', status: 'Present' },
  { _id: 'a12', studentId: 's2', student: localStudents[1], subjectId: 'sub1', subject: localSubjects[0], attendanceDate: '2026-08-07', status: 'Absent' },
  { _id: 'a13', studentId: 's3', student: localStudents[2], subjectId: 'sub3', subject: localSubjects[2], attendanceDate: '2026-08-01', status: 'Present' },
  { _id: 'a14', studentId: 's3', student: localStudents[2], subjectId: 'sub3', subject: localSubjects[2], attendanceDate: '2026-08-03', status: 'Absent' },
  { _id: 'a15', studentId: 's3', student: localStudents[2], subjectId: 'sub3', subject: localSubjects[2], attendanceDate: '2026-08-05', status: 'Absent' },
  { _id: 'a16', studentId: 's3', student: localStudents[2], subjectId: 'sub3', subject: localSubjects[2], attendanceDate: '2026-08-07', status: 'Present' },
];

function handleOfflineFallback(endpoint, options) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // 1. Authentication requires the backend.
  if (endpoint.startsWith('/auth/login')) {
    throw new Error('Login is unavailable while the backend is offline.');
  }

  // 2. Dashboard Metrics
  if (endpoint.startsWith('/dashboard')) {
    return {
      students: localStudents.length,
      teachers: localTeachers.length,
      subjects: localSubjects.length,
      attendance: localAttendance.length,
      recentAttendance: localAttendance.slice(-5).reverse()
    };
  }

  // 3. Teachers
  if (endpoint.startsWith('/teachers')) {
    if (method === 'GET') return localTeachers;
    if (method === 'POST') {
      const newT = { _id: 't_' + Date.now(), ...body };
      localTeachers.push(newT);
      return newT;
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      const idx = localTeachers.findIndex(t => t._id === id);
      if (idx !== -1) localTeachers[idx] = { ...localTeachers[idx], ...body };
      return localTeachers[idx];
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      localTeachers = localTeachers.filter(t => t._id !== id);
      return { message: 'Deleted' };
    }
  }

  // 4. Subjects
  if (endpoint.startsWith('/subjects')) {
    if (method === 'GET') {
      return localSubjects.map(sub => ({
        ...sub,
        teacher: localTeachers.find(t => t._id === sub.teacherId) || null
      }));
    }
    if (method === 'POST') {
      const newS = { _id: 'sub_' + Date.now(), ...body };
      localSubjects.push(newS);
      return newS;
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      const idx = localSubjects.findIndex(s => s._id === id);
      if (idx !== -1) localSubjects[idx] = { ...localSubjects[idx], ...body };
      return localSubjects[idx];
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      localSubjects = localSubjects.filter(s => s._id !== id);
      return { message: 'Deleted' };
    }
  }

  // 5. Students
  if (endpoint.startsWith('/students')) {
    if (method === 'GET') return localStudents;
    if (method === 'POST') {
      const newSt = { _id: 's_' + Date.now(), ...body };
      localStudents.push(newSt);
      return newSt;
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      const idx = localStudents.findIndex(s => s._id === id);
      if (idx !== -1) localStudents[idx] = { ...localStudents[idx], ...body };
      return localStudents[idx];
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      localStudents = localStudents.filter(s => s._id !== id);
      return { message: 'Deleted' };
    }
  }

  // 6. Attendance Summary
  if (endpoint.startsWith('/attendance/summary')) {
    const summaryMap = {};
    for (const att of localAttendance) {
      const key = `${att.studentId}_${att.subjectId}`;
      if (!summaryMap[key]) {
        const student = localStudents.find(s => s._id === att.studentId);
        const subject = localSubjects.find(sub => sub._id === att.subjectId);
        summaryMap[key] = {
          studentId: att.studentId,
          studentName: student ? student.studentName : 'Unknown',
          rollNumber: student ? student.rollNumber : '—',
          subjectId: att.subjectId,
          subjectName: subject ? subject.subjectName : 'Unknown',
          totalClasses: 0,
          present: 0,
          absent: 0
        };
      }
      summaryMap[key].totalClasses += 1;
      if (att.status === 'Present') summaryMap[key].present += 1;
      else summaryMap[key].absent += 1;
    }

    return Object.values(summaryMap).map(item => ({
      ...item,
      percentage: item.totalClasses > 0 ? Number(((item.present / item.totalClasses) * 100).toFixed(1)) : 0
    }));
  }

  // 7. Attendance Records
  if (endpoint.startsWith('/attendance')) {
    if (method === 'GET') {
      return localAttendance.map(a => ({
        ...a,
        student: localStudents.find(s => s._id === a.studentId),
        subject: localSubjects.find(sub => sub._id === a.subjectId)
      }));
    }
    if (method === 'POST') {
      const newA = { _id: 'a_' + Date.now(), ...body };
      localAttendance.push(newA);
      return newA;
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      const idx = localAttendance.findIndex(a => a._id === id);
      if (idx !== -1) localAttendance[idx] = { ...localAttendance[idx], ...body };
      return localAttendance[idx];
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      localAttendance = localAttendance.filter(a => a._id !== id);
      return { message: 'Deleted' };
    }
  }

  return [];
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('erp_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // If backend proxy failed (502 / 504 / 503), seamlessly use offline fallback!
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      console.warn(`[Backend Offline (${response.status})] Using instant local data store for ${endpoint}`);
      return handleOfflineFallback(endpoint, options);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/login')) {
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // If network error / backend offline, seamlessly handle via fallback!
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('502'))) {
      console.warn(`[Network/502] Using instant local data store for ${endpoint}`);
      return handleOfflineFallback(endpoint, options);
    }
    throw err;
  }
}

// Convenience methods
export const api = {
  get: (url) => apiRequest(url, { method: 'GET' }),
  post: (url, body) => apiRequest(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => apiRequest(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => apiRequest(url, { method: 'DELETE' }),
};
