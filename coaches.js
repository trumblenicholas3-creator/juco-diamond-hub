import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Navbar() {
  const router = useRouter()
  const [userType, setUserType] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        localStorage.removeItem('juco_user_type')
        setCurrentUser(null)
        setUserType(null)
        setReady(true)
        return
      }

      setCurrentUser(session.user)

      // Use cached role from localStorage to avoid flash
      const cached = localStorage.getItem('juco_user_type')
      if (cached) {
        setUserType(cached)
        setReady(true)
        return
      }

      // First time — fetch and cache
      const { data: coach } = await supabase
        .from('coaches')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      const role = coach ? 'coach' : 'athlete'
      localStorage.setItem('juco_user_type', role)
      setUserType(role)
      setReady(true)
    }

    init()
  }, [])

  const handleSignOut = async () => {
    localStorage.removeItem('juco_user_type')
    await supabase.auth.signOut()
    setCurrentUser(null)
    setUserType(null)
    router.push('/')
  }

  if (!ready) return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-14">
      <div className="max-w-6xl mx-auto px-6 flex items-center h-full">
        <Link href="/" className="font-condensed font-black text-xl tracking-tight">
          JUCO <span className="text-green-hub">Diamond</span> Hub
        </Link>
      </div>
    </nav>
  )

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <Link href="/" className="font-condensed font-black text-xl tracking-tight flex-shrink-0">
          JUCO <span className="text-green-hub">Diamond</span> Hub
        </Link>

        {!currentUser && (
          <div className="hidden md:flex items-center gap-6">
            <Link href="/athletes" className="font-condensed font-semibold text-xs tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors">Athletes</Link>
            <Link href="/coaches" className="font-condensed font-semibold text-xs tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors">Coaches</Link>
            <Link href="/about" className="font-condensed font-semibold text-xs tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors">About</Link>
          </div>
        )}

        {userType === 'athlete' && (
          <div className="hidden md:flex items-center gap-6">
            <Link href="/athlete/dashboard" className={`font-condensed font-semibold text-xs tracking-widest uppercase transition-colors ${router.pathname === '/athlete/dashboard' ? 'text-green-hub' : 'text-gray-500 hover:text-gray-900'}`}>Dashboard</Link>


            <Link href="/coaches" className={`font-condensed font-semibold text-xs tracking-widest uppercase transition-colors ${router.pathname === '/coaches' ? 'text-green-hub' : 'text-gray-500 hover:text-gray-900'}`}>Coaches 🔒</Link>
            <Link href="/about" className="font-condensed font-semibold text-xs tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors">About</Link>
          </div>
        )}

        {userType === 'coach' && (
          <div className="hidden md:flex items-center gap-6">
            <Link href="/coach/dashboard" className={`font-condensed font-semibold text-xs tracking-widest uppercase transition-colors ${router.pathname === '/coach/dashboard' ? 'text-green-hub' : 'text-gray-500 hover:text-gray-900'}`}>Search Athletes</Link>
            <Link href="/coach/saved" className={`font-condensed font-semibold text-xs tracking-widest uppercase transition-colors ${router.pathname === '/coach/saved' ? 'text-green-hub' : 'text-gray-500 hover:text-gray-900'}`}>Saved Prospects</Link>
            <Link href="/athletes" className={`font-condensed font-semibold text-xs tracking-widest uppercase transition-colors ${router.pathname === '/athletes' ? 'text-green-hub' : 'text-gray-500 hover:text-gray-900'}`}>All Athletes</Link>
            <Link href="/about" className="font-condensed font-semibold text-xs tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors">About</Link>
          </div>
        )}

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              {userType === 'athlete' && (
                <Link href="/upgrade" className="font-condensed font-bold text-xs tracking-wider uppercase px-3 py-1.5 bg-green-light text-green-darker rounded-full hover:bg-green-mid transition-colors">
                  ✦ Upgrade
                </Link>
              )}
              {userType === 'coach' && (
                <Link href="/upgrade" className="font-condensed font-bold text-xs tracking-wider uppercase px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors">
                  ✦ Go Premium
                </Link>
              )}
              <Link href="/account" className="btn-secondary text-xs px-4 py-2">Account</Link>
              <button onClick={handleSignOut} className="btn-secondary text-xs px-4 py-2">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/signin" className="btn-secondary text-xs px-4 py-2">Sign in</Link>
              <Link href="/signin" className="btn-primary text-xs px-4 py-2">Get started</Link>
            </>
          )}
        </div>
      </div>

      {userType === 'athlete' && (
        <div className="md:hidden border-t border-gray-100 px-4 py-2 flex gap-4 overflow-x-auto">
          <Link href="/athlete/dashboard" className="font-condensed font-semibold text-xs tracking-wider uppercase text-gray-500 whitespace-nowrap">Dashboard</Link>


          <Link href="/coaches" className="font-condensed font-semibold text-xs tracking-wider uppercase text-gray-500 whitespace-nowrap">Coaches 🔒</Link>
        </div>
      )}

      {userType === 'coach' && (
        <div className="md:hidden border-t border-gray-100 px-4 py-2 flex gap-4 overflow-x-auto">
          <Link href="/coach/dashboard" className="font-condensed font-semibold text-xs tracking-wider uppercase text-gray-500 whitespace-nowrap">Search</Link>
          <Link href="/coach/saved" className="font-condensed font-semibold text-xs tracking-wider uppercase text-gray-500 whitespace-nowrap">Saved</Link>
          <Link href="/athletes" className="font-condensed font-semibold text-xs tracking-wider uppercase text-gray-500 whitespace-nowrap">All Athletes</Link>
        </div>
      )}
    </nav>
  )
}
