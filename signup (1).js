export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { first_name, last_name, email, school, title, division, location, phone, reason } = req.body

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'JUCO Diamond Hub <onboarding@resend.dev>',
        to: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        subject: `New coach application — ${first_name} ${last_name} at ${school}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: #1D9E75; padding: 20px 24px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 20px;">New Coach Application</h1>
              <p style="color: #9FE1CB; margin: 4px 0 0; font-size: 14px;">JUCO Diamond Hub</p>
            </div>

            <div style="background: #f9f9f9; border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #999; width: 120px;">Name</td>
                  <td style="padding: 8px 0; font-size: 15px; color: #111; font-weight: 600;">${first_name} ${last_name}</td>
                </tr>
                <tr style="border-top: 1px solid #eee;">
                  <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #999;">Email</td>
                  <td style="padding: 8px 0; font-size: 15px; color: #1D9E75;">${email}</td>
                </tr>
                <tr style="border-top: 1px solid #eee;">
                  <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #999;">School</td>
                  <td style="padding: 8px 0; font-size: 15px; color: #111;">${school}</td>
                </tr>
                <tr style="border-top: 1px solid #eee;">
                  <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #999;">Title</td>
                  <td style="padding: 8px 0; font-size: 15px; color: #111;">${title}</td>
                </tr>
                ${division ? `<tr style="border-top: 1px solid #eee;">
                  <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #999;">Division</td>
                  <td style="padding: 8px 0; font-size: 15px; color: #111;">${division}</td>
                </tr>` : ''}
                ${location ? `<tr style="border-top: 1px solid #eee;">
                  <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #999;">Location</td>
                  <td style="padding: 8px 0; font-size: 15px; color: #111;">${location}</td>
                </tr>` : ''}
                ${phone ? `<tr style="border-top: 1px solid #eee;">
                  <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #999;">Phone</td>
                  <td style="padding: 8px 0; font-size: 15px; color: #111;">${phone}</td>
                </tr>` : ''}
                ${reason ? `<tr style="border-top: 1px solid #eee;">
                  <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #999; vertical-align: top;">Note</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #555; font-style: italic;">"${reason}"</td>
                </tr>` : ''}
              </table>

              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/coaches"
                  style="background: #1D9E75; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;">
                  Review Application →
                </a>
              </div>
            </div>
          </div>
        `
      })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || 'Resend error')
    }

    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Email error:', err)
    res.status(500).json({ error: err.message })
  }
}
