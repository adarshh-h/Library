import { useState, useEffect, useCallback } from 'react'
import { bookAPI } from '../../api/services'
import {
  PageLoader, EmptyState, Pagination, SearchInput, Modal, ConfirmDialog, Alert, Spinner, FormField,
  ResponsiveData, DataCards, DataCard, DataCardGrid, DataField,
} from '../../components/ui'
import { BookOpen, Upload, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Books() {
  const [books, setBooks]       = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editBook, setEditBook] = useState(null)
  const [form, setForm]   = useState({})
  const [formErr, setFormErr] = useState('')
  const [saving, setSaving]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [bulkOpen, setBulkOpen]   = useState(false)
  const [csvFile, setCsvFile]     = useState(null)
  const [bulkResult, setBulkResult] = useState(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await bookAPI.getAll({ page, limit: 10, search })
      setBooks(data.books || [])
      setTotal(data.pagination?.total ?? data.totalBooks ?? 0)
      setTotalPages(data.pagination?.totalPages ?? data.totalPages ?? 1)
    } catch { toast.error('Failed to load books') }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => { setPage(1) }, [search])

  const openEdit = (b) => { setEditBook(b); setForm({ bookName: b.bookName, authorName: b.authorName, category: b.category, publication: b.publication, year: b.year, totalPages: b.totalPages, supplier: b.supplier, price: b.price }); setFormErr(''); setEditOpen(true) }

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true); setFormErr('')
    try {
      await bookAPI.update(editBook._id, form)
      toast.success('Book updated!'); setEditOpen(false); fetch()
    } catch (err) { setFormErr(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { await bookAPI.delete(deleteTarget._id); toast.success('Book deleted'); setDeleteOpen(false); fetch() }
    catch { toast.error('Failed to delete') }
  }

  const handleBulk = async (e) => {
    e.preventDefault(); if (!csvFile) return
    setBulkLoading(true); setBulkResult(null)
    try { const { data } = await bookAPI.bulkImport(csvFile); setBulkResult(data); fetch() }
    catch (err) { toast.error(err.response?.data?.message || 'Import failed') }
    finally { setBulkLoading(false) }
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="animate-in page-container">
      <div className="page-header-bar">
        <div>
          <h1 className="page-title">Books</h1>
          <p className="page-subtitle">{total} books in the catalogue</p>
        </div>
        <div className="page-header-actions">
          <button onClick={() => setBulkOpen(true)} className="btn-secondary w-full sm:w-auto justify-center"><Upload className="h-4 w-4" />Import CSV</button>
        </div>
      </div>

      <div className="mb-4 w-full max-w-md">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by title, author, category…" />
      </div>

      <div className="table-wrap">
        {loading ? <PageLoader /> : books.length === 0 ? (
          <EmptyState icon={BookOpen} title="No books found" description={search ? 'Try a different search' : 'Import books via CSV to get started'} />
        ) : (
          <ResponsiveData
            mobile={
              <DataCards>
                {books.map(b => (
                  <DataCard
                    key={b._id}
                    title={b.bookName}
                    subtitle={b.authorName}
                    actions={
                      <>
                        <button type="button" onClick={() => openEdit(b)} className="btn-secondary text-xs">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button type="button" onClick={() => { setDeleteTarget(b); setDeleteOpen(true) }} className="btn-secondary text-xs text-red-600 border-red-100">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </>
                    }
                  >
                    <DataCardGrid>
                      <DataField label="Accession" value={<span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded inline-block">{b.accessionNumber}</span>} />
                      <DataField label="Category" value={<span className="badge-blue">{b.category}</span>} />
                      <DataField label="Year" value={b.year} />
                      <DataField label="Price" value={`₹${b.price}`} />
                    </DataCardGrid>
                  </DataCard>
                ))}
              </DataCards>
            }
            desktop={
              <div className="table-scroll">
                <table className="w-full">
                  <thead><tr>
                    {['Accession','Title','Author','Category','Year','Price','Actions'].map(h => <th key={h} className="th">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {books.map(b => (
                      <tr key={b._id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="td"><span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded">{b.accessionNumber}</span></td>
                        <td className="td font-medium text-neutral-800 max-w-[180px] truncate">{b.bookName}</td>
                        <td className="td text-neutral-500">{b.authorName}</td>
                        <td className="td"><span className="badge-blue">{b.category}</span></td>
                        <td className="td">{b.year}</td>
                        <td className="td">₹{b.price}</td>
                        <td className="td">
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => openEdit(b)} className="btn-ghost p-1.5" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => { setDeleteTarget(b); setDeleteOpen(true) }} className="btn-ghost p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
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

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit book" size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          <Alert type="error" message={formErr} />
          <div className="form-grid">
            <FormField label="Book title"><input className="input" value={form.bookName||''} onChange={f('bookName')} required /></FormField>
            <FormField label="Author"><input className="input" value={form.authorName||''} onChange={f('authorName')} required /></FormField>
            <FormField label="Category"><input className="input" value={form.category||''} onChange={f('category')} required /></FormField>
            <FormField label="Publication"><input className="input" value={form.publication||''} onChange={f('publication')} required /></FormField>
            <FormField label="Year"><input className="input" type="number" value={form.year||''} onChange={f('year')} required /></FormField>
            <FormField label="Total pages"><input className="input" type="number" value={form.totalPages||''} onChange={f('totalPages')} required /></FormField>
            <FormField label="Supplier"><input className="input" value={form.supplier||''} onChange={f('supplier')} required /></FormField>
            <FormField label="Price (₹)"><input className="input" type="number" value={form.price||''} onChange={f('price')} required /></FormField>
          </div>
          <div className="modal-footer !px-0 !pb-0 pt-2">
            <button type="button" onClick={() => setEditOpen(false)} className="btn-secondary justify-center w-full">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary justify-center w-full">{saving ? <Spinner size="sm" /> : 'Save changes'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Delete book" message={`Remove "${deleteTarget?.bookName}" from the catalogue?`} confirmLabel="Delete" danger />

      <Modal open={bulkOpen} onClose={() => { setBulkOpen(false); setBulkResult(null); setCsvFile(null) }} title="Bulk import books">
        {!bulkResult ? (
          <form onSubmit={handleBulk} className="space-y-4">
            <p className="text-sm text-neutral-500 break-words">CSV columns: <span className="font-mono text-xs bg-neutral-100 px-1 rounded break-all">Accession Number, Book Name, Author Name, Category, Publication, Year, Total Pages, Supplier, Price</span></p>
            <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files[0])}
              className="block w-full text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:text-sm file:font-medium hover:file:bg-brand-100" />
            <div className="modal-footer !px-0 !pb-0">
              <button type="button" onClick={() => setBulkOpen(false)} className="btn-secondary justify-center w-full">Cancel</button>
              <button type="submit" disabled={!csvFile || bulkLoading} className="btn-primary justify-center w-full">{bulkLoading ? <Spinner size="sm" /> : 'Import'}</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="form-grid-3">
              {[['Inserted', bulkResult.summary?.inserted ?? bulkResult.inserted, 'text-emerald-700 bg-emerald-50'],
                ['Duplicates', bulkResult.summary?.duplicates ?? bulkResult.duplicates?.length, 'text-amber-700 bg-amber-50'],
                ['Errors', bulkResult.summary?.errors ?? bulkResult.errors?.length, 'text-red-700 bg-red-50'],
              ].map(([l,v,c]) => (
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
