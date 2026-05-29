import { useState, useEffect } from 'react'
import { studentAPI } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { Alert, Spinner, FormField, PageLoader } from '../../components/ui'
import { Eye, EyeOff, User, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentProfile() {
  const { checkSession }  = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]     = useState('profile')
  const [form, setForm]   = useState({ name:'', email:'', phone:'', department:'' })
  const [formErr, setFormErr] = useState('')
  const [saving, setSaving]   = useState(false)
  const [pwForm, setPwForm]   = useState({ currentPassword:'', newPassword:'', confirm:'' })
  const [pwErr, setPwErr]     = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [showPw, setShowPw]   = useState({ cur:false, new:false, con:false })

  useEffect(() => {
    studentAPI.getProfile().then(({ data }) => {
      const u = data.user || data
      setProfile(u)
      setForm({ name: u.name||'', email: u.email||'', phone: u.phone||'', department: u.department||'' })
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const pf = k => e => setPwForm(p => ({ ...p, [k]: e.target.value }))

  const handleProfile = async (e) => {
    e.preventDefault(); setSaving(true); setFormErr('')
    try {
      await studentAPI.updateProfile(form)
      toast.success('Profile updated!'); checkSession()
    } catch (err) { setFormErr(err.response?.data?.message || 'Update failed') }
    finally { setSaving(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) { setPwErr('Passwords do not match'); return }
    setPwSaving(true); setPwErr('')
    try {
      await studentAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed! Please log in again.')
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' })
    } catch (err) { setPwErr(err.response?.data?.message || 'Failed') }
    finally { setPwSaving(false) }
  }

  if (loading) return <PageLoader />

  return (
    <div className="animate-in page-container page-container--form">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account</p>
      </div>

      <div className="flex gap-1 mb-6 p-1 bg-neutral-100 rounded-lg w-fit">
        {[['profile', User, 'Profile'], ['password', Lock, 'Password']].map(([id, Icon, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === id ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}>
            <Icon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
      </div>

      {tab === 'profile' ? (
        <div className="form-section">
          <div className="flex items-center gap-4 pb-4 border-b border-neutral-100">
            <div className="w-14 h-14 rounded-full bg-amber-600 flex items-center justify-center text-white text-xl font-semibold font-serif">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{profile?.name}</p>
              <p className="text-sm text-neutral-400">{profile?.rollNumber} · {profile?.department}</p>
              <span className="badge-amber mt-1">Student</span>
            </div>
          </div>
          <form onSubmit={handleProfile} className="space-y-4 pt-2">
            <Alert type="error" message={formErr} />
            <div className="form-grid">
              <FormField label="Full name"><input className="input" value={form.name} onChange={f('name')} required /></FormField>
              <FormField label="Phone"><input className="input" value={form.phone} onChange={f('phone')} required /></FormField>
            </div>
            <FormField label="Email"><input className="input" type="email" value={form.email} onChange={f('email')} required /></FormField>
            <FormField label="Department"><input className="input" value={form.department} onChange={f('department')} required /></FormField>
            <div className="form-grid">
              <FormField label="Batch">
                <input className="input bg-neutral-50" value={profile?.batch || '—'} readOnly />
              </FormField>
              <FormField label="Roll number">
                <input className="input bg-neutral-50 font-mono" value={profile?.rollNumber || '—'} readOnly />
              </FormField>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? <Spinner size="sm" /> : 'Save changes'}</button>
          </form>
        </div>
      ) : (
        <div className="form-section">
          <form onSubmit={handlePassword} className="space-y-4">
            <Alert type="error" message={pwErr} />
            {[
              ['currentPassword', 'Current password', 'cur'],
              ['newPassword', 'New password', 'new'],
              ['confirm', 'Confirm new password', 'con'],
            ].map(([key, label, showKey]) => (
              <FormField key={key} label={label}>
                <div className="relative">
                  <input className="input pr-10" type={showPw[showKey] ? 'text' : 'password'}
                    value={pwForm[key]} onChange={pf(key)} required minLength={key !== 'currentPassword' ? 6 : 1} />
                  <button type="button" onClick={() => setShowPw(p => ({ ...p, [showKey]: !p[showKey] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                    {showPw[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>
            ))}
            <button type="submit" disabled={pwSaving}
              className="w-full justify-center inline-flex items-center gap-2 px-4 py-2.5 bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-amber-800 transition-all shadow-sm">
              {pwSaving ? <Spinner size="sm" /> : 'Change password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
