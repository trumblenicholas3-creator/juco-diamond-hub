export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        subject: 'JUCO Diamond Hub — test email',
        html: '<p>If you got this, email notifications are working!</p>'
      })
    })

    const data = await response.json()
    res.status(200).json({ status: response.status, data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
