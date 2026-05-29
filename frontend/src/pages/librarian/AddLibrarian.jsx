import { useState } from 'react'
import { adminAPI } from '../../api/services'
import { Alert, Spinner, FormField } from '../../components/ui'
import { UserPlus, CheckCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AddLibrarian() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', department:'', password:'' })
  const [err, setErr]   = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(null)
  const [showPw, setShowPw]   = useState(false)

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const { data } = await adminAPI.createLibrarian(form)
      setCreated(data)
      toast.success('Librarian account created!')
      setForm({ name:'', email:'', phone:'', department:'', password:'' })
    } catch (err) { setErr(err.response?.data?.message || 'Failed to create librarian') }
    finally { setLoading(false) }
  }

  return (
    <div className="animate-in page-container page-container--form">
      <div className="page-header">
        <h1 className="page-title">Add Librarian</h1>
        <p className="page-subtitle">Create a new librarian account</p>
      </div>

      {created && (
        <div className="card p-5 mb-6 border-emerald-100 bg-emerald-50">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <p className="font-semibold text-emerald-800">Librarian created successfully!</p>
          </div>
          <p className="text-sm text-emerald-700">{created.librarian?.name || created.name} — <span className="font-mono">{created.librarian?.email || created.email}</span></p>
          <button onClick={() => setCreated(null)} className="mt-3 text-xs text-emerald-600 hover:underline">Add another</button>
        </div>
      )}

      <div className="form-section">
        <Alert type="error" message={err} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-grid">
            <FormField label="Full name">
              <input className="input" value={form.name} onChange={f('name')} required placeholder="Dr. Anjali Singh" />
            </FormField>
            <FormField label="Phone">
              <input className="input" value={form.phone} onChange={f('phone')} required placeholder="9876543210" />
            </FormField>
          </div>
          <FormField label="Email address">
            <input className="input" type="email" value={form.email} onChange={f('email')} required placeholder="librarian@hnbgu.ac.in" />
          </FormField>
          <FormField label="Department">
            <input className="input" value={form.department} onChange={f('department')} required placeholder="e.g. Central Library" />
          </FormField>
          <FormField label="Password">
            <div className="relative">
              <input className="input pr-10" type={showPw ? 'text' : 'password'} value={form.password} onChange={f('password')} required minLength={6} placeholder="Min 6 characters" />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
            {loading ? <Spinner size="sm" /> : <><UserPlus className="h-4 w-4" /> Create librarian</>}
          </button>
        </form>
      </div>
    </div>
  )
}
