import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'

export default function SignIn() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true); setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      const res = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const { exists } = await res.json()
      if (!exists) {
        router.push('/athlete/signup')
        return
      }
      setError('wrong_password')
      setLoading(false); return
    }

    const userId = data.user.id

    // Check if coach first
    const { data: coach } = await supabase.from('coaches').select('id, verified, denied').eq('user_id', userId).single()
    if (coach) {
      if (coach.denied) {
        await supabase.auth.signOut()
        setError('Your coach application was not approved. Please contact us for more information.')
        setLoading(false); return
      }
      if (!coach.verified) {
        router.push('/coach/pending'); return
      }
      router.push('/coach/dashboard'); return
    }

    // Check if athlete
    const { data: athlete } = await supabase.from('athletes').select('id').eq('user_id', userId).single()
    if (athlete) {
      router.push('/athlete/dashboard'); return
    }

    // No profile found — send home
    router.push('/')
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSignIn()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="font-condensed font-black text-3xl text-gray-900 mb-1">Sign in</div>
          <p className="text-sm text-gray-500">Welcome back to JUCO Diamond Hub</p>
        </div>

        <div className="card space-y-4">
          {error === 'wrong_password' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              Incorrect password. Please try again.
            </div>
          )}
          {error === 'no_account' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <div className="font-condensed font-bold text-sm mb-2">No account found for that email.</div>
              <p className="text-xs mb-3 text-amber-700">Are you new here? Choose how you'd like to join:</p>
              <div className="flex gap-2">
                <a href="/athlete/signup" className="flex-1 text-center font-condensed font-bold text-xs tracking-wider uppercase px-3 py-2 bg-green-hub text-white rounded-lg">
                  Join as athlete
                </a>
                <a href="/coach/signup" className="flex-1 text-center font-condensed font-bold text-xs tracking-wider uppercase px-3 py-2 bg-blue-600 text-white rounded-lg">
                  Apply as coach
                </a>
              </div>
            </div>
          )}
          {error && error !== 'wrong_password' && error !== 'no_account' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder="you@email.com" autoFocus />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder="••••••••" />
          </div>
          <button className="btn-primary w-full" onClick={handleSignIn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/athlete/signup" className="card text-center hover:border-green-hub transition-colors cursor-pointer block py-5">
            <div className="text-2xl mb-2">🏃</div>
            <div className="font-condensed font-bold text-sm text-gray-900">New athlete?</div>
            <div className="text-xs text-gray-400 mt-0.5">Create free profile</div>
          </Link>
          <Link href="/coach/signup" className="card text-center hover:border-blue-300 transition-colors cursor-pointer block py-5">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-condensed font-bold text-sm text-gray-900">College coach?</div>
            <div className="text-xs text-gray-400 mt-0.5">Apply for access</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
