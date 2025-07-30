import { render } from '@react-email/render'
import NewOperationEmail from '@/emails/NewOperationEmail'
import { transporter } from '@/lib/email'

export async function sendNewOperationEmail({
  to,
  userName,
  amount,
  type,
  description,
  envelopeName,
}: {
  to: string
  userName: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  description?: string
  envelopeName?: string
}) {
  try {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
      console.error('Invalid amount provided to sendNewOperationEmail:', amount);
      return; // Or handle the error as appropriate for your application
    }

    const emailHtml = await render(
      NewOperationEmail({
        userName,
        amount: numericAmount,
        type,
        description: description || '',
        envelopeName: envelopeName || ''
      })
    )

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: to,
      subject: 'New Financial Operation Recorded',
      html: emailHtml,
    })
  } catch (error) {
    console.error('Error sending email:', error)
  }
}