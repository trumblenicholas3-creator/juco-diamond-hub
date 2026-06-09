import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'

const POSITIONS = ['','Pitcher','Catcher','First Base','Second Base','Third Base','Shortstop','Left Field','Center Field','Right Field','Utility','Designated Player']
const STATES = ['','AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
const GRAD_YEARS = ['','2025','2026','2027','2028']

const statusColors = {
  'Available': 'bg-green-light text-green-darker',
  'Committed': 'bg-blue-50 text-blue-800',
  : 'bg-amber-50 text-amber-800',
}

export default function AthletesPage() {
  const [athletes, setAthletes] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [filters, setFilters] = useState({ position: '', state: '', grad_year: '', search: '' })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return
      setUser(data.user)
      const { data: coach } = await supabase.from('coaches').select('id').eq('user_id', data.user.id).single()
      setUserType(coach ? 'coach' : 'athlete')
    })
  }, [])

  const fetchAthletes = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('athletes').select('id, first_name, last_name, position, school, state, city, conference, grad_year, recruiting_status, gpa, hudl_url, youtube_url, video_url').order('created_at', { ascending: false })
    if (filters.position) query = query.eq('position', filters.position)
    if (filters.state) query = query.eq('state', filters.state)
    if (filters.grad_year) query = query.eq('grad_year', filters.grad_year)
    if (filters.search) query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,school.ilike.%${filters.search}%`)
    const { data } = await query.limit(60)
    setAthletes(data || [])
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchAthletes() }, [fetchAthletes])

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} userType={userType} />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="font-condensed font-semibold text-xs tracking-widest uppercase text-green-hub mb-1">JUCO talent</div>
          <h1 className="font-condensed font-black text-4xl text-gray-900 mb-2">Athlete profiles</h1>
          <p className="text-sm text-gray-500 max-w-lg">Junior college softball athletes seeking four-year opportunities. Coaches must be verified to view full profiles and contact athletes.</p>
        </div>

        <div className="card mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="md:col-span-1">
              <label className="label">Search</label>
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
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4">{athletes.length} athletes</p>

        {loading ? (
          <div className="text-center py-16 text-gray-400 font-condensed uppercase tracking-widest text-sm">Loading athletes...</div>
        ) : athletes.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">⚾</div>
            <div className="font-condensed font-bold text-xl text-gray-600 mb-2">No athletes yet</div>
            <p className="text-sm text-gray-400 mb-5">Be the first to create a profile!</p>
            <Link href="/athlete/signup" className="btn-primary inline-block">Create free profile →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {athletes.map(a => (
              <div key={a.id} className="card hover:border-green-hub transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-green-light border border-green-mid flex items-center justify-center font-condensed font-black text-base text-green-darker flex-shrink-0">
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
                  {a.gpa && <div className="bg-gray-50 rounded-lg p-2 text-center"><div className="font-condensed font-black text-base text-gray-900">{a.gpa}</div><div className="font-condensed text-xs uppercase tracking-wider text-gray-400">GPA</div></div>}
                  {a.grad_year && <div className="bg-gray-50 rounded-lg p-2 text-center"><div className="font-condensed font-black text-base text-gray-900">{a.grad_year}</div><div className="font-condensed text-xs uppercase tracking-wider text-gray-400">Grad</div></div>}
                  {(a.hudl_url || a.youtube_url || a.video_url) && <div className="bg-gray-50 rounded-lg p-2 text-center"><div className="font-condensed font-black text-base text-gray-900">▶</div><div className="font-condensed text-xs uppercase tracking-wider text-gray-400">Film</div></div>}
                </div>

                {userType === 'coach' ? (
                  <Link href={`/athlete/${a.id}`} className="block w-full text-center btn-primary text-xs py-2">
                    View full profile →
                  </Link>
                ) : (
                  <div className="text-center py-2 text-xs text-gray-400 bg-gray-50 rounded-lg border border-gray-100">
                    🔒 Verified coaches only — <Link href="/coach/signup" className="text-green-hub underline">apply here</Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!user && (
          <div className="mt-10 bg-green-light rounded-xl p-6 flex items-center justify-between gap-4">
            <div>
              <div className="font-condensed font-black text-xl text-green-darker mb-1">Are you a JUCO athlete?</div>
              <p className="text-sm text-green-dark">Create your free profile and get in front of college coaches today.</p>
            </div>
            <Link href="/athlete/signup" className="btn-primary flex-shrink-0">Create free profile →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
