import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LibrarianLayout from './layouts/LibrarianLayout'
import StudentLayout   from './layouts/StudentLayout'

import Landing          from './pages/Landing'
import LibrarianLogin   from './pages/auth/LibrarianLogin'
import StudentLogin     from './pages/auth/StudentLogin'

import LibrarianDashboard from './pages/librarian/Dashboard'
import Students           from './pages/librarian/Students'
import Books              from './pages/librarian/Books'
import IssueBooks         from './pages/librarian/IssueBooks'
import ReturnBooks        from './pages/librarian/ReturnBooks'
import HistoryPage        from './pages/librarian/History'
import AddLibrarian       from './pages/librarian/AddLibrarian'
import LibrarianProfile   from './pages/librarian/Profile'

import StudentDashboard from './pages/student/Dashboard'
import StudentHistory   from './pages/student/History'
import StudentProfile   from './pages/student/Profile'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/"                  element={<Landing />} />
        <Route path="/librarian/login"   element={<LibrarianLogin />} />
        <Route path="/student/login"     element={<StudentLogin />} />

        {/* Librarian portal */}
        <Route path="/librarian" element={
          <ProtectedRoute role="librarian">
            <LibrarianLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"  element={<LibrarianDashboard />} />
          <Route path="students"   element={<Students />} />
          <Route path="books"      element={<Books />} />
          <Route path="issue"      element={<IssueBooks />} />
          <Route path="return"     element={<ReturnBooks />} />
          <Route path="history"    element={<HistoryPage />} />
          <Route path="librarians" element={<AddLibrarian />} />
          <Route path="profile"    element={<LibrarianProfile />} />
        </Route>

        {/* Student portal */}
        <Route path="/student" element={
          <ProtectedRoute role="student">
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="history"   element={<StudentHistory />} />
          <Route path="profile"   element={<StudentProfile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
