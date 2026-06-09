import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { useRouter } from 'next/router'

export default function PaymentSuccess() {
  const router = useRouter()
  const isCoach = router.query.session_id?.includes('sub')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-5">🎉</div>
        <h1 className="font-condensed font-black text-3xl text-gray-900 mb-3">Payment successful!</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Your account has been upgraded. You now have access to all premium features.
        </p>
        <Link href={isCoach ? '/coach/dashboard' : '/athlete/dashboard'} className="btn-primary inline-block">
          Go to dashboard →
        </Link>
      </div>
    </div>
  )
}
