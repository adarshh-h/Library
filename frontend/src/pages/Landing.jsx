// import { Link } from 'react-router-dom'
// import {
//   Shield,
//   Users,
//   BookOpen,
//   Clock3,
//   GraduationCap,
//   ArrowRight,
//   ChevronRight,
//   Library,
//   TrendingUp,
//   Calendar,
//   Sparkles,
//   Star,
//   CheckCircle
// } from 'lucide-react'
// import { useState, useEffect } from 'react'

// export default function Landing() {
//   const [scrolled, setScrolled] = useState(false)

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 50)
//     window.addEventListener('scroll', handleScroll)
//     return () => window.removeEventListener('scroll', handleScroll)
//   }, [])

//   const features = [
//     {
//       icon: BookOpen,
//       title: 'Digital Book Management',
//       desc: 'Browse, search, and manage thousands of books with real-time availability tracking.',
//       color: 'emerald'
//     },
//     {
//       icon: Users,
//       title: 'Student Records',
//       desc: 'Centralized student database with borrowing history and account management.',
//       color: 'blue'
//     },
//     {
//       icon: Clock3,
//       title: 'Smart Issue & Return',
//       desc: 'Automated due date calculation and overdue notifications.',
//       color: 'amber'
//     },
//     {
//       icon: Shield,
//       title: 'Secure Authentication',
//       desc: 'Role-based access with OTP verification and session management.',
//       color: 'purple'
//     },
//     {
//       icon: TrendingUp,
//       title: 'Analytics Dashboard',
//       desc: 'Real-time insights on book circulation and library usage.',
//       color: 'indigo'
//     },
//     {
//       icon: Calendar,
//       title: 'Due Date Reminders',
//       desc: 'Automated email notifications for approaching due dates.',
//       color: 'rose'
//     }
//   ]

//   const stats = [
//     { value: '10,000+', label: 'Books', icon: BookOpen },
//     { value: '5,000+', label: 'Students', icon: Users },
//     { value: '50,000+', label: 'Transactions', icon: TrendingUp },
//     { value: '24/7', label: 'Access', icon: Clock3 }
//   ]

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#eef8ee] via-white to-[#fff8ea] overflow-hidden relative">
      
//       {/* Animated background elements */}
//       <div className="absolute top-0 left-0 w-96 h-96 bg-green-200/20 blur-3xl rounded-full animate-pulse" />
//       <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200/20 blur-3xl rounded-full animate-pulse delay-1000" />
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-100/10 blur-3xl rounded-full" />

//       {/* Header */}
//       <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//         scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
//       }`}>
//         <div className="px-6 md:px-10 py-4 flex items-center justify-between max-w-7xl mx-auto">
//           <Link to="/" className="flex items-center gap-3 group">
//             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
//               <img src="/hnbgu-logo.png" alt="HNBGU" className="w-7 h-7 object-contain" />
//             </div>
//             <div>
//               <h2 className="font-serif font-bold text-base text-[#0f1f0f]">HNBGU Library</h2>
//               <p className="text-[0.7rem] text-gray-500">Management System</p>
//             </div>
//           </Link>

//           <div className="hidden md:flex items-center gap-3">
//             <Link
//               to="/librarian/login"
//               className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
//             >
//               Librarian Portal
//             </Link>
//             <Link
//               to="/student/login"
//               className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
//             >
//               Student Portal
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="relative z-10 px-4 md:px-10 pt-32 pb-16">
//         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
//           {/* Left Content */}
//           <div className="space-y-6">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm">
//               <Sparkles size={16} className="text-brand-600" />
//               <span className="text-brand-700 text-sm font-medium">Next-Gen Library Management</span>
//             </div>

//             {/* University Name - Natural wrapping */}
//             <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#0f1f0f]">
//               Hemwati Nandan Bahuguna{' '}
//               <span className="bg-gradient-to-r from-brand-600 to-gold-600 bg-clip-text text-transparent">
//                 Garhwal University
//               </span>
//             </h1>

//             <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl">
//               Experience the future of library management — digital cataloging, automated borrowing,
//               real-time tracking, and seamless access to knowledge.
//             </p>

//             {/* CTA Buttons */}
//             <div className="flex flex-col sm:flex-row gap-4 pt-2">
//               <Link
//                 to="/librarian/login"
//                 className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-base font-medium rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
//               >
//                 Librarian Portal
//                 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
//               </Link>
//               <Link
//                 to="/student/login"
//                 className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 text-base font-medium rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
//               >
//                 Student Portal
//                 <ChevronRight size={18} />
//               </Link>
//             </div>

//             {/* Stats Grid */}
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
//               {stats.map((stat, idx) => (
//                 <div
//                   key={idx}
//                   className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
//                 >
//                   <stat.icon className="w-6 h-6 text-brand-600 mx-auto mb-2" />
//                   <h3 className="font-serif text-xl font-bold text-brand-700">{stat.value}</h3>
//                   <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Right - Feature Cards Grid */}
//           <div className="relative">
//             <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-2xl p-6 md:p-8">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
//                   <Library className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-serif text-xl font-bold text-[#0f1f0f]">Digital Library Hub</h3>
//                   <p className="text-xs text-gray-500">Modern. Efficient. Accessible.</p>
//                 </div>
//               </div>

