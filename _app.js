import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { supabase } from '../../lib/supabase'

const PITCHER_STATS = [
  { key: 'era', label: 'ERA' },
  { key: 'wins', label: 'Wins' },
  { key: 'losses', label: 'Losses' },
  { key: 'saves', label: 'Saves' },
  { key: 'innings_pitched', label: 'Innings Pitched' },
  { key: 'strikeouts', label: 'Strikeouts' },
  { key: 'walks_allowed', label: 'Walks Allowed' },
  { key: 'hits_allowed', label: 'Hits Allowed' },
  { key: 'whip', label: 'WHIP' },
  { key: 'appearances', label: 'Appearances' },
]

const BATTER_STATS = [
  { key: 'avg', label: 'Batting Avg' },
  { key: 'obp', label: 'OBP' },
  { key: 'slg', label: 'SLG' },
  { key: 'ops', label: 'OPS' },
  { key: 'games', label: 'Games' },
  { key: 'at_bats', label: 'At Bats' },
  { key: 'hits', label: 'Hits' },
  { key: 'doubles', label: 'Doubles' },
  { key: 'triples', label: 'Triples' },
  { key: 'home_runs', label: 'Home Runs' },
  { key: 'rbi', label: 'RBI' },
  { key: 'runs', label: 'Runs' },
  { key: 'stolen_bases', label: 'Stolen Bases' },
  { key: 'walks', label: 'Walks' },
  { key: 'strikeouts', label: 'Strikeouts' },
  { key: 'fielding_pct', label: 'Fielding %' },
]

export default function AthleteStats() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [athlete, setAthlete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [season, setSeason] = useState('2024')
  const [stats, setStats] = useState({})
  const isPitcher = athlete?.position === 'Pitcher'

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) { router.push('/signin'); return }
      setUser(data.user)
      const { data: a } = await supabase.from('athletes').select('*').eq('user_id', data.user.id).single()
      if (!a) { router.push('/athlete/signup'); return }
      setAthlete(a)
      setStats(a.stats || {})
      setSeason(a.stats_season || '2024')
      setLoading(false)
    })
  }, [])

  const setStat = (k, v) => setStats(s => ({ ...s, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('athletes').update({ stats, stats_season: season }).eq('user_id', user.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  const statFields = isPitcher ? PITCHER_STATS : BATTER_STATS

  if (loading) return (
    <div className="min-h-screen bg-white"><Navbar />
      <div className="flex items-center justify-center h-64 text-gray-400 font-condensed uppercase tracking-widest text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} userType="athlete" />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-condensed font-black text-3xl text-gray-900">My stats</h1>
            <p className="text-sm text-gray-500 mt-0.5">These show up on your public profile</p>
          </div>
          <Link href="/athlete/dashboard" className="btn-secondary text-xs px-4 py-2">← Dashboard</Link>
        </div>

        {saved && (
          <div className="bg-green-light border border-green-mid rounded-xl p-4 mb-5 text-sm text-green-darker">
            ✓ Stats saved successfully.
          </div>
        )}

        <div className="card space-y-5">
          <div>
            <label className="label">Season year</label>
            <select className="input max-w-xs" value={season} onChange={e => setSeason(e.target.value)}>
              {['2024', '2025', '2026'].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="font-condensed font-bold text-sm text-gray-700 mb-4">
              {isPitcher ? 'Pitching stats' : 'Hitting & fielding stats'}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {statFields.map(({ key, label }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input
                    className="input"
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
          </div>

          <div className="pt-2">
            <button className="btn-primary w-full py-3" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save stats →'}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Stats are displayed publicly on your profile for coaches to see.
        </p>
      </div>
    </div>
  )
}
