import Link from 'next/link'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'

// Sample blog/news posts — you can edit these directly or we can add a CMS later
const POSTS = [
  {
    id: 1,
    type: 'announcement',
    tag: 'Platform Update',
    title: 'Welcome to JUCO Diamond Hub',
    excerpt: 'The only recruiting platform built exclusively for junior college softball athletes. Create your profile, upload film, and connect directly with college coaches.',
    date: 'June 2025',
    emoji: '🎉',
  },
  {
    id: 2,
    type: 'tip',
    tag: 'Recruiting Tip',
    title: '5 things coaches look for in a JUCO recruit',
    excerpt: 'GPA matters as much as batting average. Coaches at four-year programs are looking for student-athletes who can contribute academically and athletically from day one.',
    date: 'June 2025',
    emoji: '📋',
  },
  {
    id: 3,
    type: 'tip',
    tag: 'For Athletes',
    title: 'How to make your profile stand out',
    excerpt: 'Profiles with highlight film get 3x more coach views. Upload your Hudl link, keep your stats current, and set your recruiting status so coaches know you\'re available.',
    date: 'June 2025',
    emoji: '🎥',
  },
  {
    id: 4,
    type: 'tip',
    tag: 'For Coaches',
    title: 'Using filters to find your perfect recruit',
    excerpt: 'Narrow your search by position, GPA, graduation year, state, and conference. Save prospects to your board and contact them directly through the platform.',
    date: 'June 2025',
    emoji: '🔍',
  },
]

const tagColors = {
  'Platform Update': 'bg-green-light text-green-darker',
  'Recruiting Tip': 'bg-blue-50 text-blue-800',
  'For Athletes': 'bg-amber-50 text-amber-800',
  'For Coaches': 'bg-purple-50 text-purple-800',
}

