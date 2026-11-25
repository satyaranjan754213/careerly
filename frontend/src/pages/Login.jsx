import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { loginSuccess } from '../features/auth/authSlice'
import api from '../services/api'
import { getErrorMessage } from '../utils/response'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/auth/login', form)
      const payload = response.data?.data || response.data
      if (!payload?.token || !payload?.user) {
        throw new Error('The login API must return a token and user.')
      }
      dispatch(loginSuccess({ token: payload.token, user: payload.user }))
      toast.success('Welcome back!')
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error, error.message || 'Login failed. Check your details.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your career journey.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
        </div>
        <button className="btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">Don't have an account? <Link className="font-semibold text-indigo-600 hover:text-indigo-700" to="/register">Create account</Link></p>
    </AuthShell>
  )
}

function AuthShell({ title, subtitle, children }) {
  return (
    <main className="grid min-h-screen bg-[#17181a] lg:grid-cols-[1fr_480px]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute bottom-[-120px] right-[-80px] h-96 w-96 rounded-full bg-white/5" />
        <Link to="/login" className="relative z-10 flex items-center gap-3 text-xl font-extrabold">
        <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-lg text-indigo-600 shadow-xl">C</span>
          Careerly
        </Link>
        <div className="relative z-10 max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-200">Your next role starts here</p>
          <h2 className="mt-4 text-5xl font-bold leading-[1.08]">Turn career data into clear next steps.</h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-indigo-100">Organize your resumes, understand every job match and keep improving with focused recommendations.</p>
        </div>
        <p className="relative z-10 text-sm text-indigo-200">Careerly workspace</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <Link to="/login" className="mb-10 flex items-center gap-3 text-xl font-extrabold text-slate-900 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white">C</span>
            Careerly
          </Link>
          <div className="mb-8">
            <p className="mb-2 text-sm font-bold text-indigo-600">Careerly account</p>
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}