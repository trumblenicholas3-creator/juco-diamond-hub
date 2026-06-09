import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { supabase } from '../../lib/supabase'

const DIVISIONS = ['NCAA Division I', 'NCAA Division II', 'NCAA Division III', 'NAIA', 'NJCAA', 'Other']
const TITLES = ['Head Coach', 'Assistant Coach', 'Recruiting Coordinator', 'Volunteer Coach', 'Graduate Assistant', 'Other']

export default function CoachSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [form, setForm] = useState({
    email: '', password: '', first_name: '', last_name: '',
    school: '', title: '', division: '', location: '', phone: '', reason: ''
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.password || !form.school || !form.title) {
      setError('Please fill in all required fields.'); return
    }
    setLoading(true); setError('')

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { user_type: 'coach' } }
    })
    if (authError) { setError(authError.message); setLoading(false); return }

    let photo_url = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const fileName = `coach-${data.user.id}.${ext}`
      const { error: uploadError } = await supabase.storage.from('coach-photos').upload(fileName, photoFile, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('coach-photos').getPublicUrl(fileName)
        photo_url = urlData.publicUrl
      }
    }

    const { error: profileError } = await supabase.from('coaches').insert({
      user_id: data.user.id,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      school: form.school,
      title: form.title,
      division: form.division,
      location: form.location,
      phone: form.phone,
      reason: form.reason,
      photo_url,
      verified: false,
    })
    if (profileError) { setError(profileError.message); setLoading(false); return }

    // Notify admin by email
    await fetch('/api/notify-coach-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: form.first_name, last_name: form.last_name,
        email: form.email, school: form.school, title: form.title,
        division: form.division, location: form.location,
        phone: form.phone, reason: form.reason,
      })
    })

    router.push('/coach/pending')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="font-condensed font-black text-3xl text-gray-900 mb-1">Coach application</div>
          <p className="text-sm text-gray-500">Reviewed and approved within 24–48 hours.</p>
        </div>

        <div className="card space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{error}</div>}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            📋 Your application will be reviewed before access is granted.
          </div>

          {/* Photo upload */}
          <div>
            <label className="label">Profile photo (optional)</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {photoPreview
                  ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  : <span className="text-2xl">👤</span>
                }
              </div>
              <label className="btn-secondary text-xs px-4 py-2 cursor-pointer">
                Choose photo
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">First name *</label><input className="input" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Sarah" /></div>
            <div><label className="label">Last name *</label><input className="input" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Mitchell" /></div>
          </div>
          <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="coach@university.edu" /></div>
          <div><label className="label">Password *</label><input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 8 characters" /></div>
          <div><label className="label">School / University *</label><input className="input" value={form.school} onChange={e => set('school', e.target.value)} placeholder="University of Texas" /></div>
          <div>
            <label className="label">Title / Role *</label>
            <select className="input" value={TITLES.includes(form.title) ? form.title : form.title ? 'Other' : ''} onChange={e => set('title', e.target.value)}>
              <option value="">Select title...</option>
              {TITLES.map(t => <option key={t}>{t}</option>)}
            </select>
            {form.title === 'Other' && (
              <input className="input mt-2" value={form.custom_title || ''} onChange={e => set('custom_title', e.target.value)} placeholder="Enter your title..." />
            )}
          </div>
          <div>
            <label className="label">Division</label>
            <select className="input" value={form.division} onChange={e => set('division', e.target.value)}>
              <option value="">Select division...</option>
              {DIVISIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div><label className="label">City, State</label><input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Austin, TX" /></div>
          <div><label className="label">Phone (optional)</label><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" /></div>
          <div>
            <label className="label">Tell us about your program (optional)</label>
            <textarea className="input h-20 resize-none" value={form.reason} onChange={e => set('reason', e.target.value)} placeholder="What are you looking for in recruits?" />
          </div>

          <button className="btn-primary w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit application →'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already approved? <Link href="/signin" className="text-green-hub underline">Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
