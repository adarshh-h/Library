import { useState } from 'react'
import { issueAPI } from '../../api/services'
import { Alert, Spinner, FormField } from '../../components/ui'
import { Search, BookMarked, User, Plus, X, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function IssueBooks() {
  const [rollInput, setRollInput]   = useState('')
  const [accInput, setAccInput]     = useState('')
  const [student, setStudent]       = useState(null)
  const [books, setBooks]           = useState([])
  const [issueDate, setIssueDate]   = useState(today())
  const [dueDate, setDueDate]       = useState(daysFromNow(14))
  const [studentErr, setStudentErr] = useState('')
  const [bookErr, setBookErr]       = useState('')
  const [issueErr, setIssueErr]     = useState('')
  const [loading, setLoading]       = useState({ student: false, book: false, issue: false })
  const [success, setSuccess]       = useState(false)

  function today() { return new Date().toISOString().split('T')[0] }
  function daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0] }

  const searchStudent = async () => {
    if (!rollInput.trim()) return
    setLoading(l => ({ ...l, student: true })); setStudentErr('')
    try {
      const { data } = await issueAPI.getStudentByRoll(rollInput.trim())
      setStudent(data.student)
    } catch (err) { setStudentErr(err.response?.data?.message || 'Student not found'); setStudent(null) }
    finally { setLoading(l => ({ ...l, student: false })) }
  }

  const searchBook = async () => {
    if (!accInput.trim()) return
    setLoading(l => ({ ...l, book: true })); setBookErr('')
    try {
      const { data } = await issueAPI.getBookByAccession(accInput.trim())
      if (!data.book.isAvailable) { setBookErr('This book is currently issued to another student.'); return }
      if (books.find(b => b._id === data.book._id)) { setBookErr('Book already added.'); return }
      if (books.length >= 3) { setBookErr('Maximum 3 books per issuance.'); return }
      setBooks(prev => [...prev, data.book])
      setAccInput('')
    } catch (err) { setBookErr(err.response?.data?.message || 'Book not found') }
    finally { setLoading(l => ({ ...l, book: false })) }
  }

  const handleIssue = async () => {
    if (!student || !books.length) return
    setLoading(l => ({ ...l, issue: true })); setIssueErr('')
    try {
      await issueAPI.issueBooks({ studentId: student._id, bookIds: books.map(b => b._id), issueDate, dueDate })
      setSuccess(true)
    } catch (err) { setIssueErr(err.response?.data?.message || 'Failed to issue books') }
    finally { setLoading(l => ({ ...l, issue: false })) }
  }

  const reset = () => { setStudent(null); setBooks([]); setRollInput(''); setAccInput(''); setStudentErr(''); setBookErr(''); setIssueErr(''); setSuccess(false); setDueDate(daysFromNow(14)) }

  if (success) return (
    <div className="animate-in page-container page-container--workflow">
      <div className="py-8 sm:py-12">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-neutral-900 mb-2">Books issued successfully!</h2>
        <p className="text-neutral-500 text-sm mb-2">{books.length} book(s) issued to <strong>{student?.name}</strong></p>
        <p className="text-neutral-400 text-xs mb-8">Due date: {new Date(dueDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
        <button onClick={reset} className="btn-primary">Issue more books</button>
      </div>
    </div>
  )

  return (
    <div className="animate-in page-container page-container--workflow">
      <div className="page-header">
        <h1 className="page-title">Issue Books</h1>
        <p className="page-subtitle">Search a student and add books to issue</p>
      </div>

      {/* Step 1: Student */}
      <div className="card p-4 sm:p-6 mb-4">
        <h3 className="font-serif font-semibold text-neutral-800 mb-4 flex items-center gap-2 text-sm sm:text-base">
          <User className="h-4 w-4 text-brand-600 shrink-0" /> Step 1 — Find student
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input className="input flex-1" placeholder="Roll number (e.g. CS2101)" value={rollInput}
            onChange={e => setRollInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchStudent()} />
          <button onClick={searchStudent} disabled={loading.student} className="btn-primary px-4 justify-center sm:w-auto w-full">
            {loading.student ? <Spinner size="sm" /> : <Search className="h-4 w-4" />}
          </button>
        </div>
        <Alert type="error" message={studentErr} />
        {student && (
          <div className="mt-4 flex flex-wrap items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {student.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-emerald-900 break-words">{student.name}</p>
              <p className="text-xs text-emerald-600 break-words">{student.rollNumber} · {student.department} · {student.batch}</p>
            </div>
            <button type="button" onClick={() => { setStudent(null); setRollInput('') }} className="shrink-0 p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg" aria-label="Clear student">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Step 2: Books */}
      <div className="card p-4 sm:p-6 mb-4">
        <h3 className="font-serif font-semibold text-neutral-800 mb-4 flex items-center gap-2 text-sm sm:text-base">
          <BookMarked className="h-4 w-4 text-brand-600 shrink-0" /> Step 2 — Add books (max 3)
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input className="input flex-1" placeholder="Accession number" value={accInput}
            onChange={e => setAccInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchBook()} />
          <button onClick={searchBook} disabled={loading.book || books.length >= 3} className="btn-primary px-4 justify-center sm:w-auto w-full">
            {loading.book ? <Spinner size="sm" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
        <Alert type="error" message={bookErr} />
        {books.length > 0 && (
          <div className="mt-3 space-y-2">
            {books.map(b => (
              <div key={b._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
                <BookMarked className="h-4 w-4 text-brand-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{b.bookName}</p>
                  <p className="text-xs text-neutral-400">{b.accessionNumber} · {b.authorName}</p>
                </div>
                <button onClick={() => setBooks(prev => prev.filter(x => x._id !== b._id))} className="text-neutral-300 hover:text-red-400 transition-colors"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 3: Dates */}
      <div className="card p-4 sm:p-6 mb-4">
        <h3 className="font-serif font-semibold text-neutral-800 mb-4">Step 3 — Set dates</h3>
        <div className="form-grid">
          <FormField label="Issue date">
            <input type="date" className="input" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
          </FormField>
          <FormField label="Due date">
            <input type="date" className="input" value={dueDate} min={issueDate} onChange={e => setDueDate(e.target.value)} />
          </FormField>
        </div>
      </div>

      <Alert type="error" message={issueErr} />

      <button type="button" onClick={handleIssue} disabled={!student || !books.length || loading.issue}
        className="btn-primary w-full justify-center py-3 text-sm sm:text-base mt-2">
        {loading.issue ? <Spinner size="sm" /> : `Issue ${books.length} book${books.length !== 1 ? 's' : ''}${student?.name ? ` to ${student.name.split(' ')[0]}` : ''}`}
      </button>
    </div>
  )
}
