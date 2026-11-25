import { useEffect, useRef, useState } from 'react'
import { FileText, Upload, Trash2, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { extractList, getErrorMessage } from '../utils/response'
import { formatDate } from '../utils/formatDate'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function Resumes() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef(null)

  async function fetchResumes() {
    try {
      const response = await api.get('/resumes')
      setResumes(extractList(response))
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not load resumes.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResumes() }, [])

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type)) {
      toast.error('Please choose a PDF or DOCX file.')
      event.target.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be smaller than 10 MB.')
      event.target.value = ''
      return
    }

    const data = new FormData()
    // The field name "resume" must match uploadMiddleware in the backend.
    data.append('resume', file)
    setUploading(true)
    try {
      await api.post('/resumes/upload', data)
      toast.success('Resume uploaded successfully.')
      await fetchResumes()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Resume upload failed.'))
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this resume? This cannot be undone.')) return
    try {
      await api.delete(`/resumes/${id}`)
      setResumes((current) => current.filter((item) => (item._id || item.id) !== id))
      toast.success('Resume deleted.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete resume.'))
    }
  }

  async function handleDownload(id, filename) {
    try {
      const response = await api.get(`/resumes/${id}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename || 'resume'
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not download resume.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My resumes</h2>
          <p className="mt-1 text-sm text-slate-500">Upload PDF or DOCX files and keep your versions organized.</p>
        </div>
        <div>
          <input ref={fileInput} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleUpload} className="hidden" />
          <button className="btn-primary" onClick={() => fileInput.current?.click()} disabled={uploading}>
            <Upload size={17} /> {uploading ? 'Uploading...' : 'Upload resume'}
          </button>
        </div>
      </div>

      <section className="card px-3 py-3 sm:px-5 sm:py-5">
        {loading ? <LoadingSpinner label="Loading resumes..." /> : resumes.length === 0 ? (
          <EmptyState title="No resumes uploaded" description="Choose a PDF or DOCX resume to get started." action={<button className="btn-primary" onClick={() => fileInput.current?.click()}><Upload size={16} /> Choose file</button>} />
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => {
              const id = resume._id || resume.id
              const filename = resume.originalName || resume.fileName || resume.name || 'Resume'
              return (
                <article key={id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><FileText size={22} /></div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800">{filename}</p>
                      <p className="mt-1 text-xs text-slate-500">Uploaded {formatDate(resume.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDownload(id, filename)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Download"><Download size={18} /></button>
                    <button onClick={() => handleDelete(id)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50" title="Delete"><Trash2 size={18} /></button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
      <p className="text-xs text-slate-400">Supported formats: PDF and DOCX. Maximum size: 10 MB.</p>
    </div>
  )
}