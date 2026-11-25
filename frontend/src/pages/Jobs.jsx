import { useEffect, useState } from 'react'
import { BriefcaseBusiness, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { extractList, getErrorMessage } from '../utils/response'
import { formatDate } from '../utils/formatDate'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const emptyForm = { title: '', company: '', description: '' }

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function fetchJobs() {
    try {
      const response = await api.get('/jobs')
      setJobs(extractList(response))
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not load jobs.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    try {
      await api.post('/jobs', form)
      toast.success('Job description saved.')
      setForm(emptyForm)
      setShowForm(false)
      await fetchJobs()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save job description.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this job description?')) return
    try {
      await api.delete(`/jobs/${id}`)
      setJobs((current) => current.filter((job) => (job._id || job.id) !== id))
      toast.success('Job description deleted.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete job.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Job descriptions</h2>
          <p className="mt-1 text-sm text-slate-500">Save the roles you want to target with your resume.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((value) => !value)}><Plus size={18} /> Add job</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">New job description</h3>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close form"><X size={18} /></button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="label" htmlFor="title">Job title</label><input className="input" id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Frontend Developer" required /></div>
            <div><label className="label" htmlFor="company">Company</label><input className="input" id="company" name="company" value={form.company} onChange={handleChange} placeholder="Company name" /></div>
          </div>
          <div><label className="label" htmlFor="description">Job description</label><textarea className="input min-h-40 resize-y" id="description" name="description" value={form.description} onChange={handleChange} placeholder="Paste responsibilities, qualifications and required skills..." required /></div>
          <div className="flex gap-3">
            <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save job'}</button>
            <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        {loading ? <div className="card lg:col-span-2"><LoadingSpinner label="Loading job descriptions..." /></div> : jobs.length === 0 ? (
          <div className="card lg:col-span-2"><EmptyState title="No saved jobs" description="Add a job description to compare its requirements with one of your resumes." action={<button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Add first job</button>} /></div>
        ) : jobs.map((job) => {
          const id = job._id || job.id
          return (
            <article key={id} className="card transition duration-300 hover:-translate-y-1 hover:border-indigo-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="rounded-xl bg-emerald-50 p-3 text-emerald-600"><BriefcaseBusiness size={21} /></span>
                  <div><h3 className="font-bold text-slate-900">{job.title || 'Untitled role'}</h3><p className="mt-1 text-sm text-slate-500">{job.company || 'Company not specified'}</p></div>
                </div>
                <button onClick={() => handleDelete(id)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50" title="Delete job"><Trash2 size={18} /></button>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">{(job.description || '').slice(0, 280)}{(job.description || '').length > 280 ? '…' : ''}</p>
              <p className="mt-4 text-xs text-slate-400">Added {formatDate(job.createdAt)}</p>
            </article>
          )
        })}
      </section>
    </div>
  )
}