import Link from 'next/link'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'

export default function About() {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return
      setUser(data.user)
      const { data: coach } = await supabase.from('coaches').select('id').eq('user_id', data.user.id).single()
      setUserType(coach ? 'coach' : 'athlete')
    })
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} userType={userType} />

      {/* Hero */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="font-condensed font-semibold text-xs tracking-widest uppercase text-green-hub mb-3">Our story</div>
          <h1 className="font-condensed font-black text-5xl text-gray-900 leading-none mb-6">
            About JUCO<br /><span className="text-green-hub">Diamond Hub</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            Created with one mission: help junior college softball athletes gain exposure and connect with college coaches looking for talent.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-14">

        {/* Mission */}
        <div className="mb-14">
          <p className="text-base text-gray-600 leading-relaxed mb-5">
            The recruiting process can be challenging for both athletes and coaches. Talented players often struggle to get noticed, while coaches spend countless hours searching through social media, emails, recruiting websites, and personal networks trying to identify the right fit for their program. JUCO Diamond was built to simplify that process.
          </p>
          <p className="text-base text-gray-600 leading-relaxed">
            Our platform serves as a centralized recruiting hub where junior college softball players can create profiles, showcase their statistics, share highlight videos, display academic achievements, and communicate their recruiting status. Coaches can search, evaluate, and connect with athletes through one streamlined platform designed specifically for the junior college softball community.
          </p>
        </div>

        {/* Why we started */}
        <div className="border-t border-gray-100 pt-12 mb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div>
              <div className="font-condensed font-semibold text-xs tracking-widest uppercase text-green-hub mb-3">Why we started</div>
              <h2 className="font-condensed font-black text-3xl text-gray-900 mb-5">Built from experience</h2>
              <p className="text-base text-gray-600 leading-relaxed mb-4">
                JUCO Diamond was founded by someone who has spent years working at the intersection of athletics, recruiting, marketing, and higher education.
              </p>
              <p className="text-base text-gray-600 leading-relaxed">
                As a former collegiate athlete, sports information professional, athletic marketer, and college admissions representative, our founder has seen firsthand how important exposure and relationships are in the recruiting process.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="font-condensed font-bold text-xs tracking-widest uppercase text-gray-400 mb-4">Founder background</div>
              <div className="space-y-3">
                {[
                  { icon: '🏃', label: 'Former collegiate athlete' },
                  { icon: '📢', label: 'Sports information professional' },
                  { icon: '📣', label: 'Athletic marketer' },
                  { icon: '🎓', label: 'College admissions representative' },
                  { icon: '🤝', label: 'Higher education relationship builder' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-lg">{icon}</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-base text-gray-600 leading-relaxed mt-8">
            Throughout a career spent helping students find opportunities, supporting athletic programs, building marketing campaigns, creating content, and developing relationships across higher education, one thing became clear: talented student-athletes deserve better visibility. JUCO Diamond combines those experiences into a single platform dedicated to helping athletes take the next step in their academic and athletic careers.
          </p>
        </div>

        {/* Vision */}
        <div className="border-t border-gray-100 pt-12 mb-14">
          <div className="font-condensed font-semibold text-xs tracking-widest uppercase text-green-hub mb-3">Our vision</div>
          <h2 className="font-condensed font-black text-3xl text-gray-900 mb-5">Every athlete deserves to be seen</h2>
          <p className="text-base text-gray-600 leading-relaxed mb-5">
            Our goal is to become the leading recruiting and exposure platform for junior college softball, connecting athletes with coaches while creating a stronger, more connected softball community.
          </p>
          <p className="text-base text-gray-600 leading-relaxed">
            Whether you're an athlete searching for your next opportunity or a coach looking for your next impact player, JUCO Diamond is built for you.
          </p>
        </div>

        {/* Tagline */}
        <div className="bg-green-hub rounded-2xl p-10 text-center">
          <p className="font-condensed font-black text-3xl text-white leading-snug">
            Connecting Talent.<br />Creating Opportunity.<br />Growing the Game.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="border border-gray-200 rounded-xl p-6 text-center hover:border-green-hub transition-colors">
            <div className="text-3xl mb-3">🏃</div>
            <div className="font-condensed font-black text-xl text-gray-900 mb-2">Are you an athlete?</div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">Create your free profile and get in front of college coaches today.</p>
            <Link href="/athlete/signup" className="btn-primary inline-block">Create free profile →</Link>
          </div>
          <div className="border border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
            <div className="text-3xl mb-3">📋</div>
            <div className="font-condensed font-black text-xl text-gray-900 mb-2">Are you a coach?</div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">Apply for a verified account and access the full recruiting database.</p>
            <Link href="/coach/signup" className="btn-primary inline-block">Apply now →</Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-100 py-8 text-center">
        <div className="font-condensed font-black text-lg text-gray-900 mb-1">
          JUCO <span className="text-green-hub">Diamond</span> Hub
        </div>
        <p className="text-xs text-gray-400 font-condensed tracking-wider uppercase">Connecting JUCO talent with four-year opportunity</p>
      </footer>
    </div>
  )
}
