import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, BriefcaseBusiness, ChartNoAxesCombined, Settings, LogOut, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/resumes', label: 'My resumes', icon: FileText },
  { to: '/jobs', label: 'Job descriptions', icon: BriefcaseBusiness },
  { to: '/assessments', label: 'Assessments', icon: ChartNoAxesCombined },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ mobileOpen = false, onClose }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
    onClose?.()
  }

  return (
    <>
      {mobileOpen && <button aria-label="Close menu overlay" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" />}
      <aside className={`${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#34363a] bg-[#202124] transition-transform lg:translate-x-0`}>
        <div className="flex h-[88px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#ec6b56] text-lg font-black text-white shadow-lg shadow-black/30">C</div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-[#f7f4ef]">Careerly</div>
              <div className="text-[11px] font-medium text-[#8f8f93]">AI career companion</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-[#aaa9a4] hover:bg-[#303136] lg:hidden" aria-label="Close menu">
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#77787d]">Workspace</p>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose} className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-[#56d3b5]/12 text-[#70dfc4] shadow-[inset_3px_0_0_#56d3b5]' : 'text-[#aaa9a4] hover:bg-[#303136] hover:text-[#f7f4ef]'}`
            }>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="m-4 rounded-2xl border border-[#73543d] bg-gradient-to-br from-[#4a3829] to-[#39302a] p-4">
          <p className="text-sm font-semibold text-[#f3c98a]">Career tip</p>
          <p className="mt-2 text-xs leading-5 text-[#d1bea2]">Tailor your resume to the skills and language used in each job description.</p>
        </div>

        <button onClick={handleLogout} className="m-4 mt-0 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50">
          <LogOut size={19} /> Log out
        </button>
      </aside>
    </>
  )
}