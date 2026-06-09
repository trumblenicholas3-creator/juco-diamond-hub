import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { supabase } from '../../lib/supabase'

const statusColors = {
  'Available': 'bg-green-light text-green-darker border border-green-mid',
  'Committed': 'bg-blue-50 text-blue-800 border border-blue-200',
}


const POSITIONS = ['Pitcher','Catcher','First Base','Second Base','Third Base','Shortstop','Left Field','Center Field','Right Field','Utility','Designated Player']
const CONFERENCES = ['NJCAA Division I','NJCAA Division II','NJCAA Division III','CCCAA (California)','NWAC (Northwest)','ACCAC (Arizona)','Other']
const GRAD_YEARS = ['2025','2026','2027','2028']
const STATUS_OPTIONS = ['Available','Committed']

const PITCHER_STATS = [
  { key: 'era', label: 'ERA' },
  { key: 'wins', label: 'Wins' },
  { key: 'losses', label: 'Losses' },
  { key: 'saves', label: 'Saves' },
  { key: 'innings_pitched', label: 'IP' },
  { key: 'strikeouts', label: 'K' },
  { key: 'walks_allowed', label: 'BB' },
  { key: 'whip', label: 'WHIP' },
]

const BATTER_STATS = [
  { key: 'avg', label: 'AVG' },
  { key: 'obp', label: 'OBP' },
  { key: 'slg', label: 'SLG' },
  { key: 'home_runs', label: 'HR' },
  { key: 'rbi', label: 'RBI' },
  { key: 'hits', label: 'H' },
  { key: 'stolen_bases', label: 'SB' },
  { key: 'games', label: 'G' },
  { key: 'at_bats', label: 'AB' },
  { key: 'doubles', label: '2B' },
  { key: 'triples', label: '3B' },
  { key: 'runs', label: 'R' },
  { key: 'walks', label: 'BB' },
  { key: 'strikeouts', label: 'K' },
  { key: 'fielding_pct', label: 'FLD%' },
]


