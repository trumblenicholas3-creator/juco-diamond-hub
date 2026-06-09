import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { supabase } from '../../lib/supabase'

const POSITIONS = ['Pitcher','Catcher','First Base','Second Base','Third Base','Shortstop','Left Field','Center Field','Right Field','Utility','Designated Player']
const STATUS_OPTIONS = ['Available','Committed']

export default function ProfileEdit() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [athlete, setAthlete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) { router.push('/athlete/login'); return }
      setUser(data.user)
      const { data: a } = await supabase.from('athletes').select('*').eq('user_id', data.user.id).single()
      if (a) { setAthlete(a); setForm(a) }
      setLoading(false)
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('athletes').update(form).eq('user_id', user.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen bg-white"><Navbar /><div className="flex items-center justify-center h-64 text-gray-400 font-condensed uppercase tracking-widest text-sm">Loading...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} userType="athlete" />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-condensed font-black text-3xl text-gray-900">Edit your profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">Keep your info up to date for coaches</p>
          </div>
          {athlete && (
            <Link href={`/athlete/${athlete.id}`} className="btn-secondary text-xs px-4 py-2">
              View public profile →
            </Link>
          )}
        </div>

        {router.query.created && (
          <div className="bg-green-light border border-green-mid rounded-xl p-4 mb-5 text-sm text-green-darker">
            🎉 Profile created! Add your stats and film below to stand out to coaches.
          </div>
        )}

        {saved && (
          <div className="bg-green-light border border-green-mid rounded-xl p-4 mb-5 text-sm text-green-darker">
            ✓ Profile saved successfully.
          </div>
        )}

        <div className="space-y-5">
          <div className="card">
            <div className="font-condensed font-bold text-base mb-4">Recruiting status</div>
            <div className="flex gap-3 flex-wrap">
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => set('recruiting_status', s)}
                  className={`font-condensed font-bold text-xs tracking-wider uppercase px-4 py-2 rounded-full border transition-colors
                    ${form.recruiting_status === s ? 'bg-green-hub text-white border-green-hub' : 'bg-white text-gray-600 border-gray-200 hover:border-green-hub'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="card space-y-4">
            <div className="font-condensed font-bold text-base">Personal & athletic info</div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Primary position</label>
                <select className="input" value={form.position || ''} onChange={e => set('position', e.target.value)}>
                  <option value="">Select...</option>
                  {POSITIONS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div><label className="label">GPA</label><input className="input" type="number" step="0.01" min="0" max="4.0" value={form.gpa || ''} onChange={e => set('gpa', e.target.value)} /></div>
            </div>
            <div><label className="label">Bio</label><textarea className="input h-24 resize-none" value={form.bio || ''} onChange={e => set('bio', e.target.value)} placeholder="Tell coaches about your playing style and goals..." /></div>
          </div>

          <div className="card space-y-4">
            <div className="font-condensed font-bold text-base">Film & social links</div>
            <div><label className="label">Hudl URL</label><input className="input" value={form.hudl_url || ''} onChange={e => set('hudl_url', e.target.value)} placeholder="https://www.hudl.com/profile/..." /></div>
            <div><label className="label">YouTube URL</label><input className="input" value={form.youtube_url || ''} onChange={e => set('youtube_url', e.target.value)} placeholder="https://youtube.com/..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Instagram</label><input className="input" value={form.instagram || ''} onChange={e => set('instagram', e.target.value)} placeholder="@username" /></div>
              <div><label className="label">Twitter / X</label><input className="input" value={form.twitter || ''} onChange={e => set('twitter', e.target.value)} placeholder="@username" /></div>
            </div>
          </div>

          <button className="btn-primary w-full py-3" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save changes →'}
          </button>
        </div>
      </div>
    </div>
  )
}
