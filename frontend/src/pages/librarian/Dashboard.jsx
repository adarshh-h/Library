import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI, bookAPI } from '../../api/services'
import { PageLoader } from '../../components/ui'
import { Users, BookOpen, BookMarked, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LibrarianDashboard() {
  const { user } = useAuth()
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminAPI.getStudents({ limit: 1 }),
      bookAPI.getAll({ limit: 1 }),
    ]).then(([s, b]) => {
      setStats({
        students: s.data.pagination?.total ?? s.data.total ?? 0,
        books:    b.data.pagination?.total ?? b.data.totalBooks ?? 0,
      })
    }).catch(() => setStats({ students: 0, books: 0 }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const cards = [
    { label: 'Total Students', value: stats.students, icon: Users,      color: 'text-primary-700', bg: 'bg-primary-50' },
    { label: 'Total Books',    value: stats.books,    icon: BookOpen,    color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Books / Student limit', value: '3',     icon: BookMarked,  color: 'text-amber-700',   bg: 'bg-amber-50'   },
    { label: 'Portal Status',  value: 'Active',       icon: TrendingUp,  color: 'text-purple-700',  bg: 'bg-purple-50'  },
  ]

  const quickLinks = [
    { to: '/librarian/issue',     label: 'Issue a book',      desc: 'Assign books to a student' },
    { to: '/librarian/return',    label: 'Return a book',     desc: 'Process a book return'     },
    { to: '/librarian/students',  label: 'Manage students',   desc: 'Add or update students'    },
    { to: '/librarian/books',     label: 'Manage books',      desc: 'Search and edit books'     },
  ]

  return (
    <div className="animate-in page-container">
      <div className="page-header">
        <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]}</h1>
        <p className="page-subtitle">Here's what's happening in the library today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="font-serif font-semibold text-lg text-neutral-800 mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map(({ to, label, desc }) => (
            <Link key={to} to={to}
              className="card p-4 hover:shadow-card-hover transition-all duration-200 group">
              <p className="font-medium text-sm text-neutral-800 group-hover:text-primary-700 transition-colors">{label}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="info-banner">
        <div>
          <p className="font-serif font-semibold text-lg">HNBGU Central Library</p>
          <p className="text-brand-200 text-sm mt-1">Manage your library efficiently — issue books, track returns, and keep records up to date.</p>
        </div>
        <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-brand-600 shrink-0 hidden sm:block" />
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