function StatsEditInline({ athlete, userId, onSave }) {
  const [stats, setStats] = useState(athlete?.stats || {})
  const [season, setSeason] = useState(athlete?.stats_season || '2024')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const isPitcher = athlete?.position === 'Pitcher'
  const statFields = isPitcher ? PITCHER_STATS : BATTER_STATS
  const setStat = (k, v) => setStats(s => ({ ...s, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('athletes').update({ stats, stats_season: season }).eq('user_id', userId)
    onSave(a => ({ ...a, stats, stats_season: season }))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400">Season stats</div>
        <select className="font-condensed font-semibold text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
          value={season} onChange={e => setSeason(e.target.value)}>
          {['2024','2025','2026'].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {saved && <div className="bg-green-light border border-green-mid rounded-lg p-2 text-xs text-green-darker mb-3">✓ Stats saved!</div>}

      <div className="grid grid-cols-3 gap-2 mb-4">
        {statFields.map(({ key, label }) => (
          <div key={key}>
            <label className="font-condensed font-semibold text-xs tracking-wider uppercase text-gray-400 mb-1 block">{label}</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-serif focus:outline-none focus:border-green-hub transition-colors"
              type="number"
              step="0.001"
              min="0"
              value={stats[key] || ''}
              onChange={e => setStat(key, e.target.value)}
              placeholder="—"
            />
          </div>
        ))}
      </div>

      <button className="btn-primary w-full py-2.5 text-xs" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save stats →'}
      </button>
    </div>
  )
}

function ProfileEditInline({ athlete, userId, onSave }) {
  const [form, setForm] = useState({
    first_name: athlete?.first_name || '',
    last_name: athlete?.last_name || '',
    position: athlete?.position || '',
    second_position: athlete?.second_position || '',
    school: athlete?.school || '',
    city: athlete?.city || '',
    state: athlete?.state || '',
    conference: athlete?.conference || '',
    grad_year: athlete?.grad_year || '',
    gpa: athlete?.gpa || '',
    bats: athlete?.bats || 'Right',
    throws: athlete?.throws || 'Right',
    height: athlete?.height || '',
    weight: athlete?.weight || '',
    recruiting_status: athlete?.recruiting_status || 'Available',
    hudl_url: athlete?.hudl_url || '',
    youtube_url: athlete?.youtube_url || '',
    instagram: athlete?.instagram || '',
    twitter: athlete?.twitter || '',
    bio: athlete?.bio || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    const { data } = await supabase.from('athletes').update(form).eq('user_id', userId).select().single()
    if (data) onSave(a => ({ ...a, ...data }))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      {saved && <div className="bg-green-light border border-green-mid rounded-lg p-2 text-xs text-green-darker">✓ Saved!</div>}

      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">First name</label><input className="input" value={form.first_name} onChange={e => set('first_name', e.target.value)} /></div>
        <div><label className="label">Last name</label><input className="input" value={form.last_name} onChange={e => set('last_name', e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Position</label>
          <select className="input" value={form.position} onChange={e => set('position', e.target.value)}>
            <option value="">Select...</option>
            {POSITIONS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">2nd position</label>
          <select className="input" value={form.second_position} onChange={e => set('second_position', e.target.value)}>
            <option value="">None</option>
            {POSITIONS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div><label className="label">School</label><input className="input" value={form.school} onChange={e => set('school', e.target.value)} /></div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">City</label><input className="input" value={form.city} onChange={e => set('city', e.target.value)} /></div>
        <div><label className="label">State</label><input className="input" value={form.state} onChange={e => set('state', e.target.value)} placeholder="TX" /></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
        <label className="label">Conference</label>
        <select className="input" value={form.conference} onChange={e => set('conference', e.target.value)}>
          <option value="">Select...</option>
          {CONFERENCES.map(c => <option key={c}>{c}</option>)}
        </select>
        {form.conference === 'Other' && (
          <input className="input mt-2" value={form.custom_conference || ''} onChange={e => set('custom_conference', e.target.value)} placeholder="Enter your conference..." />
        )}
      </div>
        <div>
        <label className="label">Grad year</label>
        <select className="input" value={form.grad_year} onChange={e => set('grad_year', e.target.value)}>
          <option value="">Select...</option>
          {GRAD_YEARS.map(y => <option key={y}>{y}</option>)}
        </select>
      </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">GPA</label><input className="input" type="number" step="0.01" min="0" max="4.0" value={form.gpa} onChange={e => set('gpa', e.target.value)} /></div>
        <div>
          <label className="label">Recruiting status</label>
          <select className="input" value={form.recruiting_status} onChange={e => set('recruiting_status', e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Bats</label>
          <select className="input" value={form.bats} onChange={e => set('bats', e.target.value)}>
            <option>Right</option><option>Left</option><option>Switch</option>
          </select>
        </div>
        <div>
          <label className="label">Throws</label>
          <select className="input" value={form.throws} onChange={e => set('throws', e.target.value)}>
            <option>Right</option><option>Left</option>
          </select>
        </div>
        <div><label className="label">Height</label><input className="input" value={form.height} onChange={e => set('height', e.target.value)} placeholder="5'6&quot;" /></div>
      </div>

      <div><label className="label">Weight (lbs)</label><input className="input" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="135" /></div>

      <div className="border-t border-gray-100 pt-4">
        <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-3">Film & social</div>
        <div className="space-y-2">
          <div><label className="label">Hudl URL</label><input className="input" value={form.hudl_url} onChange={e => set('hudl_url', e.target.value)} placeholder="https://www.hudl.com/profile/..." /></div>
          <div><label className="label">YouTube URL</label><input className="input" value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)} placeholder="https://youtube.com/..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Instagram</label><input className="input" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@username" /></div>
            <div><label className="label">Twitter / X</label><input className="input" value={form.twitter} onChange={e => set('twitter', e.target.value)} placeholder="@username" /></div>
          </div>
        </div>
      </div>

      <div><label className="label">Bio</label><textarea className="input h-20 resize-none" value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell coaches about yourself..." /></div>

      <button className="btn-primary w-full py-3" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save changes →'}
      </button>
    </div>
  )
}

export default function AthleteDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [athlete, setAthlete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [savedCount, setSavedCount] = useState(0)
  const [photoUploading, setPhotoUploading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) { router.push('/athlete/login'); return }
      setUser(data.user)
      const { data: a } = await supabase.from('athletes').select('*').eq('user_id', data.user.id).single()
      setAthlete(a)
      if (a) {
        const { count, error } = await supabase
          .from('saved_prospects')
          .select('*', { count: 'exact', head: true })
          .eq('athlete_id', a.id)
        setSavedCount(count || 0)
      }
      setLoading(false)
    })
  }, [])

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setVideoFile(file)
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('highlight-videos')
        .upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('highlight-videos').getPublicUrl(fileName)
      await supabase.from('athletes').update({ video_url: urlData.publicUrl }).eq('user_id', user.id)
      setAthlete(a => ({ ...a, video_url: urlData.publicUrl }))
      setUploadSuccess(true)
    } catch (err) {
      alert('Upload failed: ' + err.message)
    }
    setUploading(false)
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `athlete-${user.id}.${ext}`
      const { error: uploadError } = await supabase.storage.from('athlete-photos').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('athlete-photos').getPublicUrl(fileName)
      await supabase.from('athletes').update({ photo_url: urlData.publicUrl }).eq('user_id', user.id)
      setAthlete(a => ({ ...a, photo_url: urlData.publicUrl }))
    } catch (err) {
      alert('Upload failed: ' + err.message)
    }
    setPhotoUploading(false)
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return
    if (!window.confirm('Final confirmation: all your profile data and videos will be permanently deleted.')) return
    try {
      await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      })
      await supabase.auth.signOut()
      router.push('/')
    } catch (err) {
      alert('Error deleting account: ' + err.message)
    }
  }

  const handleStatusChange = async (status) => {
    await supabase.from('athletes').update({ recruiting_status: status }).eq('user_id', user.id)
    setAthlete(a => ({ ...a, recruiting_status: status }))
  }

  if (loading) return (
    <div className="min-h-screen bg-white"><Navbar />
      <div className="flex items-center justify-center h-64 text-gray-400 font-condensed uppercase tracking-widest text-sm">Loading...</div>
    </div>
  )

  const initials = `${athlete?.first_name?.[0] || ''}${athlete?.last_name?.[0] || ''}`
  const profileComplete = athlete && athlete.position && athlete.school && athlete.gpa && athlete.grad_year

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} userType="athlete" />

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-start gap-5 mb-8">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-green-light border-2 border-green-mid flex items-center justify-center font-condensed font-black text-2xl text-green-darker overflow-hidden">
              {athlete?.photo_url
                ? <img src={athlete.photo_url} alt="Profile" className="w-full h-full object-cover" />
                : initials
              }
            </div>
            <label className="absolute bottom-0 right-0 w-6 h-6 bg-green-hub rounded-full flex items-center justify-center cursor-pointer hover:bg-green-dark transition-colors" title="Upload photo">
              <span className="text-white text-xs">+</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
            {photoUploading && <div className="absolute inset-0 bg-white bg-opacity-70 rounded-full flex items-center justify-center text-xs text-green-hub">...</div>}
          </div>
          <div className="flex-1">
            <h1 className="font-condensed font-black text-3xl text-gray-900 leading-none mb-1">
              {athlete ? `${athlete.first_name} ${athlete.last_name}` : 'Your Dashboard'}
            </h1>
            <p className="text-sm text-gray-500">{athlete?.school} {athlete?.position ? `· ${athlete.position}` : ''}</p>
          </div>
          <div className="flex gap-2">
            {athlete && (
              <Link href={`/athlete/${athlete.id}`} className="btn-secondary text-xs px-4 py-2">
                View public profile →
              </Link>
            )}
            <Link href="/athlete/profile-edit" className="btn-primary text-xs px-4 py-2">
              Edit profile
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="font-condensed font-black text-3xl text-green-hub">{athlete?.is_featured ? savedCount : '?'}</div>
            <div className="font-condensed font-semibold text-xs tracking-widest uppercase text-gray-400 mt-1">Coaches saved</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="font-condensed font-black text-3xl text-gray-900">{athlete?.recruiting_status === 'Available' ? '✦' : athlete?.recruiting_status === 'Committed' ? '✓' : '~'}</div>
            <div className="font-condensed font-semibold text-xs tracking-widest uppercase text-gray-400 mt-1">{athlete?.recruiting_status || 'No status'}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="font-condensed font-black text-3xl text-gray-900">{(athlete?.hudl_url || athlete?.youtube_url || athlete?.video_url) ? '✓' : '—'}</div>
            <div className="font-condensed font-semibold text-xs tracking-widest uppercase text-gray-400 mt-1">Film uploaded</div>
          </div>
        </div>

        {/* Profile complete warning */}
        {!profileComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <div className="font-condensed font-bold text-sm text-amber-800 mb-1">Complete your profile to get noticed</div>
              <p className="text-xs text-amber-700">Add your position, school, GPA, and graduation year so coaches can find you.</p>
              <Link href="/athlete/profile-edit" className="text-xs font-semibold text-amber-800 underline mt-1 inline-block">Complete profile →</Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Main column */}
          <div className="md:col-span-2 space-y-5">

            {/* Recruiting status */}
            <div className="card">
              <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-4">My recruiting status</div>
              <div className="flex gap-2 flex-wrap">
                {['Available',  'Committed'].map(s => (
                  <button key={s} onClick={() => handleStatusChange(s)}
                    className={`font-condensed font-bold text-xs tracking-wider uppercase px-4 py-2 rounded-full border transition-colors
                      ${athlete?.recruiting_status === s ? 'bg-green-hub text-white border-green-hub' : 'bg-white text-gray-600 border-gray-200 hover:border-green-hub'}`}>
                    {s}
                  </button>
                ))}
              </div>
              {athlete?.recruiting_status && (
                <p className="text-xs text-gray-400 mt-3">
                  Currently showing as <strong>{athlete.recruiting_status}</strong> to coaches.
                </p>
              )}
            </div>

            {/* Video upload */}
            <div className="card">
              <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-4">Highlight video</div>

              {/* Existing video */}
              {athlete?.video_url && (
                <div className="mb-4">
                  <video
                    src={athlete.video_url}
                    controls
                    className="w-full rounded-lg border border-gray-200 bg-black"
                    style={{ maxHeight: '280px' }}
                  />
                  <p className="text-xs text-gray-400 mt-2">Your uploaded highlight video</p>
                </div>
              )}

              {/* External links */}
              <div className="space-y-2 mb-4">
                {athlete?.hudl_url && (
                  <a href={athlete.hudl_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-hub transition-colors">
                    <div className="w-8 h-8 rounded-full bg-green-hub flex items-center justify-center text-white text-sm">▶</div>
                    <div>
                      <div className="font-condensed font-bold text-sm text-gray-900">Hudl highlights</div>
                      <div className="text-xs text-gray-400 truncate max-w-xs">{athlete.hudl_url}</div>
                    </div>
                  </a>
                )}
                {athlete?.youtube_url && (
                  <a href={athlete.youtube_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-hub transition-colors">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm">▶</div>
                    <div>
                      <div className="font-condensed font-bold text-sm text-gray-900">YouTube highlights</div>
                      <div className="text-xs text-gray-400 truncate max-w-xs">{athlete.youtube_url}</div>
                    </div>
                  </a>
                )}
              </div>

              {/* Upload zone */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-green-hub transition-colors">
                {uploading ? (
                  <div>
                    <div className="text-2xl mb-2">⏳</div>
                    <div className="font-condensed font-bold text-sm text-gray-600">Uploading your video...</div>
                    <p className="text-xs text-gray-400 mt-1">This may take a minute depending on file size</p>
                  </div>
                ) : uploadSuccess ? (
                  <div>
                    <div className="text-2xl mb-2">✅</div>
                    <div className="font-condensed font-bold text-sm text-green-hub">Video uploaded successfully!</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl mb-2">🎥</div>
                    <div className="font-condensed font-bold text-sm text-gray-700 mb-1">Upload a highlight video</div>
                    <p className="text-xs text-gray-400 mb-4">MP4, MOV up to 500MB. Or add a Hudl/YouTube link in Edit Profile.</p>
                    <label className="btn-primary cursor-pointer text-xs px-5 py-2.5 inline-block">
                      Choose video file
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Edit profile inline */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400">Edit profile</div>
                {athlete && (
                  <Link href={`/athlete/${athlete.id}`} className="font-condensed font-bold text-xs tracking-wider uppercase text-green-hub hover:underline">View public →</Link>
                )}
              </div>
              <ProfileEditInline athlete={athlete} userId={user?.id} onSave={setAthlete} />
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Quick stats */}
            <div className="card">
              <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-4">Profile info</div>
              {[
                ['Position', athlete?.position],
                ['Grad year', athlete?.grad_year],
                ['GPA', athlete?.gpa],
                ['School', athlete?.school],
                ['State', athlete?.state],
                ['Bats / Throws', athlete?.bats && athlete?.throws ? `${athlete.bats} / ${athlete.throws}` : null],
                ['Height', athlete?.height],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="font-condensed font-semibold text-xs tracking-wider uppercase text-gray-400">{k}</span>
                  <span className="text-sm text-gray-900 font-medium">{v}</span>
                </div>
              ))}
            </div>

            {/* Recruiting status badge */}
            <div className="card text-center">
              <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-3">Visible to coaches as</div>
              <span className={`tag text-sm px-4 py-2 rounded-full ${statusColors[athlete?.recruiting_status] || 'bg-gray-100 text-gray-600'}`}>
                ● {athlete?.recruiting_status || 'No status set'}
              </span>
            </div>

            {/* Saved by coaches — premium only */}
            <div className="card text-center">
              <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-2">Saved by coaches</div>
              {athlete?.is_featured ? (
                <>
                  <div className="font-condensed font-black text-5xl text-green-hub mb-1">{savedCount}</div>
                  <div className="text-xs text-gray-400 leading-relaxed">
                    {savedCount === 0
                      ? 'No coaches have saved your profile yet. Complete your profile to get noticed!'
                      : savedCount === 1
                      ? 'coach has saved your profile'
                      : 'coaches have saved your profile'}
                  </div>
                  {savedCount > 0 && (
                    <div className="mt-3 text-xs text-green-hub font-condensed font-semibold tracking-wider uppercase">
                      ● Coaches are interested
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="font-condensed font-black text-5xl text-gray-200 mb-1">?</div>
                  <div className="text-xs text-gray-400 leading-relaxed mb-3">Upgrade to see how many coaches have saved your profile.</div>
                  <Link href="/upgrade" className="font-condensed font-bold text-xs tracking-wider uppercase px-4 py-2 bg-green-hub text-white rounded-lg inline-block">
                    Unlock — $9.99 →
                  </Link>
                </>
              )}
            </div>

            {/* Share profile */}
            {athlete && (
              <div className="card">
                <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-3">Share your profile</div>
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 break-all mb-3 font-mono">
                  jucodiamondub.vercel.app/athlete/{athlete.id}
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(`https://juco-diamond-hub.vercel.app/athlete/${athlete.id}`); alert('Link copied!') }}
                  className="btn-secondary text-xs px-4 py-2 w-full">
                  Copy profile link
                </button>
              </div>
            )}

          </div>
        {/* Danger zone */}
          <div className="card border-red-100">
            <div className="font-condensed font-bold text-xs tracking-widest uppercase text-red-400 mb-3">Danger zone</div>
            <button onClick={handleDeleteAccount}
              className="w-full font-condensed font-bold text-xs tracking-wider uppercase px-4 py-2 border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors">
              Delete my account
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
