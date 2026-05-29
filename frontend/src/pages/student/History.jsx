import { useState, useEffect } from 'react'
import { studentAPI } from '../../api/services'
import {
  PageLoader, EmptyState, StatusBadge,
  ResponsiveData, DataCards, DataCard, DataCardGrid, DataField,
} from '../../components/ui'
import { History } from 'lucide-react'

export default function StudentHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentAPI.getHistory()
      .then(({ data }) => setHistory(data.transactions || data.history || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'

  if (loading) return <PageLoader />

  return (
    <div className="animate-in page-container">
      <div className="page-header">
        <h1 className="page-title">Borrowing History</h1>
        <p className="page-subtitle">All your past and current issued books</p>
      </div>

      <div className="table-wrap">
        {history.length === 0 ? (
          <EmptyState icon={History} title="No history yet" description="Your borrowing history will appear here." />
        ) : (
          <ResponsiveData
            mobile={
              <DataCards>
                {history.map((t, i) => (
                  <DataCard key={i} title={t.bookName} subtitle={t.authorName}>
                    <DataCardGrid>
                      <DataField label="Accession" value={<span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded inline-block">{t.accessionNumber}</span>} />
                      <DataField label="Status" value={<StatusBadge returned={!!t.returnedAt} overdue={t.isOverdue} />} />
                      <DataField label="Issued" value={fmt(t.issueDate)} />
                      <DataField label="Due" value={fmt(t.dueDate)} />
                      <DataField label="Returned" value={fmt(t.returnedAt)} />
                    </DataCardGrid>
                  </DataCard>
                ))}
              </DataCards>
            }
            desktop={
              <div className="table-scroll">
                <table className="w-full">
                  <thead><tr>
                    {['Book','Accession','Issue Date','Due Date','Returned','Status'].map(h => <th key={h} className="th">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {history.map((t, i) => (
                      <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="td">
                          <p className="font-medium text-neutral-800">{t.bookName}</p>
                          <p className="text-xs text-neutral-400">{t.authorName}</p>
                        </td>
                        <td className="td"><span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded">{t.accessionNumber}</span></td>
                        <td className="td">{fmt(t.issueDate)}</td>
                        <td className="td">{fmt(t.dueDate)}</td>
                        <td className="td">{fmt(t.returnedAt)}</td>
                        <td className="td"><StatusBadge returned={!!t.returnedAt} overdue={t.isOverdue} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          />
        )}
      </div>
    </div>
  )
}
