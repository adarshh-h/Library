import { useState, useEffect } from 'react'
import { studentAPI } from '../../api/services'
import { PageLoader, EmptyState, StatusBadge } from '../../components/ui'
import { BookOpen, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function StudentDashboard() {
  const { user }  = useAuth()
  const [books, setBooks]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentAPI.getIssuedBooks()
      .then(({ data }) => setBooks(data.books || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const overdue   = books.filter(b => b.isOverdue)
  const current   = books.filter(b => !b.isOverdue)
  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
  const daysLeft = d => Math.ceil((new Date(d) - new Date()) / 86400000)

  if (loading) return <PageLoader />

  return (
    <div className="animate-in page-container">
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="page-subtitle">Your currently issued books</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="stat-card">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <span className="stat-value">{books.length}</span>
          <span className="stat-label">Books issued</span>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-2">
            <Clock className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="stat-value">{current.length}</span>
          <span className="stat-label">On time</span>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <span className="stat-value">{overdue.length}</span>
          <span className="stat-label">Overdue</span>
        </div>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">You have {overdue.length} overdue book{overdue.length > 1 ? 's' : ''}</p>
            <p className="text-xs text-red-600 mt-0.5">Please return them to the library as soon as possible.</p>
          </div>
        </div>
      )}

      {books.length === 0 ? (
        <EmptyState icon={BookOpen} title="No books issued" description="Visit the library to borrow books." />
      ) : (
        <div className="space-y-3">
          {books.map(b => {
            const dl = daysLeft(b.dueDate)
            const overdue = b.isOverdue || dl < 0
            return (
              <div key={b.issuedBookId || b._id}
                className={`card p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 ${overdue ? 'border-red-100 bg-red-50/30' : ''}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${overdue ? 'bg-red-100' : 'bg-primary-50'}`}>
                  <BookOpen className={`h-5 w-5 ${overdue ? 'text-red-500' : 'text-primary-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 w-full">
                    <div>
                      <p className="font-semibold text-neutral-800">{b.bookName}</p>
                      <p className="text-sm text-neutral-400 mt-0.5">{b.authorName}</p>
                    </div>
                    <StatusBadge overdue={overdue} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-neutral-400">
                    <span>Issued: {fmt(b.issueDate)}</span>
                    <span className={overdue ? 'text-red-500 font-medium' : ''}>
                      Due: {fmt(b.dueDate)} {!overdue && `(${dl}d left)`} {overdue && '(Overdue)'}
                    </span>
                    <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded">{b.accessionNumber}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
