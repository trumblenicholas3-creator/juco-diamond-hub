import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'

export default function Account() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { router.push('/signin'); return }
      setUser(session.user)

      const { data: coach } = await supabase.from('coaches').select('*').eq('user_id', session.user.id).single()
      if (coach) {
        setUserType('coach')
        setProfile(coach)
      } else {
        const { data: athlete } = await supabase.from('athletes').select('*').eq('user_id', session.user.id).single()
        setUserType('athlete')
        setProfile(athlete)
      }
      setLoading(false)
    })
  }, [])

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return
    setDeleting(true)
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.removeItem('juco_user_type')
      await supabase.auth.signOut()
      router.push('/?deleted=1')
    } catch (err) {
      alert('Error deleting account: ' + err.message)
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-white"><Navbar />
      <div className="flex items-center justify-center h-64 text-gray-400 font-condensed uppercase tracking-widest text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="font-condensed font-black text-3xl text-gray-900 mb-6">Account settings</h1>

        {/* Account info */}
        <div className="card mb-4">
          <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-4">Account info</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-condensed font-semibold text-xs tracking-wider uppercase text-gray-400">Name</span>
              <span className="text-sm text-gray-900">{profile?.first_name} {profile?.last_name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-condensed font-semibold text-xs tracking-wider uppercase text-gray-400">Email</span>
              <span className="text-sm text-gray-900">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-condensed font-semibold text-xs tracking-wider uppercase text-gray-400">Account type</span>
              <span className={`tag text-xs ${userType === 'coach' ? 'bg-blue-50 text-blue-800' : 'bg-green-light text-green-darker'}`}>
                {userType === 'coach' ? '📋 Coach' : '🏃 Athlete'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="card mb-4">
          <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-4">Quick links</div>
          <div className="space-y-2">
            {userType === 'athlete' && (
              <>
                <Link href="/athlete/dashboard" className="flex items-center justify-between py-2 border-b border-gray-100 text-sm text-gray-600 hover:text-green-hub transition-colors">
                  <span>My dashboard</span><span>→</span>
                </Link>
                <Link href="/athlete/stats" className="flex items-center justify-between py-2 border-b border-gray-100 text-sm text-gray-600 hover:text-green-hub transition-colors">
                  <span>My stats</span><span>→</span>
                </Link>
                <Link href="/athlete/profile-edit" className="flex items-center justify-between py-2 text-sm text-gray-600 hover:text-green-hub transition-colors">
                  <span>Edit profile</span><span>→</span>
                </Link>
              </>
            )}
            {userType === 'coach' && (
              <>
                <Link href="/coach/dashboard" className="flex items-center justify-between py-2 border-b border-gray-100 text-sm text-gray-600 hover:text-green-hub transition-colors">
                  <span>Search athletes</span><span>→</span>
                </Link>
                <Link href="/coach/saved" className="flex items-center justify-between py-2 text-sm text-gray-600 hover:text-green-hub transition-colors">
                  <span>Saved prospects</span><span>→</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div className="card border-red-100">
          <div className="font-condensed font-bold text-xs tracking-widest uppercase text-red-400 mb-3">Danger zone</div>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>

          {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)}
              className="font-condensed font-bold text-xs tracking-wider uppercase px-5 py-2.5 border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors">
              Delete my account
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                ⚠️ This will permanently delete your account, profile, and all data.
              </div>
              <div>
                <label className="label text-red-400">Type DELETE to confirm</label>
                <input
                  className="input border-red-200 focus:border-red-400"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== 'DELETE' || deleting}
                  className={`font-condensed font-bold text-xs tracking-wider uppercase px-5 py-2.5 rounded-lg transition-colors
                    ${confirmText === 'DELETE' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                  {deleting ? 'Deleting...' : 'Permanently delete'}
                </button>
                <button onClick={() => { setShowConfirm(false); setConfirmText('') }}
                  className="btn-secondary text-xs px-5 py-2.5">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
