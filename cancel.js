import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import { supabase } from '../../lib/supabase'

const POSITIONS = ['','Pitcher','Catcher','First Base','Second Base','Third Base','Shortstop','Left Field','Center Field','Right Field','Utility','Designated Player']
const STATES = ['','AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
const GRAD_YEARS = ['','2025','2026','2027','2028']
const STATUS_OPTIONS = ['','Available','Committed']

const statusColors = {
  'Available': 'bg-green-light text-green-darker',
  'Committed': 'bg-blue-50 text-blue-800',
  : 'bg-amber-50 text-amber-800',
}

export default function AthleteSearch() {
  const router = useRouter()
  const [athletes, setAthletes] = useState([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)
  const [filters, setFilters] = useState({
    position: '', state: '', grad_year: '',
    recruiting_status: '', min_gpa: '', search: ''
  })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) { router.push('/coach/login'); return }
      setUser(data.user)
      const { data: coach } = await supabase.from('coaches').select('id').eq('user_id', data.user.id).single()
      if (!coach) { router.push('/athlete/dashboard'); return }
      setChecking(false)
    })
  }, [])

  const fetchAthletes = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('athletes').select('*').order('created_at', { ascending: false })
    if (filters.position) query = query.eq('position', filters.position)
    if (filters.state) query = query.eq('state', filters.state)
    if (filters.grad_year) query = query.eq('grad_year', filters.grad_year)
    if (filters.recruiting_status) query = query.eq('recruiting_status', filters.recruiting_status)
    if (filters.min_gpa) query = query.gte('gpa', parseFloat(filters.min_gpa))
    if (filters.search) query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,school.ilike.%${filters.search}%`)
    const { data } = await query.limit(50)
    setAthletes(data || [])
    setLoading(false)
  }, [filters])

  useEffect(() => { if (!checking) fetchAthletes() }, [fetchAthletes, checking])

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  if (checking) return (
    <div className="min-h-screen bg-white"><Navbar />
      <div className="flex items-center justify-center h-64 text-gray-400 font-condensed uppercase tracking-widest text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} userType="coach" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-condensed font-black text-3xl text-gray-900">Browse athletes</h1>
            <p className="text-sm text-gray-500 mt-0.5">{athletes.length} athletes found</p>
          </div>
          <Link href="/coach/saved" className="btn-secondary text-xs px-4 py-2">
            🔖 Saved prospects
          </Link>
        </div>

        <div className="card mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2">
              <label className="label">Search name / school</label>
              <input className="input" value={filters.search} onChange={e => setFilter('search', e.target.value)} placeholder="Name or school..." />
            </div>
            <div>
              <label className="label">Position</label>
              <select className="input" value={filters.position} onChange={e => setFilter('position', e.target.value)}>
                {POSITIONS.map(p => <option key={p} value={p}>{p || 'All positions'}</option>)}
              </select>
            </div>
            <div>
              <label className="label">State</label>
              <select className="input" value={filters.state} onChange={e => setFilter('state', e.target.value)}>
                {STATES.map(s => <option key={s} value={s}>{s || 'All states'}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Grad year</label>
              <select className="input" value={filters.grad_year} onChange={e => setFilter('grad_year', e.target.value)}>
                {GRAD_YEARS.map(y => <option key={y} value={y}>{y || 'All years'}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={filters.recruiting_status} onChange={e => setFilter('recruiting_status', e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'Any status'}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-32">
              <label className="label">Min GPA</label>
              <input className="input" type="number" step="0.1" min="0" max="4.0" value={filters.min_gpa} onChange={e => setFilter('min_gpa', e.target.value)} placeholder="2.5" />
            </div>
            <button onClick={() => setFilters({ position:'',state:'',grad_year:'',recruiting_status:'',min_gpa:'',search:'' })}
              className="btn-secondary text-xs px-3 py-2 mt-4">Clear filters</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 font-condensed font-semibold text-sm tracking-widest uppercase">Searching...</div>
        ) : athletes.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-condensed font-bold text-lg text-gray-600 mb-1">No athletes found</div>
            <p className="text-sm text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {athletes.map(a => (
              <div key={a.id} className="card hover:border-green-hub transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-light border border-green-mid flex items-center justify-center font-condensed font-black text-lg text-green-darker flex-shrink-0">
                    {a.first_name?.[0]}{a.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-condensed font-black text-lg text-gray-900 leading-tight">{a.first_name} {a.last_name}</div>
                    <div className="text-xs text-gray-400 truncate">{a.school}</div>
                    <div className="text-xs text-gray-400">{a.city && a.state ? `${a.city}, ${a.state}` : a.state}</div>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {a.position && <span className="tag bg-green-light text-green-darker text-xs">{a.position}</span>}
                  {a.conference && <span className="tag bg-blue-50 text-blue-800 text-xs">{a.conference}</span>}
                  {a.recruiting_status && <span className={`tag text-xs ${statusColors[a.recruiting_status] || 'bg-gray-100 text-gray-600'}`}>{a.recruiting_status}</span>}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {a.gpa && <div className="bg-gray-50 rounded-lg p-2 text-center"><div className="font-condensed font-black text-lg text-gray-900">{a.gpa}</div><div className="font-condensed text-xs uppercase tracking-wider text-gray-400">GPA</div></div>}
                  {a.grad_year && <div className="bg-gray-50 rounded-lg p-2 text-center"><div className="font-condensed font-black text-lg text-gray-900">{a.grad_year}</div><div className="font-condensed text-xs uppercase tracking-wider text-gray-400">Grad</div></div>}
                  {(a.hudl_url || a.youtube_url || a.video_url) && <div className="bg-gray-50 rounded-lg p-2 text-center"><div className="font-condensed font-black text-lg text-gray-900">▶</div><div className="font-condensed text-xs uppercase tracking-wider text-gray-400">Film</div></div>}
                </div>
                <Link href={`/athlete/${a.id}`} className="block w-full text-center btn-secondary text-xs py-2">
                  View full profile →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
