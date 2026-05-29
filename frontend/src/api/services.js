import api from './axios'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  librarianLogin:  (data) => api.post('/auth/librarian-login', data),
  studentLogin:    (data) => api.post('/auth/student-login', data),
  logout:          ()     => api.post('/auth/logout'),
  checkSession:    ()     => api.get('/auth/check-session'),
  forgotPassword:  (data) => api.post('/auth/forgot-password', data),
  verifyOtp:       (data) => api.post('/auth/verify-otp', data),
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getProfile:     ()       => api.get('/admin/profile'),
  updateProfile:  (data)   => api.put('/admin/profile', data),
  changePassword: (data)   => api.post('/admin/change-password', data),
  createLibrarian:(data)   => api.post('/admin/create-librarian', data),

  createStudent:  (data)   => api.post('/admin/create-student', data),
  getStudents:    (params) => api.get('/admin/students', { params }),
  getStudentById: (id)     => api.get(`/admin/students/${id}`),
  updateStudent:  (id, d)  => api.put(`/admin/students/${id}`, d),
  deleteStudent:  (id)     => api.delete(`/admin/students/${id}`),
  resetPassword:  (id)     => api.post(`/admin/students/${id}/reset-password`),
  bulkImportStudents: (file) => {
    const form = new FormData(); form.append('file', file)
    return api.post('/admin/bulk-import-students', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

// ─── Books ────────────────────────────────────────────────────────────────────
export const bookAPI = {
  getAll:     (params) => api.get('/books', { params }),
  update:     (id, d)  => api.put(`/books/${id}`, d),
  delete:     (id)     => api.delete(`/books/${id}`),
  bulkImport: (file)   => {
    const form = new FormData(); form.append('file', file)
    return api.post('/books/bulk-import', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

// ─── Issues ───────────────────────────────────────────────────────────────────
export const issueAPI = {
  getBookByAccession: (acc)  => api.get(`/issues/book/${acc}`),
  getStudentByRoll:   (roll) => api.get(`/issues/student-by-roll/${roll}`),
  issueBooks:         (data) => api.post('/issues/issue', data),
}

// ─── Returns ──────────────────────────────────────────────────────────────────
export const returnAPI = {
  getUnreturned: (studentId) => api.get(`/returns/student/${studentId}`),
  returnBook:    (data)      => api.post('/returns', data),
}

// ─── History ──────────────────────────────────────────────────────────────────
export const historyAPI = {
  getHistory: (studentId) => api.get(`/history/history/${studentId}`),
}

// ─── Student ──────────────────────────────────────────────────────────────────
export const studentAPI = {
  getProfile:     ()     => api.get('/student/profile'),
  updateProfile:  (data) => api.put('/student/profile', data),
  changePassword: (data) => api.post('/student/change-password', data),
  getIssuedBooks: ()     => api.get('/student/issued-books'),
  getHistory:     ()     => api.get('/student/history'),
}
