import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import { supabase } from '../../lib/supabase'

const statusColors = {
  'Available': 'bg-green-light text-green-darker',
  'Committed': 'bg-blue-50 text-blue-800',
  'Exploring Opportunities': 'bg-amber-50 text-amber-800',
}

export default function SavedProspects() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [prospects, setProspects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) { router.push('/coach/login'); return }
      setUser(data.user)
      const { data: saved } = await supabase
        .from('saved_prospects')
        .select('athlete_id, athletes(*)')
        .eq('coach_id', data.user.id)
        .order('created_at', { ascending: false })
      setProspects(saved?.map(s => s.athletes).filter(Boolean) || [])
      setLoading(false)
    })
  }, [])

  const removeSaved = async (athleteId) => {
    await supabase.from('saved_prospects').delete().eq('coach_id', user.id).eq('athlete_id', athleteId)
    setProspects(p => p.filter(a => a.id !== athleteId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} userType="coach" />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-condensed font-black text-3xl text-gray-900">Saved prospects</h1>
            <p className="text-sm text-gray-500 mt-0.5">{prospects.length} athletes saved</p>
          </div>
          <Link href="/coach/dashboard" className="btn-secondary text-xs px-4 py-2">← Back to search</Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 font-condensed font-semibold text-sm tracking-widest uppercase">Loading...</div>
        ) : prospects.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">🔖</div>
            <div className="font-condensed font-bold text-xl text-gray-600 mb-2">No saved prospects yet</div>
            <p className="text-sm text-gray-400 mb-5">Save athletes from the search page to build your recruiting board.</p>
            <Link href="/coach/dashboard" className="btn-primary inline-block">Browse athletes →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {prospects.map(a => (
              <div key={a.id} className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-light border border-green-mid flex items-center justify-center font-condensed font-black text-lg text-green-darker flex-shrink-0">
                  {a.first_name?.[0]}{a.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-condensed font-black text-lg text-gray-900">{a.first_name} {a.last_name}</div>
                  <div className="text-xs text-gray-400">{a.school} · {a.city && a.state ? `${a.city}, ${a.state}` : a.state}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {a.position && <span className="tag bg-green-light text-green-darker text-xs">{a.position}</span>}
                  {a.grad_year && <span className="tag bg-gray-100 text-gray-600 text-xs">{a.grad_year}</span>}
                  {a.recruiting_status && <span className={`tag text-xs ${statusColors[a.recruiting_status] || 'bg-gray-100 text-gray-600'}`}>{a.recruiting_status}</span>}
                  {a.gpa && <span className="font-condensed font-bold text-sm text-gray-600">{a.gpa} GPA</span>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={`mailto:${a.email}`} className="btn-primary text-xs px-3 py-2">Contact</a>
                  <Link href={`/athlete/${a.id}`} className="btn-secondary text-xs px-3 py-2">Profile</Link>
                  <button onClick={() => removeSaved(a.id)} className="text-gray-300 hover:text-red-400 transition-colors text-lg" title="Remove">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
