import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'

export default function CoachesPage() {
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [search, setSearch] = useState('')

  const [isPremium, setIsPremium] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        setUser(data.user)
        const { data: coach } = await supabase.from('coaches').select('id, verified').eq('user_id', data.user.id).single()
        if (coach) {
          setUserType('coach')
          setIsPremium(true) // coaches always see the list
        } else {
          const { data: athlete } = await supabase.from('athletes').select('is_featured').eq('user_id', data.user.id).single()
          setUserType('athlete')
          setIsPremium(athlete?.is_featured || false)
        }
      }
      setAuthChecked(true)
    })
    supabase.from('coaches').select('id, first_name, last_name, title, school, division, location, photo_url, verified').eq('verified', true).order('school', { ascending: true })
      .then(({ data }) => { setCoaches(data || []); setLoading(false) })
  }, [])

  const filtered = coaches.filter(c =>
    `${c.first_name} ${c.last_name} ${c.school} ${c.title} ${c.division || ''}`.toLowerCase().includes(search.toLowerCase())
  )

  // Gate entire page for non-premium athletes
  if (authChecked && userType === 'athlete' && !isPremium) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} userType={userType} />
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="font-condensed font-black text-4xl text-gray-900 mb-3">Coaches are premium only</h1>
          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md mx-auto">
            Upgrade to Athlete Spotlight to unlock the full verified coaches directory — including contact info for every coach actively recruiting JUCO talent.
          </p>
          <div className="bg-green-light border border-green-mid rounded-2xl p-8 mb-6">
            <div className="font-condensed font-black text-2xl text-green-darker mb-2">Athlete Spotlight</div>
            <div className="font-condensed font-black text-4xl text-green-hub mb-3">$9.99</div>
            <ul className="text-sm text-green-darker space-y-2 mb-6 text-left max-w-xs mx-auto">
              {['Full verified coaches directory','Direct coach contact info','Featured at top of search results','Spotlight badge on your profile','30 days of enhanced exposure'].map(f => (
                <li key={f} className="flex items-center gap-2"><span>✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/upgrade" className="btn-primary inline-block px-10 py-3">Unlock now — $9.99 →</Link>
          </div>
          <p className="text-xs text-gray-400">One-time payment. No subscription required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} userType={userType} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="font-condensed font-semibold text-xs tracking-widest uppercase text-green-hub mb-1">Verified coaches</div>
          <h1 className="font-condensed font-black text-4xl text-gray-900 mb-2">College coaching staff</h1>
          <p className="text-sm text-gray-500 max-w-lg">
            These verified coaches are actively recruiting JUCO softball talent. All coaches have been reviewed and approved by JUCO Diamond Hub.
          </p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <input className="input max-w-sm" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, school, or division..." />
          <span className="text-xs text-gray-400 font-condensed uppercase tracking-wider">{filtered.length} coaches</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 font-condensed uppercase tracking-widest text-sm">Loading coaches...</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">🏫</div>
            <div className="font-condensed font-bold text-xl text-gray-600 mb-2">No coaches yet</div>
            <p className="text-sm text-gray-400 mb-5">Are you a college coach? Apply for access.</p>
            <Link href="/coach/signup" className="btn-primary inline-block">Apply as a coach →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => {
              const initials = `${c.first_name?.[0] || ''}${c.last_name?.[0] || ''}`
              return (
                <div key={c.id} className="card hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-4 mb-4">
                    {c.photo_url ? (
                      <img src={c.photo_url} alt={`${c.first_name} ${c.last_name}`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center font-condensed font-black text-xl text-blue-700 flex-shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-condensed font-black text-lg text-gray-900 leading-tight">
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">{c.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5 font-medium">{c.school}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    {c.division && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-gray-300">●</span> {c.division}
                      </div>
                    )}
                    {c.location && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-gray-300">📍</span> {c.location}
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                        <span className="text-gray-300">✉</span>
                        <a href={`mailto:${c.email}`} className="text-green-hub hover:underline truncate">{c.email}</a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="tag bg-blue-50 text-blue-800 text-xs">✓ Verified</span>
                    {isPremium && c.email ? (
                      <a href={`mailto:${c.email}`} className="font-condensed font-bold text-xs text-green-hub hover:underline tracking-wider uppercase">
                        Contact →
                      </a>
                    ) : userType === 'athlete' && (
                      <span className="font-condensed font-bold text-xs text-gray-300 uppercase tracking-wider">🔒 Premium</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {userType === 'athlete' && !isPremium && (
          <div className="mt-8 bg-green-light border border-green-mid rounded-xl p-6 flex items-center justify-between gap-4">
            <div>
              <div className="font-condensed font-black text-xl text-green-darker mb-1">🔒 Upgrade to see coach contact info</div>
              <p className="text-sm text-green-dark">Get the Athlete Spotlight and unlock direct access to every verified coach on the platform.</p>
            </div>
            <Link href="/upgrade" className="btn-primary flex-shrink-0">Upgrade — $9.99 →</Link>
          </div>
        )}

        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-center justify-between gap-4">
          <div>
            <div className="font-condensed font-black text-xl text-blue-900 mb-1">Are you a college coach?</div>
            <p className="text-sm text-blue-700">Apply for a verified account to search and contact JUCO athletes directly.</p>
          </div>
          <Link href="/coach/signup" className="btn-primary flex-shrink-0">Apply now →</Link>
        </div>
      </div>
    </div>
  )
}
