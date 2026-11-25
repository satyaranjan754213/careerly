import { useEffect, useState } from 'react'
import { ChartNoAxesCombined, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { extractList, getErrorMessage } from '../utils/response'
import { formatDate } from '../utils/formatDate'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function Assessments() {
  const [assessments, setAssessments] = useState([])
  const [resumes, setResumes] = useState([])
  const [jobs, setJobs] = useState([])
  const [resumeId, setResumeId] = useState('')
  const [jobId, setJobId] = useState('')
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [selected, setSelected] = useState(null)

  async function loadData() {
    try {
      const [assessmentRes, resumeRes, jobRes] = await Promise.all([
        api.get('/assessments'), api.get('/resumes'), api.get('/jobs'),
      ])
      setAssessments(extractList(assessmentRes))
      setResumes(extractList(resumeRes))
      setJobs(extractList(jobRes))
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not load assessment data.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function runAssessment(event) {
    event.preventDefault()
    if (!resumeId || !jobId) return toast.error('Select both a resume and a job description.')
    setRunning(true)
    try {
      // Backend should accept resumeId and jobId and return the saved assessment.
      const response = await api.post('/assessments', { resumeId, jobId })
      const result = response.data?.data || response.data
      toast.success('Assessment completed.')
      setSelected(result)
      await loadData()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Assessment could not be completed.'))
    } finally {
      setRunning(false)
    }
  }

  const score = selected?.score ?? selected?.matchScore

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Resume assessments</h2>
        <p className="mt-1 text-sm text-slate-500">Compare a resume with a target job and review the skill match.</p>
      </div>

      <form onSubmit={runAssessment} className="card">
        <div className="mb-4 flex items-center gap-2"><Sparkles className="text-indigo-600" size={20} /><h3 className="font-bold text-slate-900">Run a new assessment</h3></div>
        {loading ? <LoadingSpinner /> : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label" htmlFor="resumeId">Choose resume</label>
                <select className="input" id="resumeId" value={resumeId} onChange={(e) => setResumeId(e.target.value)} required>
                  <option value="">Select a resume</option>
                  {resumes.map((resume) => <option key={resume._id || resume.id} value={resume._id || resume.id}>{resume.originalName || resume.fileName || resume.name || 'Resume'}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="jobId">Choose job</label>
                <select className="input" id="jobId" value={jobId} onChange={(e) => setJobId(e.target.value)} required>
                  <option value="">Select a job description</option>
                  {jobs.map((job) => <option key={job._id || job.id} value={job._id || job.id}>{job.title}{job.company ? ` — ${job.company}` : ''}</option>)}
                </select>
              </div>
            </div>
            <button className="btn-primary mt-5" type="submit" disabled={running || !resumes.length || !jobs.length}>{running ? 'Analyzing...' : 'Analyze resume'}</button>
            {(!resumes.length || !jobs.length) && <p className="mt-3 text-xs text-slate-500">You need at least one uploaded resume and one saved job description.</p>}
          </>
        )}
      </form>

      {selected && (
        <section className="card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="font-bold text-slate-900">Latest assessment result</h3><p className="text-sm text-slate-500">{selected.jobTitle || 'Resume and job comparison'}</p></div>
            <div className="rounded-2xl bg-indigo-50 px-5 py-3 text-center"><p className="text-xs text-indigo-600">Match score</p><p className="text-2xl font-bold text-indigo-700">{score ?? '—'}{score != null ? '%' : ''}</p></div>
          </div>
          {selected.summary && <p className="mt-4 text-sm leading-6 text-slate-600">{selected.summary}</p>}
          <SkillList title="Matched skills" values={selected.matchedSkills} />
          <SkillList title="Missing skills" values={selected.missingSkills} />
          <SkillList title="Suggestions" values={selected.suggestions || selected.recommendations} />
        </section>
      )}

      <section className="card">
        <div className="mb-4 flex items-center gap-2"><ChartNoAxesCombined className="text-indigo-600" size={20} /><h3 className="font-bold text-slate-900">Assessment history</h3></div>
        {loading ? <LoadingSpinner /> : assessments.length === 0 ? (
          <EmptyState title="No assessments yet" description="Your completed resume comparisons will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><th className="px-3 py-3">Job</th><th className="px-3 py-3">Score</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Result</th></tr></thead>
              <tbody>
                {assessments.map((item) => <tr key={item._id || item.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-3 py-4 text-sm font-medium text-slate-800">{item.jobTitle || item.title || 'Resume assessment'}</td>
                  <td className="px-3 py-4 text-sm font-semibold text-indigo-600">{item.score ?? item.matchScore ?? '—'}{item.score != null || item.matchScore != null ? '%' : ''}</td>
                  <td className="px-3 py-4 text-sm text-slate-500">{formatDate(item.createdAt)}</td>
                  <td className="px-3 py-4"><button className="text-sm font-semibold text-indigo-600 hover:underline" onClick={() => setSelected(item)}>View result</button></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function SkillList({ title, values }) {
  if (!Array.isArray(values) || values.length === 0) return null
  return <div className="mt-5"><h4 className="text-sm font-semibold text-slate-800">{title}</h4><div className="mt-2 flex flex-wrap gap-2">{values.map((value, index) => <span key={`${value}-${index}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{typeof value === 'string' ? value : value.name || value.skill || JSON.stringify(value)}</span>)}</div></div>
}