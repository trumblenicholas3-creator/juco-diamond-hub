import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function CoachLogin() {
  const router = useRouter()
  useEffect(() => { router.replace('/signin') }, [])
  return null
}
