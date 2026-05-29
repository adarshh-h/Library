import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'

function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [locked])
}

export function Spinner({ size = 'md', color = 'brand' }) {
  const sz = { sm: '1rem', md: '1.25rem', lg: '2rem' }[size]
  const col = color === 'white' ? 'rgba(255,255,255,0.3)' : '#b8e2b8'
  const topCol = color === 'white' ? '#fff' : 'var(--color-brand-600)'
  return (
    <span className="animate-spin" style={{ display:'inline-block', width:sz, height:sz, border:`2px solid ${col}`, borderTopColor:topCol, borderRadius:'50%', flexShrink:0 }} />
  )
}

export function PageLoader() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', gap:'0.75rem' }}>
      <Spinner size="lg" />
      <p style={{ fontSize:'0.875rem', color:'#9ca3af' }}>Loading…</p>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'4rem 1rem', textAlign:'center' }}>
      {Icon && (
        <div style={{ width:'3rem', height:'3rem', borderRadius:'50%', background:'#f0f9f0', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1rem' }}>
          <Icon size={24} color="#6b8c6b" />
        </div>
      )}
      <h3 style={{ fontFamily:'var(--font-serif)', fontWeight:600, color:'#374151', marginBottom:'0.25rem' }}>{title}</h3>
      {description && <p style={{ fontSize:'0.875rem', color:'#9ca3af', maxWidth:'18rem' }}>{description}</p>}
      {action && <div style={{ marginTop:'1rem' }}>{action}</div>}
    </div>
  )
}

export function Alert({ type = 'info', message }) {
  if (!message) return null
  const styles = {
    error:   { bg:'#fee2e2', border:'#fca5a5', color:'#991b1b' },
    success: { bg:'#dcfce7', border:'#86efac', color:'#14532d' },
    warning: { bg:'#fef3c7', border:'#fcd34d', color:'#78350f' },
    info:    { bg:'#dbeafe', border:'#93c5fd', color:'#1e3a8a' },
  }
  const s = styles[type]
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:'0.625rem', padding:'0.75rem 1rem', background:s.bg, border:`1px solid ${s.border}`, borderRadius:'0.5rem', fontSize:'0.875rem', color:s.color, marginTop:'0.75rem' }}>
      <AlertCircle size={16} style={{ flexShrink:0, marginTop:'0.1rem' }} />
      <span>{message}</span>
    </div>
  )
}

export function Modal({ open, onClose, title, children, size = 'md' }) {
  useBodyScrollLock(open)
  if (!open) return null
  const widths = { sm: '24rem', md: '32rem', lg: '44rem', xl: '56rem' }

  return createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-backdrop" aria-hidden="true" />
      <div
        className="modal-panel"
        style={{ maxWidth: widths[size] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
          <button type="button" onClick={onClose} className="btn-ghost p-2 shrink-0" aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  )
}

/** Desktop table + mobile card list */
export function ResponsiveData({ mobile, desktop }) {
  return (
    <>
      <div className="md:hidden">{mobile}</div>
      <div className="hidden md:block">{desktop}</div>
    </>
  )
}

export function DataCards({ children }) {
  return <div className="data-cards">{children}</div>
}

export function DataCard({ title, subtitle, children, actions }) {
  return (
    <article className="data-card">
      {title && <p className="data-card-title">{title}</p>}
      {subtitle && <p className="data-card-subtitle">{subtitle}</p>}
      {children}
      {actions && <div className="data-card-actions">{actions}</div>}
    </article>
  )
}

export function DataCardGrid({ children, fullWidth }) {
  return <div className={`data-card-grid${fullWidth ? ' data-card-grid--full' : ''}`}>{children}</div>
}

export function DataField({ label, value }) {
  return (
    <div>
      <span className="data-field-label">{label}</span>
      <div className="data-field-value">{value ?? '—'}</div>
    </div>
  )
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-[#e8f0e8]">
      <p className="text-xs text-gray-400 order-2 sm:order-1">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-0.5 order-1 sm:order-2">
        <button onClick={() => onChange(page - 1)} disabled={page === 1} className="btn-ghost" style={{ padding:'0.375rem', opacity: page === 1 ? 0.3 : 1 }}>
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i
          return (
            <button key={p} onClick={() => onChange(p)}
              style={{ width:'2rem', height:'2rem', borderRadius:'0.375rem', fontSize:'0.75rem', fontWeight:500, background: p === page ? 'var(--color-brand-600)' : 'transparent', color: p === page ? '#fff' : '#374151', border:'none', cursor:'pointer', transition:'all 0.15s' }}>
              {p}
            </button>
          )
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="btn-ghost" style={{ padding:'0.375rem', opacity: page === totalPages ? 0.3 : 1 }}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div style={{ position:'relative' }}>
      <svg style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="input" style={{ paddingLeft:'2.25rem' }} />
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{message}</p>
      <div className="modal-footer !px-0 !pb-0">
        <button type="button" onClick={onClose} className="btn-secondary justify-center w-full">Cancel</button>
        <button type="button" onClick={onConfirm} className={`${danger ? 'btn-danger' : 'btn-primary'} justify-center w-full`}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export function FormField({ label, error, children }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p style={{ fontSize:'0.75rem', color:'#dc2626', marginTop:'0.25rem' }}>{error}</p>}
    </div>
  )
}

export function StatusBadge({ returned, overdue }) {
  if (returned) return <span className="badge badge-green">Returned</span>
  if (overdue)  return <span className="badge badge-red">Overdue</span>
  return <span className="badge badge-blue">Issued</span>
}
