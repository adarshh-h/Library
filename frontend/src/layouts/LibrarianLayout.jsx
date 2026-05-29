import AppShell from '../components/AppShell'
import {
  LayoutDashboard, Users, BookOpen, BookMarked,
  CornerUpLeft, History, UserPlus, User
} from 'lucide-react'

const NAV = [
  { to: '/librarian/dashboard',  icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/librarian/students',   icon: Users,           label: 'Students'      },
  { to: '/librarian/books',      icon: BookOpen,        label: 'Books'         },
  { to: '/librarian/issue',      icon: BookMarked,      label: 'Issue Books'   },
  { to: '/librarian/return',     icon: CornerUpLeft,    label: 'Return Books'  },
  { to: '/librarian/history',    icon: History,         label: 'History'       },
  { to: '/librarian/librarians', icon: UserPlus,        label: 'Add Librarian' },
  { to: '/librarian/profile',    icon: User,            label: 'My Profile'    },
]

export default function LibrarianLayout() {
  return (
    <AppShell
      nav={NAV}
      homePath="/librarian/dashboard"
      portalLabel="Librarian Portal"
      userBadgeClass="bg-brand-600"
    />
  )
}