export default function Home() {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [ready, setReady] = useState(false)
  const [recentAthletes, setRecentAthletes] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { setReady(true); return }
      setUser(session.user)
      const cached = localStorage.getItem('juco_user_type')
      if (cached) {
        setUserType(cached)
        setReady(true)
      } else {
        const { data: coach } = await supabase.from('coaches').select('id').eq('user_id', session.user.id).single()
        const role = coach ? 'coach' : 'athlete'
        localStorage.setItem('juco_user_type', role)
        setUserType(role)
        setReady(true)
      }

      // Fetch recent athletes for the feed
      const { data } = await supabase.from('athletes')
        .select('id, first_name, last_name, position, school, state, recruiting_status, created_at')
        .order('created_at', { ascending: false })
        .limit(3)
      setRecentAthletes(data || [])
    })
  }, [])

  // Public homepage — not logged in
  if (ready && !user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="font-condensed font-semibold text-xs tracking-widest uppercase text-green-hub mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-hub inline-block"></span>
              Junior College Softball Recruiting
            </div>
            <h1 className="font-condensed font-black text-5xl leading-none text-gray-900 mb-5">
              Where JUCO talent<br />meets <em className="text-green-hub not-italic">four-year</em><br />opportunity.
            </h1>
            <p className="text-gray-500 text-base leading-relaxed mb-6 max-w-md">
              The only platform built exclusively for junior college softball athletes. Showcase your stats, share your film, and connect directly with college coaches.
            </p>
            <div className="flex gap-3 flex-wrap mb-4">
              <Link href="/athlete/signup" className="btn-primary">Create free profile</Link>
              <Link href="/coach/signup" className="btn-secondary">Coach portal</Link>
            </div>
            <p className="text-xs text-gray-400">
              Already have an account?{' '}
              <Link href="/signin" className="text-green-hub underline">Sign in →</Link>
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { icon: '👤', label: 'Free athlete profiles', value: 'Unlimited' },
              { icon: '🎥', label: 'Video platforms', value: 'Hudl · YouTube · Social' },
              { icon: '🔍', label: 'Coach search filters', value: 'Position, GPA, State +' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-green-light flex items-center justify-center text-lg flex-shrink-0">{s.icon}</div>
                <div>
                  <div className="font-condensed font-semibold text-xs tracking-widest uppercase text-gray-400">{s.label}</div>
                  <div className="font-condensed font-black text-xl text-gray-900">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-100 py-16 max-w-6xl mx-auto px-6">
          <div className="font-condensed font-semibold text-xs tracking-widest uppercase text-gray-400 mb-1">Platform features</div>
          <h2 className="font-condensed font-black text-3xl text-gray-900 mb-8">Built for both sides of the diamond</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-light flex items-center justify-center text-base">🏃</div>
                <div className="font-condensed font-bold text-base">For athletes</div>
              </div>
              <ul className="space-y-2.5">
                {['Free recruiting profile with stats and achievements','Link Hudl, YouTube, and social highlights','Set recruiting status: Available, Committed, Exploring','Display GPA, graduation year, position and measurements','Direct exposure to verified college coaches'].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-500 leading-relaxed">
                    <span className="text-green-hub mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-base">📋</div>
                <div className="font-condensed font-bold text-base">For coaches</div>
              </div>
              <ul className="space-y-2.5">
                {['Secure verified coach portal','Filter by position, state, conference, GPA, grad year','Watch highlights directly on player profiles','Save prospects and build recruiting boards','Get notified when new profiles match your criteria'].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-500 leading-relaxed">
                    <span className="text-green-hub mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 border-t border-gray-100 py-16 text-center">
          <h2 className="font-condensed font-black text-4xl text-gray-900 mb-3">Ready to get recruited?</h2>
          <p className="text-gray-500 text-base max-w-md mx-auto mb-7 leading-relaxed">
            Create your free profile today and put your talent in front of the coaches who need to see it.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/athlete/signup" className="btn-primary">Create athlete profile</Link>
            <Link href="/signin" className="btn-secondary">Returning athlete</Link>
            <Link href="/coach/signup" className="btn-secondary">Coach sign-up</Link>
          </div>
        </section>

        <footer className="border-t border-gray-100 py-8 text-center">
          <div className="font-condensed font-black text-lg text-gray-900 mb-1">
            JUCO <span className="text-green-hub">Diamond</span> Hub
          </div>
          <p className="text-xs text-gray-400 font-condensed tracking-wider uppercase">Connecting JUCO talent with four-year opportunity</p>
        </footer>
      </div>
    )
  }

  // Logged in homepage — news feed
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="font-condensed font-black text-3xl text-gray-900">
            {userType === 'coach' ? 'Recruiting feed' : 'Your home feed'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">News, tips, and updates from JUCO Diamond Hub</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Main feed */}
          <div className="md:col-span-2 space-y-4">
            {POSTS.filter(p =>
              userType === 'coach'
                ? p.type !== 'athlete-only'
                : p.type !== 'coach-only'
            ).map(post => (
              <div key={post.id} className="card hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {post.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`tag text-xs ${tagColors[post.tag] || 'bg-gray-100 text-gray-600'}`}>{post.tag}</span>
                      <span className="text-xs text-gray-400">{post.date}</span>
                    </div>
                    <h3 className="font-condensed font-black text-lg text-gray-900 leading-tight mb-1">{post.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{post.excerpt}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Recent athletes for coaches */}
            {userType === 'coach' && recentAthletes.length > 0 && (
              <div className="card">
                <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-4">Recently joined athletes</div>
                <div className="space-y-3">
                  {recentAthletes.map(a => (
                    <div key={a.id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-light border border-green-mid flex items-center justify-center font-condensed font-black text-sm text-green-darker flex-shrink-0">
                        {a.first_name?.[0]}{a.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-condensed font-bold text-sm text-gray-900">{a.first_name} {a.last_name}</div>
                        <div className="text-xs text-gray-400">{a.position} · {a.school}</div>
                      </div>
                      <Link href={`/athlete/${a.id}`} className="font-condensed font-bold text-xs tracking-wider uppercase text-green-hub hover:underline flex-shrink-0">
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
                <Link href="/coach/dashboard" className="btn-secondary text-xs px-4 py-2 mt-4 inline-block">
                  Search all athletes →
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Quick actions */}
            <div className="card">
              <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-3">Quick actions</div>
              <div className="space-y-2">
                {userType === 'athlete' ? (
                  <>
                    <Link href="/athlete/dashboard" className="flex items-center justify-between py-2 border-b border-gray-100 text-sm text-gray-600 hover:text-green-hub transition-colors">
                      <span>My dashboard</span><span>→</span>
                    </Link>
                    <Link href="/athlete/stats" className="flex items-center justify-between py-2 border-b border-gray-100 text-sm text-gray-600 hover:text-green-hub transition-colors">
                      <span>Update my stats</span><span>→</span>
                    </Link>
                    <Link href="/coaches" className="flex items-center justify-between py-2 border-b border-gray-100 text-sm text-gray-600 hover:text-green-hub transition-colors">
                      <span>Browse coaches 🔒</span><span>→</span>
                    </Link>
                    <Link href="/upgrade" className="flex items-center justify-between py-2 text-sm text-green-hub font-medium hover:underline transition-colors">
                      <span>✦ Upgrade profile</span><span>→</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/coach/dashboard" className="flex items-center justify-between py-2 border-b border-gray-100 text-sm text-gray-600 hover:text-green-hub transition-colors">
                      <span>Search athletes</span><span>→</span>
                    </Link>
                    <Link href="/coach/saved" className="flex items-center justify-between py-2 border-b border-gray-100 text-sm text-gray-600 hover:text-green-hub transition-colors">
                      <span>Saved prospects</span><span>→</span>
                    </Link>
                    <Link href="/athletes" className="flex items-center justify-between py-2 border-b border-gray-100 text-sm text-gray-600 hover:text-green-hub transition-colors">
                      <span>All athletes</span><span>→</span>
                    </Link>
                    <Link href="/upgrade" className="flex items-center justify-between py-2 text-sm text-blue-600 font-medium hover:underline transition-colors">
                      <span>✦ Go premium</span><span>→</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Platform stats */}
            <div className="card">
              <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-3">Platform</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Version</span>
                  <span className="font-condensed font-bold text-gray-900">Beta</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="flex items-center gap-1.5 font-condensed font-bold text-green-hub"><span className="w-1.5 h-1.5 rounded-full bg-green-hub inline-block"></span>Live</span>
                </div>
              </div>
            </div>

            {/* About link */}
            <div className="bg-green-hub rounded-xl p-5 text-center">
              <div className="font-condensed font-black text-lg text-white mb-1">JUCO Diamond Hub</div>
              <p className="text-xs text-green-light leading-relaxed mb-3">Connecting Talent. Creating Opportunity. Growing the Game.</p>
              <Link href="/about" className="font-condensed font-bold text-xs tracking-wider uppercase text-white underline">Our story →</Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