//               <div className="grid sm:grid-cols-2 gap-4">
//                 {features.slice(0, 4).map((item, idx) => (
//                   <div
//                     key={idx}
//                     className="group rounded-xl border border-gray-100 bg-white p-4 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
//                   >
//                     <div className={`w-10 h-10 rounded-lg bg-${item.color}-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
//                       <item.icon size={18} className={`text-${item.color}-600`} />
//                     </div>
//                     <h4 className="font-semibold text-gray-800 text-sm mb-1">{item.title}</h4>
//                     <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-6 pt-4 border-t border-gray-100">
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-gray-500">Trusted by 5000+ students</span>
//                   <div className="flex items-center gap-1">
//                     {[1, 2, 3, 4, 5].map(i => (
//                       <Star key={i} size={14} className="fill-gold-500 text-gold-500" />
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="relative z-10 px-6 md:px-10 py-16 bg-white/50">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center max-w-3xl mx-auto mb-12">
//             <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#0f1f0f] mb-4">
//               Everything you need to manage your library
//             </h2>
//             <p className="text-gray-600 text-base">
//               Powerful features designed to streamline library operations and enhance user experience
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-6">
//             {features.map((feature, idx) => (
//               <div
//                 key={idx}
//                 className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2"
//               >
//                 <div className={`w-12 h-12 rounded-xl bg-${feature.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
//                   <feature.icon size={22} className={`text-${feature.color}-600`} />
//                 </div>
//                 <h3 className="font-serif text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
//                 <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
//                 <div className="mt-4 flex items-center text-brand-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
//                   Learn more <ChevronRight size={14} className="ml-1" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="relative z-10 px-6 md:px-10 py-16">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#0f1f0f] mb-4">
//               What our users say
//             </h2>
//             <p className="text-gray-600">Trusted by librarians and students alike</p>
//           </div>

//           <div className="grid md:grid-cols-2 gap-6">
//             <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
//               <div className="flex items-center gap-4 mb-4">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-lg">
//                   R
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-gray-800">Dr. Rajesh Kumar</h4>
//                   <p className="text-xs text-gray-500">University Librarian</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-1 mb-3">
//                 {[1,2,3,4,5].map(i => (
//                   <Star key={i} size={16} className="fill-gold-500 text-gold-500" />
//                 ))}
//               </div>
//               <p className="text-gray-600 italic">"This system has revolutionized how we manage our library. The interface is intuitive and efficient."</p>
//             </div>

//             <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
//               <div className="flex items-center gap-4 mb-4">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-white font-bold text-lg">
//                   P
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-gray-800">Priya Sharma</h4>
//                   <p className="text-xs text-gray-500">Student, Computer Science</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-1 mb-3">
//                 {[1,2,3,4,5].map(i => (
//                   <Star key={i} size={16} className="fill-gold-500 text-gold-500" />
//                 ))}
//               </div>
//               <p className="text-gray-600 italic">"Easy to track my borrowed books and due dates. The student portal is very user-friendly!"</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Banner */}
//       <section className="relative z-10 px-6 md:px-10 py-16">
//         <div className="max-w-5xl mx-auto">
//           <div className="bg-gradient-to-r from-brand-900 to-brand-800 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
//             <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
//               Ready to get started?
//             </h2>
//             <p className="text-brand-100 mb-6 max-w-2xl mx-auto">
//               Join the digital transformation of library management at HNBGU
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Link
//                 to="/librarian/login"
//                 className="px-6 py-3 bg-white text-brand-700 rounded-xl font-medium hover:shadow-lg transition-all transform hover:-translate-y-0.5"
//               >
//                 Librarian Login
//               </Link>
//               <Link
//                 to="/student/login"
//                 className="px-6 py-3 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-600 transition-all transform hover:-translate-y-0.5"
//               >
//                 Student Login
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="relative z-10 px-6 py-8 border-t border-gray-200 bg-white/50">
//         <div className="max-w-7xl mx-auto text-center">
//           <div className="flex items-center justify-center gap-2 mb-4">
//             <img src="/hnbgu-logo.png" alt="HNBGU" className="w-8 h-8 object-contain" />
//             <p className="font-serif font-semibold text-gray-700">HNB Garhwal University</p>
//           </div>
//           <p className="text-sm text-gray-400">
//             © {new Date().getFullYear()} Hemwati Nandan Bahuguna Garhwal University. All rights reserved.
//           </p>
//           <p className="text-xs text-gray-400 mt-2">
//             Central Library • Srinagar Garhwal • Uttarakhand
//           </p>
//         </div>
//       </footer>
//     </div>
//   )
// }  

