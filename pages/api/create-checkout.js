import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PRICES = {
  athlete_spotlight: {
    name: 'Athlete Spotlight',
    description: 'Get featured at the top of coach searches for 30 days',
    amount: 999, // $9.99
    mode: 'payment',
  },
  coach_monthly: {
    name: 'Coach Premium — Monthly',
    description: 'Unlimited athlete searches, advanced filters, recruiting boards',
    amount: 2999, // $29.99
    mode: 'subscription',
  },
  coach_yearly: {
    name: 'Coach Premium — Annual',
    description: 'Everything in monthly, billed annually (save 33%)',
    amount: 23900, // $239/year
    mode: 'subscription',
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { price_id, user_id, user_email } = req.body
  const price = PRICES[price_id]
  if (!price) return res.status(400).json({ error: 'Invalid price' })

  try {
    const sessionConfig = {
      payment_method_types: ['card'],
      customer_email: user_email,
      metadata: { user_id, price_id },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel`,
    }

    if (price.mode === 'subscription') {
      const stripePrice = await stripe.prices.create({
        unit_amount: price.amount,
        currency: 'usd',
        recurring: price_id === 'coach_yearly' ? { interval: 'year' } : { interval: 'month' },
        product_data: { name: price.name },
      })
      sessionConfig.mode = 'subscription'
      sessionConfig.line_items = [{ price: stripePrice.id, quantity: 1 }]
    } else {
      sessionConfig.mode = 'payment'
      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: { name: price.name, description: price.description },
          unit_amount: price.amount,
        },
        quantity: 1,
      }]
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)
    res.status(200).json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
