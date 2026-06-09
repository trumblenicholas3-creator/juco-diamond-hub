import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email } = req.body
  if (!email) return res.status(400).json({ exists: false })

  try {
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const exists = users?.users?.some(u => u.email === email)
    res.status(200).json({ exists: !!exists })
  } catch {
    res.status(200).json({ exists: true }) // fail safe — don't redirect if unsure
  }
}