import { Link } from 'react-router-dom'
import {
  Shield,
  Users,
  BookOpen,
  Clock3,
  GraduationCap,
  ArrowRight,
  ChevronRight,
  Library,
  TrendingUp,
  Calendar,
  Sparkles,
  Star,
  CheckCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: BookOpen,
      title: 'Digital Book Management',
      desc: 'Browse, search, and manage thousands of books with real-time availability tracking.',
      color: 'emerald'
    },
    {
      icon: Users,
      title: 'Student Records',
      desc: 'Centralized student database with borrowing history and account management.',
      color: 'blue'
    },
    {
      icon: Clock3,
      title: 'Smart Issue & Return',
      desc: 'Automated due date calculation and overdue notifications.',
      color: 'amber'
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      desc: 'Role-based access with OTP verification and session management.',
      color: 'purple'
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      desc: 'Real-time insights on book circulation and library usage.',
      color: 'indigo'
    },
    {
      icon: Calendar,
      title: 'Due Date Reminders',
      desc: 'Automated email notifications for approaching due dates.',
      color: 'rose'
    }
  ]

  const stats = [
    { value: '10,000+', label: 'Books', icon: BookOpen },
    { value: '5,000+', label: 'Students', icon: Users },
    { value: '50,000+', label: 'Transactions', icon: TrendingUp },
    { value: '24/7', label: 'Access', icon: Clock3 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef8ee] via-white to-[#fff8ea] overflow-hidden relative">
      
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-200/20 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200/20 blur-3xl rounded-full animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-100/10 blur-3xl rounded-full" />

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}>
        <div className="px-6 md:px-10 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              <img src="/hnbgu-logo.png" alt="HNBGU" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#0f1f0f]">HNBGU Library</h2>
              <p className="text-[0.7rem] text-gray-500">Management System</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/librarian/login"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Librarian Portal
            </Link>
            <Link
              to="/student/login"
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              Student Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 md:px-10 pt-32 pb-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm">
              <Sparkles size={16} className="text-brand-600" />
              <span className="text-brand-700 text-sm font-medium">Next-Gen Library Management</span>
            </div>

            {/* University Name - Natural wrapping */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#0f1f0f]">
              Hemwati Nandan Bahuguna{' '}
              <span className="bg-gradient-to-r from-brand-600 to-gold-600 bg-clip-text text-transparent">
                Garhwal University
              </span>
            </h1>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl">
              Experience the future of library management — digital cataloging, automated borrowing,
              real-time tracking, and seamless access to knowledge.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/librarian/login"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-base font-medium rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                Librarian Portal
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/student/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 text-base font-medium rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Student Portal
                <ChevronRight size={18} />
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <stat.icon className="w-6 h-6 text-brand-600 mx-auto mb-2" />
                  <h3 className="font-serif text-xl font-bold text-brand-700">{stat.value}</h3>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Feature Cards Grid */}
          <div className="relative">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                  <Library className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#0f1f0f]">Digital Library Hub</h3>
                  <p className="text-xs text-gray-500">Modern. Efficient. Accessible.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {features.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className="group rounded-xl border border-gray-100 bg-white p-4 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-${item.color}-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <item.icon size={18} className={`text-${item.color}-600`} />
                    </div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Trusted by 5000+ students</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={14} className="fill-gold-500 text-gold-500" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 md:px-10 py-16 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#0f1f0f] mb-4">
              Everything you need to manage your library
            </h2>
            <p className="text-gray-600 text-base">
              Powerful features designed to streamline library operations and enhance user experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2"
              >
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={22} className={`text-${feature.color}-600`} />
                </div>
                <h3 className="font-serif text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                <div className="mt-4 flex items-center text-brand-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight size={14} className="ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 px-6 md:px-10 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#0f1f0f] mb-4">
              What our users say
            </h2>
            <p className="text-gray-600">Trusted by librarians and students alike</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-lg">
                  R
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Dr. Rajesh Kumar</h4>
                  <p className="text-xs text-gray-500">University Librarian</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} className="fill-gold-500 text-gold-500" />
                ))}
              </div>
              <p className="text-gray-600 italic">"This system has revolutionized how we manage our library. The interface is intuitive and efficient."</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-white font-bold text-lg">
                  P
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Priya Sharma</h4>
                  <p className="text-xs text-gray-500">Student, Computer Science</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} className="fill-gold-500 text-gold-500" />
                ))}
              </div>
              <p className="text-gray-600 italic">"Easy to track my borrowed books and due dates. The student portal is very user-friendly!"</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 px-6 md:px-10 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-brand-900 to-brand-800 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-brand-100 mb-6 max-w-2xl mx-auto">
              Join the digital transformation of library management at HNBGU
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/librarian/login"
                className="px-6 py-3 bg-white text-brand-700 rounded-xl font-medium hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Librarian Login
              </Link>
              <Link
                to="/student/login"
                className="px-6 py-3 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-600 transition-all transform hover:-translate-y-0.5"
              >
                Student Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/hnbgu-logo.png" alt="HNBGU" className="w-8 h-8 object-contain" />
            <p className="font-serif font-semibold text-gray-700">HNB Garhwal University</p>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Hemwati Nandan Bahuguna Garhwal University. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Central Library • Srinagar Garhwal • Uttarakhand
          </p>
        </div>
      </footer>
    </div>
  )
}