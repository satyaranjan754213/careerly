import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

const pageMeta = {
  '/': ['Overview', 'Your career progress at a glance'],
  '/resumes': ['My resumes', 'Upload, organize and manage your resume versions'],
  '/jobs': ['Job descriptions', 'Save roles and compare your qualifications'],
  '/assessments': ['Assessments', 'Review your resume analysis history'],
  '/settings': ['Settings', 'Manage your profile and preferences'],
}

export default function AppLayout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [title, subtitle] = pageMeta[location.pathname] || ['Careerly', 'Your career workspace']

  return (
    <div className="min-h-screen bg-[#17181a]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="min-h-screen lg:pl-64">
        <Header title={title} subtitle={subtitle} onMenuClick={() => setMobileOpen(true)} />
        <div className="mx-auto max-w-[1440px] px-5 py-7 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}