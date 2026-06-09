import Link from 'next/link'
import Navbar from '../../components/Navbar'

export default function CoachPending() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-5">⏳</div>
        <h1 className="font-condensed font-black text-3xl text-gray-900 mb-3">Application received!</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Your coach account is pending review. We typically approve applications within 24–48 hours. Once approved, you'll be able to sign in and access the full recruiting database.
        </p>
        <div className="card text-left space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="text-green-hub text-lg">✓</span> Application submitted
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="text-gray-300 text-lg">○</span> Under review (24–48 hrs)
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="text-gray-300 text-lg">○</span> Account approved — full access granted
          </div>
        </div>
        <Link href="/" className="btn-secondary inline-block">Back to home</Link>
      </div>
    </div>
  )
}
