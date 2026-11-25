import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, BriefcaseBusiness, ChartNoAxesCombined, ArrowUpRight } from 'lucide-react'
import api from '../services/api'
import { extractList } from '../utils/response'
import { formatDate } from '../utils/formatDate'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function Dashboard() {
  const [stats, setStats] = useState({ resumes: 0, jobs: 0, assessments: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function loadDashboard() {
      try {
        const [resumeRes, jobRes, assessmentRes] = await Promise.all([
          api.get('/resumes'),
          api.get('/jobs'),
          api.get('/assessments'),
        ])
        if (!active) return
        const resumes = extractList(resumeRes)
        const jobs = extractList(jobRes)
        const assessments = extractList(assessmentRes)
        setStats({ resumes: resumes.length, jobs: jobs.length, assessments: assessments.length })
        setRecent(assessments.slice(0, 5))
      } catch (error) {
        console.error('Dashboard data could not be loaded:', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadDashboard()
    return () => { active = false }
  }, [])

  const cards = [
    { label: 'My resumes', value: stats.resumes, icon: FileText, to: '/resumes', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Job descriptions', value: stats.jobs, icon: BriefcaseBusiness, to: '/jobs', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Assessments', value: stats.assessments, icon: ChartNoAxesCombined, to: '/assessments', color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[24px] border border-[#9a4f43] bg-gradient-to-br from-[#8e493e] via-[#6e3d45] to-[#3c4f61] px-6 py-7 shadow-[0_18px_45px_rgba(0,0,0,0.24)] md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f5c5b9]">Your workspace</p>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">Build a stronger career profile</h2>
            <p className="mt-2 max-w-xl text-sm text-[#ded4d0]">Keep your resumes organized, target the right roles and turn every assessment into an action plan.</p>
          </div>
          <Link to="/assessments" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5">
            Start assessment <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, to, color }) => (
          <Link to={to} key={label} className="card group transition duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-[0_16px_40px_rgba(79,70,229,0.10)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <span className={`rounded-xl p-3 ${color}`}><Icon size={21} /></span>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{loading ? '—' : value}</span>
              <ArrowUpRight className="text-slate-300 group-hover:text-indigo-600" size={20} />
            </div>
          </Link>
        ))}
      </section>

      <section className="card">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">Recent assessments</h3>
            <p className="mt-1 text-sm text-slate-500">Your latest resume-to-job comparisons.</p>
          </div>
          <Link to="/assessments" className="text-sm font-semibold text-indigo-600">View all</Link>
        </div>
        {loading ? <LoadingSpinner label="Loading your activity..." /> : recent.length === 0 ? (
          <EmptyState title="No assessments yet" description="Add a resume and a job description, then run an assessment to see your results here." action={<Link className="btn-primary" to="/assessments">Go to assessments</Link>} />
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((item) => (
              <div key={item._id || item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-semibold text-slate-800">{item.jobTitle || item.title || 'Resume assessment'}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">{item.score ?? item.matchScore ?? '—'}{item.score != null || item.matchScore != null ? '%' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}