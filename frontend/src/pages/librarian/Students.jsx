import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../api/services'
import {
  PageLoader, EmptyState, Pagination, SearchInput, Modal, ConfirmDialog, Alert, Spinner, FormField,
  ResponsiveData, DataCards, DataCard, DataCardGrid, DataField,
} from '../../components/ui'
import { Users, Plus, Upload, Pencil, Trash2, RotateCcw, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name:'', email:'', phone:'', department:'', batch:'', rollNumber:'' }

export default function Students() {
  const [students, setStudents] = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen]     = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm]   = useState(EMPTY_FORM)
  const [formErr, setFormErr] = useState('')
  const [saving, setSaving]   = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const [bulkOpen, setBulkOpen] = useState(false)
  const [csvFile, setCsvFile]   = useState(null)
  const [bulkResult, setBulkResult] = useState(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminAPI.getStudents({ page, limit: 10, search })
      setStudents(data.students || [])
      setTotal(data.pagination?.total ?? data.total ?? 0)
      setTotalPages(data.pagination?.totalPages ?? data.totalPages ?? 1)
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => { setPage(1) }, [search])

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setFormErr('')
    try {
      const { data } = await adminAPI.createStudent(form)
      setNewPassword(data.temporaryPassword)
      toast.success('Student created!')
      fetch()
      setForm(EMPTY_FORM)
    } catch (err) { setFormErr(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const openEdit = (s) => { setEditStudent(s); setForm({ name:s.name, email:s.email, phone:s.phone, department:s.department, batch:s.batch||'', rollNumber:s.rollNumber||'' }); setFormErr(''); setEditOpen(true) }

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true); setFormErr('')
    try {
      await adminAPI.updateStudent(editStudent._id, form)
      toast.success('Student updated!'); setEditOpen(false); fetch()
    } catch (err) { setFormErr(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await adminAPI.deleteStudent(deleteTarget._id)
      toast.success('Student deleted'); setDeleteOpen(false); fetch()
    } catch { toast.error('Failed to delete') }
  }

  const handleResetPw = async (id, name) => {
    try {
      const { data } = await adminAPI.resetPassword(id)
      toast.success(`Temp password for ${name}: ${data.temporaryPassword}`, { duration: 8000 })
    } catch { toast.error('Reset failed') }
  }

  const handleBulk = async (e) => {
    e.preventDefault(); if (!csvFile) return
    setBulkLoading(true); setBulkResult(null)
    try {
      const { data } = await adminAPI.bulkImportStudents(csvFile)
      setBulkResult(data); fetch()
    } catch (err) { toast.error(err.response?.data?.message || 'Import failed') }
    finally { setBulkLoading(false) }
  }

  const StudentForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <Alert type="error" message={formErr} />
      <div className="form-grid">
        <FormField label="Full name"><input className="input" value={form.name} onChange={f('name')} required placeholder="Rahul Sharma" /></FormField>
        <FormField label="Roll number"><input className="input" value={form.rollNumber} onChange={f('rollNumber')} required placeholder="CS2101" /></FormField>
        <FormField label="Email"><input className="input" type="email" value={form.email} onChange={f('email')} required placeholder="r@hnbgu.ac.in" /></FormField>
        <FormField label="Phone"><input className="input" value={form.phone} onChange={f('phone')} required placeholder="9876543210" /></FormField>
        <FormField label="Department"><input className="input" value={form.department} onChange={f('department')} required placeholder="Computer Science" /></FormField>
        <FormField label="Batch"><input className="input" value={form.batch} onChange={f('batch')} required placeholder="2021-2025" /></FormField>
      </div>
      <div className="modal-footer !px-0 !pb-0 pt-2">
        <button type="button" onClick={() => { setCreateOpen(false); setEditOpen(false); setNewPassword('') }} className="btn-secondary justify-center w-full">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary justify-center w-full">
          {saving ? <Spinner size="sm" /> : submitLabel}
        </button>
      </div>
    </form>
  )

  return (
    <div className="animate-in page-container">
      <div className="page-header-bar">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{total} registered students</p>
        </div>
        <div className="page-header-actions">
          <button onClick={() => setBulkOpen(true)} className="btn-secondary w-full sm:w-auto justify-center"><Upload className="h-4 w-4" />Import CSV</button>
          <button onClick={() => { setCreateOpen(true); setForm(EMPTY_FORM); setFormErr(''); setNewPassword('') }} className="btn-primary w-full sm:w-auto justify-center"><Plus className="h-4 w-4" />Add student</button>
        </div>
      </div>

      <div className="mb-4 w-full max-w-md">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, roll, batch…" />
      </div>

      <div className="table-wrap">
        {loading ? <PageLoader /> : students.length === 0 ? (
          <EmptyState icon={Users} title="No students found" description={search ? 'Try a different search term' : 'Add your first student to get started'} />
        ) : (
          <ResponsiveData
            mobile={
              <DataCards>
                {students.map(s => (
                  <DataCard
                    key={s._id}
                    title={s.name}
                    subtitle={s.email}
                    actions={
                      <>
                        <button type="button" onClick={() => openEdit(s)} className="btn-secondary text-xs">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button type="button" onClick={() => handleResetPw(s._id, s.name)} className="btn-secondary text-xs">
                          <RotateCcw className="h-3.5 w-3.5" /> Reset PW
                        </button>
                        <button type="button" onClick={() => { setDeleteTarget(s); setDeleteOpen(true) }} className="btn-secondary text-xs text-red-600 border-red-100">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </>
                    }
                  >
                    <DataCardGrid>
                      <DataField label="Roll No" value={<span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded inline-block">{s.rollNumber}</span>} />
                      <DataField label="Batch" value={s.batch} />
                      <DataField label="Department" value={s.department} />
                      <DataField label="Phone" value={s.phone || '—'} />
                    </DataCardGrid>
                  </DataCard>
                ))}
              </DataCards>
            }
            desktop={
              <div className="table-scroll">
                <table className="w-full">
                  <thead><tr>
                    {['Name','Roll No','Department','Batch','Email','Actions'].map(h => <th key={h} className="th">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s._id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="td font-medium text-neutral-800">{s.name}</td>
                        <td className="td"><span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded">{s.rollNumber}</span></td>
                        <td className="td">{s.department}</td>
                        <td className="td">{s.batch}</td>
                        <td className="td text-neutral-500">{s.email}</td>
                        <td className="td">
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => openEdit(s)} className="btn-ghost p-1.5" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => handleResetPw(s._id, s.name)} className="btn-ghost p-1.5" title="Reset password"><RotateCcw className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => { setDeleteTarget(s); setDeleteOpen(true) }} className="btn-ghost p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          />
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setNewPassword('') }} title="Add new student" size="lg">
        {newPassword ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"><Users className="h-6 w-6 text-emerald-600" /></div>
            <p className="font-semibold text-neutral-800 mb-2">Student created!</p>
            <p className="text-sm text-neutral-500 mb-4">Share this temporary password with the student:</p>
            <div className="bg-neutral-100 rounded-lg px-4 py-3 font-mono text-lg sm:text-xl font-semibold text-neutral-800 mb-6 break-all">{newPassword}</div>
            <button type="button" onClick={() => { setCreateOpen(false); setNewPassword('') }} className="btn-primary w-full justify-center">Done</button>
          </div>
        ) : <StudentForm onSubmit={handleCreate} submitLabel="Create student" />}
      </Modal>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit student" size="lg">
        <StudentForm onSubmit={handleEdit} submitLabel="Save changes" />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Delete student" message={`Are you sure you want to delete ${deleteTarget?.name}? This cannot be undone.`}
        confirmLabel="Delete" danger />

      {/* Bulk import modal */}
      <Modal open={bulkOpen} onClose={() => { setBulkOpen(false); setBulkResult(null); setCsvFile(null) }} title="Bulk import students">
        {!bulkResult ? (
          <form onSubmit={handleBulk} className="space-y-4">
            <p className="text-sm text-neutral-500 break-words">CSV columns required: <span className="font-mono text-xs bg-neutral-100 px-1 rounded break-all">name, email, phone, department, batch, rollNumber</span></p>
            <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files[0])}
              className="block w-full text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:text-sm file:font-medium hover:file:bg-brand-100" />
            <div className="modal-footer !px-0 !pb-0">
              <button type="button" onClick={() => setBulkOpen(false)} className="btn-secondary justify-center w-full">Cancel</button>
              <button type="submit" disabled={!csvFile || bulkLoading} className="btn-primary justify-center w-full">
                {bulkLoading ? <Spinner size="sm" /> : 'Import'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="form-grid-3">
              {[['Created', bulkResult.summary?.created ?? bulkResult.created, 'text-emerald-700 bg-emerald-50'],
                ['Duplicates', bulkResult.summary?.duplicates ?? bulkResult.duplicates?.length, 'text-amber-700 bg-amber-50'],
                ['Errors', bulkResult.summary?.errors ?? bulkResult.errors?.length, 'text-red-700 bg-red-50'],
              ].map(([l, v, c]) => (
                <div key={l} className={`rounded-lg p-3 text-center ${c}`}>
                  <p className="text-2xl font-serif font-bold">{v}</p>
                  <p className="text-xs font-medium mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            <button onClick={() => { setBulkOpen(false); setBulkResult(null); setCsvFile(null) }} className="btn-primary w-full justify-center">Done</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
