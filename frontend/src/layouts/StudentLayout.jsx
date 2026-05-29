import AppShell from '../components/AppShell'
import { BookOpen, History, User } from 'lucide-react'

const NAV = [
  { to: '/student/dashboard', icon: BookOpen, label: 'My Books' },
  { to: '/student/history',   icon: History,  label: 'History'  },
  { to: '/student/profile',   icon: User,     label: 'Profile'  },
]

export default function StudentLayout() {
  return (
    <AppShell
      nav={NAV}
      homePath="/student/dashboard"
      portalLabel="Student Portal"
      userBadgeClass="bg-gold-600"
      userCardClass="bg-[#fef9ec]"
    />
  )
}
