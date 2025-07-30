import { render } from '@react-email/render'
import WelcomeEmail from '@/emails/WelcomeEmail'
import { transporter } from '@/lib/email'

export async function sendWelcomeEmail({
  to,
  userName,
}: {
  to: string
  userName: string
}) {
  try {
    const emailHtml = await render(
      WelcomeEmail({
        userName,
      })
    )

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: to,
      subject: 'Bem-vindo(a) ao Meus Envelopes!',
      html: emailHtml,
    })
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}