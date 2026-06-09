import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = await getRawBody(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  const session = event.data.object
  const { user_id, price_id } = session.metadata || {}

  if (event.type === 'checkout.session.completed') {
    if (price_id === 'athlete_spotlight') {
      const spotlight_until = new Date()
      spotlight_until.setDate(spotlight_until.getDate() + 30)
      await supabaseAdmin.from('athletes').update({
        is_featured: true,
        spotlight_until: spotlight_until.toISOString()
      }).eq('user_id', user_id)
    }

    if (price_id === 'coach_monthly' || price_id === 'coach_yearly') {
      await supabaseAdmin.from('coaches').update({
        is_premium: true,
        stripe_customer_id: session.customer,
      }).eq('user_id', user_id)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const customer_id = session.customer
    await supabaseAdmin.from('coaches').update({ is_premium: false }).eq('stripe_customer_id', customer_id)
  }

  res.status(200).json({ received: true })
}
