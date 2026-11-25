import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { getErrorMessage } from '../utils/response'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.password.length < 8) return toast.error('Password must contain at least 8 characters.')
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.')

    setLoading(true)
    try {
      await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      toast.success('Account created. Please log in.')
      navigate('/login')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Registration failed.'))
    } finally {
      setLoading(false)
    }
  }

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
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-200">Start with confidence</p>
          <h2 className="mt-4 text-5xl font-bold leading-[1.08]">Build the profile that gets noticed.</h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-indigo-100">One focused workspace for your resumes, target roles and AI-powered job assessments.</p>
        </div>
        <p className="relative z-10 text-sm text-indigo-200">Careerly workspace</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <Link to="/login" className="mb-8 flex items-center gap-3 text-xl font-extrabold text-slate-900 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white">C</span>
            Careerly
          </Link>
          <div className="mb-7">
            <p className="mb-2 text-sm font-bold text-indigo-600">Create account</p>
            <h1 className="text-3xl font-bold text-slate-900">Build your career workspace</h1>
            <p className="mt-2 text-sm text-slate-500">Start organizing your resumes and career goals.</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input className="input" id="name" name="name" value={form.name} onChange={handleChange} autoComplete="name" placeholder="Your name" required />
          </div>
          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input className="input" id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input className="input" id="password" name="password" type="password" minLength="8" value={form.password} onChange={handleChange} autoComplete="new-password" placeholder="At least 8 characters" required />
          </div>
          <div>
            <label className="label" htmlFor="confirmPassword">Confirm password</label>
            <input className="input" id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" placeholder="Enter password again" required />
          </div>
          <button className="btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link className="font-semibold text-indigo-600" to="/login">Log in</Link></p>
        </div>
      </section>
    </main>
  )
}