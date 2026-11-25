import { useState } from 'react'
import { Menu, Bell, Search } from 'lucide-react'
import { useSelector } from 'react-redux'

export default function Header({ title, subtitle, onMenuClick }) {
  const user = useSelector((state) => state.auth.user)
  const [search, setSearch] = useState('')
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-20 border-b border-[#34363a] bg-[#17181a]/90 backdrop-blur-xl">
      <div className="flex min-h-[88px] items-center justify-between gap-4 px-5 md:px-8">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="rounded-lg p-2 text-[#aaa9a4] hover:bg-[#303136] lg:hidden" aria-label="Open menu">
            <Menu size={21} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#f7f4ef]">{title}</h1>
            <p className="mt-1 hidden text-sm text-[#aaa9a4] sm:block">{subtitle}</p>
          </div>
        </div>

        <div className="hidden w-full max-w-xs items-center gap-2 rounded-xl border border-[#45474d] bg-[#232529] px-3 py-2.5 md:flex">
          <Search size={17} className="text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Careerly..." className="w-full bg-transparent text-sm text-[#ede9e3] outline-none placeholder:text-[#77787d]" />
        </div>

        <div className="flex items-center gap-3">
          <button className="relative rounded-xl p-2.5 text-[#aaa9a4] hover:bg-[#303136]" aria-label="Notifications">
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700" title={user?.name || 'User'}>
            {initial}
          </div>
        </div>
      </div>
    </header>
  )
}