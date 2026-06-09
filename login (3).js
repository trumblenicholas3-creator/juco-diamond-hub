import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { user_id, admin_delete_id } = req.body

  try {
    // Admin deleting another user
    if (admin_delete_id) {
      const authHeader = req.headers.authorization
      if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
      if (authError || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      await supabaseAdmin.auth.admin.deleteUser(admin_delete_id)
      return res.status(200).json({ success: true })
    }

    // User deleting their own account
    if (user_id) {
      await supabaseAdmin.auth.admin.deleteUser(user_id)
      return res.status(200).json({ success: true })
    }

    res.status(400).json({ error: 'Missing user_id' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
