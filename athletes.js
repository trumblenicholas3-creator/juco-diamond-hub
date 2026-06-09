import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { supabase } from '../../lib/supabase'

const POSITIONS = ['Pitcher','Catcher','First Base','Second Base','Third Base','Shortstop','Left Field','Center Field','Right Field','Utility','Designated Player']
const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
const GRAD_YEARS = ['2025','2026','2027','2028']
const CONFERENCES = [
  'NJCAA Division I',
  'NJCAA Division II', 
  'NJCAA Division III',
  'CCCAA (California)',
  'NWAC (Northwest)',
  'ACCAC (Arizona)',
  'Other',
]
const STATUS_OPTIONS = ['Available','Committed']

export default function AthleteSignup() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '', password: '',
    first_name: '', last_name: '',
    position: '', second_position: '',
    bats: 'Right', throws: 'Right',
    height_ft: '', height_in: '', weight: '',
    school: '', city: '', state: '',
    conference: '', grad_year: '2025',
    gpa: '', recruiting_status: 'Available',
    hudl_url: '', youtube_url: '', instagram: '', twitter: '',
    bio: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { user_type: 'athlete' } }
      })
      if (authError) throw authError

      const { error: profileError } = await supabase.from('athletes').insert({
        user_id: authData.user.id,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        position: form.position,
        second_position: form.second_position,
        bats: form.bats,
        throws: form.throws,
        height: `${form.height_ft}'${form.height_in}"`,
        weight: form.weight,
        school: form.school,
        city: form.city,
        state: form.state,
        conference: form.conference,
        grad_year: form.grad_year,
        gpa: parseFloat(form.gpa) || null,
        recruiting_status: form.recruiting_status,
        hudl_url: form.hudl_url,
        youtube_url: form.youtube_url,
        instagram: form.instagram,
        twitter: form.twitter,
        bio: form.bio,
      })
      if (profileError) throw profileError
      router.push('/athlete/profile-edit?created=1')
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <div className="font-condensed font-black text-3xl text-gray-900 mb-1">Create your profile</div>
          <p className="text-sm text-gray-500">Free forever. Get in front of coaches today.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1,2,3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-condensed font-bold text-xs
                ${step >= s ? 'bg-green-hub text-white' : 'bg-gray-200 text-gray-400'}`}>{s}</div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-green-hub' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>

        <div className="card">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 mb-5">{error}</div>}

          {step === 1 && (
            <div className="space-y-4">
              <div className="font-condensed font-bold text-lg text-gray-900 mb-4">Account & personal info</div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">First name</label><input className="input" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Jordan" /></div>
                <div><label className="label">Last name</label><input className="input" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Reyes" /></div>
              </div>
              <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" /></div>
              <div><label className="label">Password</label><input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 8 characters" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Primary position</label>
                  <select className="input" value={form.position} onChange={e => set('position', e.target.value)}>
                    <option value="">Select...</option>
                    {POSITIONS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Secondary position</label>
                  <select className="input" value={form.second_position} onChange={e => set('second_position', e.target.value)}>
                    <option value="">None</option>
                    {POSITIONS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Height (ft)</label><input className="input" type="number" value={form.height_ft} onChange={e => set('height_ft', e.target.value)} placeholder="5" /></div>
                <div><label className="label">Height (in)</label><input className="input" type="number" value={form.height_in} onChange={e => set('height_in', e.target.value)} placeholder="6" /></div>
                <div><label className="label">Weight (lbs)</label><input className="input" type="number" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="135" /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="font-condensed font-bold text-lg text-gray-900 mb-4">School & academics</div>
              <div><label className="label">School / College</label><input className="input" value={form.school} onChange={e => set('school', e.target.value)} placeholder="St. Philip's College" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">City</label><input className="input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="San Antonio" /></div>
                <div>
                  <label className="label">State</label>
                  <select className="input" value={form.state} onChange={e => set('state', e.target.value)}>
                    <option value="">Select...</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Conference</label>
                <select className="input" value={CONFERENCES.includes(form.conference) ? form.conference : form.conference ? 'Other' : ''} onChange={e => set('conference', e.target.value)}>
                  <option value="">Select conference...</option>
                  {CONFERENCES.map(c => <option key={c}>{c}</option>)}
                </select>
                {form.conference === 'Other' && (
                  <input className="input mt-2" value={form.custom_conference || ''} onChange={e => set('custom_conference', e.target.value)} placeholder="Enter your conference..." />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Graduation year</label>
                  <select className="input" value={form.grad_year} onChange={e => set('grad_year', e.target.value)}>
                    {GRAD_YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div><label className="label">GPA</label><input className="input" type="number" step="0.01" min="0" max="4.0" value={form.gpa} onChange={e => set('gpa', e.target.value)} placeholder="3.6" /></div>
              </div>
              <div>
                <label className="label">Recruiting status</label>
                <select className="input" value={form.recruiting_status} onChange={e => set('recruiting_status', e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Bio (optional)</label>
                <textarea className="input h-24 resize-none" value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell coaches a bit about yourself, your playing style, and your goals..." />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="font-condensed font-bold text-lg text-gray-900 mb-4">Film & social links</div>
              <p className="text-sm text-gray-500 mb-4">All fields optional — add what you have.</p>
              <div><label className="label">Hudl URL</label><input className="input" value={form.hudl_url} onChange={e => set('hudl_url', e.target.value)} placeholder="https://www.hudl.com/profile/..." /></div>
              <div><label className="label">YouTube URL</label><input className="input" value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)} placeholder="https://youtube.com/..." /></div>
              <div><label className="label">Instagram handle</label><input className="input" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@username" /></div>
              <div><label className="label">Twitter / X handle</label><input className="input" value={form.twitter} onChange={e => set('twitter', e.target.value)} placeholder="@username" /></div>
              <div className="bg-green-light rounded-lg p-4 text-sm text-green-darker leading-relaxed">
                🎉 Almost done! After creating your profile you can add season stats, achievements, and a profile photo.
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1
              ? <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
              : <Link href="/" className="btn-secondary">Cancel</Link>
            }
            {step < 3
              ? <button className="btn-primary" onClick={() => setStep(s => s + 1)}>Continue →</button>
              : <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Creating...' : 'Create profile →'}</button>
            }
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already have an account? <Link href="/athlete/login" className="text-green-hub underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
