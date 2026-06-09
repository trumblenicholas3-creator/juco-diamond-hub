import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { supabase } from '../../lib/supabase'

const statusColors = {
  'Available': 'bg-green-light text-green-darker border border-green-mid',
  'Committed': 'bg-blue-50 text-blue-800 border border-blue-200',
  'Exploring Opportunities': 'bg-amber-50 text-amber-800 border border-amber-200',
}

export default function AthleteProfile() {
  const router = useRouter()
  const { id } = router.query
  const [athlete, setAthlete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState(null)
  const [isCoach, setIsCoach] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return
      setUser(session.user)
      const { data: coach } = await supabase.from('coaches').select('id, verified').eq('user_id', session.user.id).single()
      setIsCoach(coach?.verified || false)
    })
  }, [])

  useEffect(() => {
    if (!id) return
    supabase.from('athletes').select('*').eq('id', id).single()
      .then(({ data }) => { setAthlete(data); setLoading(false) })
  }, [id])

  const handleSave = async () => {
    if (!user) { router.push('/signin'); return }
    if (!isCoach) { alert('Only verified coaches can save prospects.'); return }
    await supabase.from('saved_prospects').upsert({ coach_id: user.id, athlete_id: id })
    setSaved(true)
  }

  if (loading) return (
    <div className="min-h-screen bg-white"><Navbar />
      <div className="flex items-center justify-center h-64 text-gray-400 font-condensed font-semibold text-sm tracking-widest uppercase">Loading profile...</div>
    </div>
  )

  if (!athlete) return (
    <div className="min-h-screen bg-white"><Navbar />
      <div className="flex items-center justify-center h-64 text-gray-400 font-condensed font-semibold text-sm tracking-widest uppercase">Profile not found</div>
    </div>
  )

  const initials = `${athlete.first_name?.[0] || ''}${athlete.last_name?.[0] || ''}`
  const fullName = `${athlete.first_name} ${athlete.last_name}`

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link href="/athlete/search" className="font-condensed font-semibold text-xs tracking-widest uppercase text-gray-400 hover:text-gray-600 flex items-center gap-1.5 mb-6">
            ← Back to search
          </Link>
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-green-light border-2 border-green-mid flex items-center justify-center font-condensed font-black text-2xl text-green-darker flex-shrink-0 overflow-hidden">
              {athlete.photo_url
                ? <img src={athlete.photo_url} alt={fullName} className="w-full h-full object-cover" />
                : initials
              }
            </div>
            <div className="flex-1">
              <h1 className="font-condensed font-black text-4xl text-gray-900 leading-none mb-2">{fullName}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 flex-wrap">
                {athlete.city && athlete.state && <span>📍 {athlete.city}, {athlete.state}</span>}
                {athlete.school && <span>🎓 {athlete.school}</span>}
                {athlete.grad_year && <span>📅 Grad {athlete.grad_year}</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {athlete.position && <span className="tag bg-green-light text-green-darker">{athlete.position}</span>}
                {athlete.second_position && <span className="tag bg-green-light text-green-darker">{athlete.second_position}</span>}
                {athlete.conference && <span className="tag bg-blue-50 text-blue-800">{athlete.conference}</span>}
                {athlete.recruiting_status && (
                  <span className={`tag ${statusColors[athlete.recruiting_status] || 'bg-gray-100 text-gray-600'}`}>
                    ✦ {athlete.recruiting_status}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end flex-shrink-0">
              {isCoach && (
                <a href={`mailto:${athlete.email}`} className="btn-primary text-xs px-5 py-2.5">Contact athlete →</a>
              )}
              {isCoach && (
                <button onClick={handleSave} className="btn-secondary text-xs px-5 py-2.5 flex items-center gap-1.5">
                  {saved ? '✓ Saved' : '🔖 Save prospect'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main */}
        <div className="md:col-span-2 space-y-5">

          {/* Stats */}
          {athlete.stats && (
            <div className="card">
              <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-4">Season statistics</div>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(athlete.stats).map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="font-condensed font-black text-2xl text-gray-900">{v}</div>
                    <div className="font-condensed font-semibold text-xs tracking-wider uppercase text-gray-400 mt-0.5">{k}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {(athlete.hudl_url || athlete.youtube_url) && (
            <div className="card">
              <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-4">Highlight film</div>
              <div className="space-y-3">
                {athlete.hudl_url && (
                  <a href={athlete.hudl_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-hub transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-green-hub flex items-center justify-center text-white text-lg">▶</div>
                    <div>
                      <div className="font-condensed font-bold text-sm text-gray-900">View on Hudl</div>
                      <div className="text-xs text-gray-400">{athlete.hudl_url}</div>
                    </div>
                    <div className="ml-auto tag bg-green-light text-green-darker">Hudl</div>
                  </a>
                )}
                {athlete.youtube_url && (
                  <a href={athlete.youtube_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-hub transition-colors">
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white text-lg">▶</div>
                    <div>
                      <div className="font-condensed font-bold text-sm text-gray-900">View on YouTube</div>
                      <div className="text-xs text-gray-400">{athlete.youtube_url}</div>
                    </div>
                    <div className="ml-auto tag bg-red-50 text-red-700">YouTube</div>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Achievements */}
          {athlete.achievements && athlete.achievements.length > 0 && (
            <div className="card">
              <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-4">Achievements</div>
              <ul className="space-y-3">
                {athlete.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                    <span className="text-green-hub text-base mt-0.5">🏆</span>{a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bio */}
          {athlete.bio && (
            <div className="card">
              <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-3">About</div>
              <p className="text-sm text-gray-600 leading-relaxed">{athlete.bio}</p>
            </div>
          )}

          {/* Coach lock notice */}
          {!user && (
            <div className="bg-green-light rounded-xl p-4 flex items-start gap-3">
              <span className="text-lg mt-0.5">🔒</span>
              <div className="text-sm text-green-darker leading-relaxed">
                Full contact info, transcripts, and references are visible to verified coaches only.{' '}
                <Link href="/coach/login" className="font-semibold underline">Verify your coach account →</Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-4">Recruiting status</div>
            <span className={`tag text-sm px-3 py-1.5 rounded-full ${statusColors[athlete.recruiting_status] || 'bg-gray-100 text-gray-600'}`}>
              ● {athlete.recruiting_status}
            </span>
          </div>

          <div className="card">
            <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-3">Player info</div>
            {[
              ['Position', athlete.position],
              ['Bats / Throws', athlete.bats && athlete.throws ? `${athlete.bats} / ${athlete.throws}` : null],
              ['Height', athlete.height],
              ['Weight', athlete.weight ? `${athlete.weight} lbs` : null],
              ['Grad year', athlete.grad_year],
              ['GPA', athlete.gpa],
              ['Conference', athlete.conference],
              ['State', athlete.state],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="font-condensed font-semibold text-xs tracking-wider uppercase text-gray-400">{k}</span>
                <span className="text-sm text-gray-900 font-medium">{v}</span>
              </div>
            ))}
          </div>

          {(athlete.instagram || athlete.twitter) && (
            <div className="card">
              <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-3">Social</div>
              {athlete.instagram && (
                <a href={`https://instagram.com/${athlete.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 border-b border-gray-100 text-sm text-gray-600 hover:text-green-hub transition-colors">
                  📸 {athlete.instagram}
                </a>
              )}
              {athlete.twitter && (
                <a href={`https://twitter.com/${athlete.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 text-sm text-gray-600 hover:text-green-hub transition-colors">
                  🐦 {athlete.twitter}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
