import sgMail from '@sendgrid/mail'

// Initialize SendGrid if API key is provided
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function sendInvitationEmail(params: {
  email: string
  teamName: string
  inviterName: string
  role: string
  inviteUrl: string
}) {
  const { email, teamName, inviterName, role, inviteUrl } = params

  try {
    // If no API key, log the invitation URL for manual testing
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 EMAIL DISABLED - Copy this invitation URL to manually invite users:')
      console.log('   Invitation URL:', inviteUrl)
      console.log('   For email:', email)
      return { success: true, skipped: true }
    }

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@doable.app',
      subject: `You've been invited to join ${teamName} on Doable`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invitation to join ${teamName}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">
                  You've been invited to join ${teamName}
                </h1>
                <p style="margin: 0 0 16px 0; font-size: 16px; color: #4a4a4a; line-height: 1.5;">
                  ${inviterName} has invited you to join the <strong>${teamName}</strong> team as a <strong>${role}</strong> on Doable.
                </p>
                <p style="margin: 0 0 32px 0; font-size: 16px; color: #4a4a4a; line-height: 1.5;">
                  Click the button below to accept the invitation:
                </p>
                <a href="${inviteUrl}" style="display: inline-block; background-color: #0066cc; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500; margin-bottom: 24px;">
                  Accept Invitation
                </a>
                <p style="margin: 0; font-size: 14px; color: #888; line-height: 1.5;">
                  Or copy and paste this URL into your browser:<br>
                  <a href="${inviteUrl}" style="color: #0066cc; word-break: break-all;">${inviteUrl}</a>
                </p>
                <hr style="margin: 32px 0; border: none; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; font-size: 14px; color: #888;">
                  If you didn't expect this invitation, you can safely ignore this email.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    }

    await sgMail.send(msg)
    return { success: true }
  } catch (error: any) {
    // Handle SendGrid errors gracefully
    if (error?.code === 403 || error?.response?.body?.errors) {
      console.log('📧 SENDGRID ERROR: Cannot send email')
      console.log('📧 Invitation created in database, but email not sent.')
      console.log('📧 Copy this invitation URL to manually invite:')
      console.log('   URL:', inviteUrl)
      return { success: true, skipped: true }
    }
    console.error('Error sending invitation email:', error)
    return { success: false, error }
  }
}
