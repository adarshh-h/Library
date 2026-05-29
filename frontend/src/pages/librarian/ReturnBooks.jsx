import { useState } from 'react'
import { issueAPI, returnAPI } from '../../api/services'
import { Alert, Spinner, EmptyState, ConfirmDialog } from '../../components/ui'
import { Search, CornerUpLeft, User, BookOpen, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReturnBooks() {
  const [rollInput, setRollInput]   = useState('')
  const [student, setStudent]       = useState(null)
  const [books, setBooks]           = useState([])
  const [studentErr, setStudentErr] = useState('')
  const [loading, setLoading]       = useState({ student: false, return: false })
  const [confirmBook, setConfirmBook] = useState(null)

  const searchStudent = async () => {
    if (!rollInput.trim()) return
    setLoading(l => ({ ...l, student: true })); setStudentErr(''); setBooks([])
    try {
      const { data: sd } = await issueAPI.getStudentByRoll(rollInput.trim())
      setStudent(sd.student)
      const { data: rd } = await returnAPI.getUnreturned(sd.student._id)
      setBooks(rd.books || [])
    } catch (err) { setStudentErr(err.response?.data?.message || 'Student not found'); setStudent(null) }
    finally { setLoading(l => ({ ...l, student: false })) }
  }

  const handleReturn = async () => {
    if (!confirmBook) return
    setLoading(l => ({ ...l, return: true }))
    try {
      await returnAPI.returnBook({ studentId: student._id, issueId: confirmBook.issueId, issuedBookId: confirmBook.issuedBookId })
      toast.success(`"${confirmBook.bookName}" returned successfully`)
      setBooks(prev => prev.filter(b => b.issuedBookId !== confirmBook.issuedBookId))
      setConfirmBook(null)
    } catch (err) { toast.error(err.response?.data?.message || 'Return failed') }
    finally { setLoading(l => ({ ...l, return: false })) }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="animate-in page-container page-container--workflow">
      <div className="page-header">
        <h1 className="page-title">Return Books</h1>
        <p className="page-subtitle">Search a student to process book returns</p>
      </div>

      <div className="card p-4 sm:p-6 mb-4">
        <h3 className="font-serif font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-brand-600" /> Find student
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input className="input flex-1" placeholder="Roll number" value={rollInput}
            onChange={e => setRollInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchStudent()} />
          <button onClick={searchStudent} disabled={loading.student} className="btn-primary px-4 justify-center sm:w-auto w-full">
            {loading.student ? <Spinner size="sm" /> : <Search className="h-4 w-4" />}
          </button>
        </div>
        <Alert type="error" message={studentErr} />

        {student && (
          <div className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="w-9 h-9 rounded-full bg-brand-700 flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {student.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-brand-900 break-words">{student.name}</p>
              <p className="text-xs text-brand-600 break-words">{student.rollNumber} · {student.department}</p>
            </div>
          </div>
        )}
      </div>

      {student && (
        <div className="card overflow-hidden">
          <div className="panel-header">
            <h3 className="font-serif font-semibold text-neutral-800 text-base">Issued books</h3>
            <span className="badge-blue shrink-0">{books.length} unreturned</span>
          </div>

          {books.length === 0 ? (
            <EmptyState icon={CheckCircle} title="All books returned" description="This student has no pending returns." />
          ) : (
            <div className="divide-y divide-neutral-50">
              {books.map(b => {
                const overdue = b.isOverdue || new Date(b.dueDate) < new Date()
                return (
                  <div key={b.issuedBookId} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4">
                    <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-800 truncate">{b.bookName}</p>
                      <p className="text-xs text-neutral-400">{b.accessionNumber} · {b.authorName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-neutral-400">Due: {formatDate(b.dueDate)}</span>
                        {overdue && <span className="badge-red">Overdue</span>}
                      </div>
                    </div>
                    <button type="button" onClick={() => setConfirmBook(b)} className="btn-secondary text-xs px-3 py-2.5 w-full sm:w-auto justify-center shrink-0">
                      <CornerUpLeft className="h-3.5 w-3.5" /> Return
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmBook} onClose={() => setConfirmBook(null)} onConfirm={handleReturn}
        title="Confirm return"
        message={`Mark "${confirmBook?.bookName}" as returned by ${student?.name}?`}
        confirmLabel={loading.return ? 'Processing…' : 'Confirm return'}
      />
    </div>
  )
}
