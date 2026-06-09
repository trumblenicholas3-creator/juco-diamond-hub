import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import { supabase } from '../../lib/supabase'

export default function AdminCoaches() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) { router.push('/signin'); return }
      if (data.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) { router.push('/'); return }
      setUser(data.user)
      const { data: coachData, error: fetchError } = await supabase
        .from('coaches')
        .select('*')
        .order('created_at', { ascending: false })
      if (fetchError) { setError(fetchError.message); setLoading(false); return }
      setCoaches(coachData || [])
      setLoading(false)
    })
  }, [])

  const approve = async (id) => {
    const { error } = await supabase.from('coaches').update({ verified: true, denied: false }).eq('id', id)
    if (error) { alert(error.message); return }
    const { data } = await supabase.from('coaches').select('*').order('created_at', { ascending: false })
    setCoaches(data || [])
  }

  const deny = async (id) => {
    const { error } = await supabase.from('coaches').update({ verified: false, denied: true }).eq('id', id)
    if (error) { alert(error.message); return }
    const { data } = await supabase.from('coaches').select('*').order('created_at', { ascending: false })
    setCoaches(data || [])
  }

  const deleteCoach = async (coachUserId, coachId) => {
    if (!window.confirm('Delete this coach account permanently?')) return
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/delete-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ admin_delete_id: coachUserId })
    })
    setCoaches(c => c.filter(coach => coach.id !== coachId))
  }

  const filtered = filter === 'all' ? coaches
    : filter === 'pending' ? coaches.filter(c => !c.verified && !c.denied)
    : filter === 'approved' ? coaches.filter(c => c.verified)
    : coaches.filter(c => c.denied)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="max-w-5xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-condensed font-black text-3xl text-gray-900">Coach approvals</h1>
            <p className="text-sm text-gray-500 mt-0.5">{coaches.length} total coaches in database</p>
          </div>
          <div className="flex gap-2">
            {['all','pending','approved','denied'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`font-condensed font-bold text-xs tracking-wider uppercase px-4 py-2 rounded-lg border transition-colors
                  ${filter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                {f} {f === 'all' ? `(${coaches.length})` : f === 'pending' ? `(${coaches.filter(c => !c.verified && !c.denied).length})` : f === 'approved' ? `(${coaches.filter(c => c.verified).length})` : `(${coaches.filter(c => c.denied).length})`}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm text-red-600">
            Error loading coaches: {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400 font-condensed uppercase tracking-widest text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">📋</div>
            <div className="font-condensed font-bold text-lg text-gray-500">No {filter} coaches</div>
            <p className="text-xs text-gray-400 mt-2">Total in database: {coaches.length}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <div key={c.id} className="card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-condensed font-black text-lg text-blue-800 flex-shrink-0 overflow-hidden">
                    {c.photo_url
                      ? <img src={c.photo_url} alt="" className="w-full h-full object-cover" />
                      : `${c.first_name?.[0] || ''}${c.last_name?.[0] || ''}`
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-condensed font-black text-lg text-gray-900">{c.first_name} {c.last_name}</div>
                    <div className="text-sm text-gray-600">{c.title}{c.school ? ` — ${c.school}` : ''}</div>
                    <div className="text-xs text-gray-400">{c.email}{c.phone ? ` · ${c.phone}` : ''}</div>
                    {c.division && <div className="text-xs text-gray-400">{c.division}{c.location ? ` · ${c.location}` : ''}</div>}
                    {c.reason && <div className="text-xs text-gray-500 mt-1.5 italic">"{c.reason}"</div>}
                    <div className="flex items-center gap-2 mt-2">
                      {c.verified && <span className="tag bg-green-light text-green-darker text-xs">✓ Approved</span>}
                      {c.denied && <span className="tag bg-red-50 text-red-600 text-xs">✕ Denied</span>}
                      {!c.verified && !c.denied && <span className="tag bg-amber-50 text-amber-700 text-xs">⏳ Pending</span>}
                      <span className="text-xs text-gray-300">Applied {new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!c.verified && (
                      <button onClick={() => approve(c.id)} className="btn-primary text-xs px-4 py-2">✓ Approve</button>
                    )}
                    {!c.denied && (
                      <button onClick={() => deny(c.id)} className="font-condensed font-bold text-xs px-4 py-2 border border-red-200 text-red-400 rounded hover:bg-red-50 transition-colors">✕ Deny</button>
                    )}
                    {c.verified && (
                      <button onClick={() => deny(c.id)} className="font-condensed font-bold text-xs px-4 py-2 border border-gray-200 text-gray-400 rounded hover:bg-gray-50 transition-colors">Revoke</button>
                    )}
                    <button onClick={() => deleteCoach(c.user_id, c.id)} className="font-condensed font-bold text-xs px-4 py-2 border border-red-100 text-red-300 rounded hover:bg-red-50 transition-colors">🗑 Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
