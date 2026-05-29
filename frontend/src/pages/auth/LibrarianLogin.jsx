import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { authAPI } from '../../api/services'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

function Alert({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 mt-4">
      <span>⚠</span>
      <span>{message}</span>
    </div>
  )
}

function Spinner() {
  return <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
}

export default function LibrarianLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [forgot, setForgot] = useState(false)
  const [otpStep, setOtpStep] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPw, setNewPw] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { data } = await authAPI.librarianLogin(form)
      login(data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/librarian/dashboard')
    } catch (err) { setError(err.response?.data?.message || 'Login failed') }
    finally { setLoading(false) }
  }

  const handleForgot = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try { await authAPI.forgotPassword({ email: forgotEmail }); setOtpStep(true); toast.success('OTP sent') }
    catch (err) { setError(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  const handleOtp = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await authAPI.verifyOtp({ email: forgotEmail, otp, newPassword: newPw })
      toast.success('Password reset! Please log in.'); setForgot(false); setOtpStep(false)
    } catch (err) { setError(err.response?.data?.message || 'Invalid OTP') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Brand Section */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f330f 0%, #1a5a1a 50%, #226c22 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle,#fff_1px,transparent_1px)] bg-[length:28px_28px]" />

        <div className="relative p-6 md:p-8 lg:p-10">
          <div className="flex items-center gap-4 mb-8 lg:mb-12">
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white/12 backdrop-blur flex items-center justify-center border border-white/20 shrink-0">
              <img src="/hnbgu-logo.png" alt="HNBGU" className="w-10 h-10 lg:w-12 lg:h-12 object-contain" />
            </div>
            <div>
              <p className="font-serif font-bold text-base lg:text-lg leading-snug text-white">HNB Garhwal University</p>
              <p className="text-xs opacity-70 mt-0.5 tracking-wide text-white">Library Portal</p>
            </div>
          </div>

          <h1 className="justify-center font-serif text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight mt-20 mb-6 text-white">
            Hemwati Nandan Bahuguna Garhwal University
          </h1>
          <p className="text-sm lg:text-base opacity-70 leading-relaxed max-w-md text-white">
            Library Management System — connecting students with knowledge since 1973.
          </p>
        </div>

        <div className="relative p-6 md:p-8 lg:p-10">
          <div className="flex gap-2 flex-wrap mb-6">
            {['Book Management', 'Student Records', 'Issue & Return', 'History Tracking'].map(s => (
              <span key={s} className="px-3 py-1 rounded-full bg-white/12 text-xs border border-white/15 text-white">{s}</span>
            ))}
          </div>
          <p className="text-xs opacity-45 text-white">© {new Date().getFullYear()} HNBGU. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#f8faf8] min-h-screen lg:min-h-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Back to Home Button */}
          <div className="mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </div>

          {/* Mobile Logo */}
          <div className="flex lg:hidden justify-center mb-6">
            <img src="/hnbgu-logo.png" alt="HNBGU" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
          </div>

          {/* Header */}
          <div className=" mb-6 sm:mb-8">
            <h2 className=" flex justify-center font-serif text-xl sm:text-2xl lg:text-[1.625rem] font-semibold text-[#0f1f0f]">
              {forgot ? 'Reset password' : 'Librarian sign in'}
            </h2>
            <p className="flex justify-center text-sm text-gray-500 mt-1">
              {forgot ? 'Enter your registered email to receive OTP' : 'Access the library management portal'}
            </p>
          </div>

          <Alert message={error} />

          {!forgot ? (
            <form onSubmit={handleLogin} className="mt-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4b6b4b] uppercase tracking-wide mb-1.5">
                  Email address
                </label>
                <input 
                  className="w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base bg-white border border-gray-300 rounded-lg focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none transition-all"
                  type="email" 
                  required 
                  autoFocus 
                  placeholder="librarian@hnbgu.ac.in"
                  value={form.email} 
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#4b6b4b] uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input 
                    className="w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base bg-white border border-gray-300 rounded-lg focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none transition-all pr-10"
                    type={showPw ? 'text' : 'password'} 
                    required 
                    placeholder="••••••••"
                    value={form.password} 
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <button 
                type="button" 
                onClick={() => { setForgot(true); setError('') }}
                className="text-xs text-brand-600 hover:text-brand-700 text-left underline bg-transparent border-0 cursor-pointer p-0 w-fit"
              >
                Forgot password?
              </button>
              
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm sm:text-base font-medium rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Spinner /> : 'Sign in'}
              </button>
            </form>
          ) : !otpStep ? (
            <form onSubmit={handleForgot} className="mt-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4b6b4b] uppercase tracking-wide mb-1.5">
                  Registered email
                </label>
                <input 
                  className="w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base bg-white border border-gray-300 rounded-lg focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none transition-all"
                  type="email" 
                  required 
                  autoFocus 
                  value={forgotEmail} 
                  onChange={e => setForgotEmail(e.target.value)} 
                  placeholder="librarian@hnbgu.ac.in" 
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  type="button" 
                  onClick={() => { setForgot(false); setError('') }} 
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-white border border-gray-300 text-gray-700 text-sm sm:text-base font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm sm:text-base font-medium rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? <Spinner /> : 'Send OTP'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="mt-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4b6b4b] uppercase tracking-wide mb-1.5">
                  OTP (sent to email)
                </label>
                <input 
                  className="w-full px-3 py-2.5 sm:py-3 text-center text-xl sm:text-2xl font-mono tracking-widest bg-white border border-gray-300 rounded-lg focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none transition-all"
                  type="text" 
                  required 
                  maxLength={6} 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  placeholder="123456" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#4b6b4b] uppercase tracking-wide mb-1.5">
                  New password
                </label>
                <input 
                  className="w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base bg-white border border-gray-300 rounded-lg focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none transition-all"
                  type="password" 
                  required 
                  minLength={6} 
                  value={newPw} 
                  onChange={e => setNewPw(e.target.value)} 
                  placeholder="Min 6 characters" 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm sm:text-base font-medium rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Spinner /> : 'Reset password'}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-[#e8f0e8] text-center">
            <p className="text-xs text-gray-400">
              Student?{' '}
              <Link to="/student/login" className="text-brand-600 hover:text-brand-700 underline font-medium transition-colors">
                Student portal →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}