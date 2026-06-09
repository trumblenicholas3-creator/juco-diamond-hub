import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AthleteLogin() {
  const router = useRouter()
  useEffect(() => { router.replace('/signin') }, [])
  return null
}
