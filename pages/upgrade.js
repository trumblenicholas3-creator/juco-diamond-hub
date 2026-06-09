import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'

export default function Upgrade() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return
      setUser(data.user)
      const { data: coach } = await supabase.from('coaches').select('id').eq('user_id', data.user.id).single()
      setUserType(coach ? 'coach' : 'athlete')
    })
  }, [])

  const handleCheckout = async (price_id) => {
    if (!user) { router.push('/signin'); return }
    setLoading(price_id)
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price_id, user_id: user.id, user_email: user.email })
    })
    const { url, error } = await res.json()
    if (error) { alert(error); setLoading(null); return }
    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} userType={userType} />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="font-condensed font-semibold text-xs tracking-widest uppercase text-green-hub mb-2">Upgrade</div>
          <h1 className="font-condensed font-black text-4xl text-gray-900 mb-3">Get more from JUCO Diamond Hub</h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto">Free accounts get you started. Upgrade to stand out and get recruited faster.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Athlete free */}
          <div className="card">
            <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-1">Athletes</div>
            <div className="font-condensed font-black text-2xl text-gray-900 mb-1">Free</div>
            <p className="text-xs text-gray-400 mb-5">Always free</p>
            <ul className="space-y-2.5 mb-6">
              {['Public recruiting profile','Stats & achievements','Highlight film links','Recruiting status','Visible to all coaches'].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-hub mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/athlete/signup" className="btn-secondary w-full text-center block text-xs py-2.5">
              Get started free
            </Link>
          </div>

          {/* Athlete spotlight */}
          <div className="card border-green-hub relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-green-hub text-white font-condensed font-bold text-xs tracking-wider uppercase px-3 py-1 rounded-full">Most popular</span>
            </div>
            <div className="font-condensed font-bold text-xs tracking-widest uppercase text-green-hub mb-1">Athlete Spotlight</div>
            <div className="font-condensed font-black text-2xl text-gray-900 mb-1">$9.99</div>
            <p className="text-xs text-gray-400 mb-5">One-time · 30 days featured</p>
            <ul className="space-y-2.5 mb-6">
              {['Everything in free','See how many coaches saved your profile','Full verified coaches directory','Featured at top of search results','Spotlight badge on profile','Priority visibility to coaches','30 days of enhanced exposure'].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-hub mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => handleCheckout('athlete_spotlight')} disabled={loading === 'athlete_spotlight'}
              className="btn-primary w-full text-xs py-2.5">
              {loading === 'athlete_spotlight' ? 'Loading...' : 'Get spotlight →'}
            </button>
          </div>

          {/* Coach premium */}
          <div className="card border-blue-200">
            <div className="font-condensed font-bold text-xs tracking-widest uppercase text-blue-600 mb-1">Coach Premium</div>
            <div className="font-condensed font-black text-2xl text-gray-900 mb-1">$29.99<span className="text-base font-normal text-gray-400">/mo</span></div>
            <p className="text-xs text-gray-400 mb-5">or $239/year (save 33%)</p>
            <ul className="space-y-2.5 mb-4">
              {['Unlimited athlete searches','Advanced filters','Unlimited saved prospects','Recruiting boards','Direct athlete contact','New profile notifications'].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-hub mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => handleCheckout('coach_monthly')} disabled={loading === 'coach_monthly'}
              className="btn-primary w-full text-xs py-2.5 mb-2">
              {loading === 'coach_monthly' ? 'Loading...' : 'Subscribe monthly →'}
            </button>
            <button onClick={() => handleCheckout('coach_yearly')} disabled={loading === 'coach_yearly'}
              className="btn-secondary w-full text-xs py-2.5">
              {loading === 'coach_yearly' ? 'Loading...' : 'Subscribe yearly (save 33%)'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Secure payments powered by Stripe. Cancel anytime. Questions? <a href="mailto:trumble.nicholas3@gmail.com" className="text-green-hub underline">Contact us</a>
        </p>
      </div>
    </div>
  )
}
