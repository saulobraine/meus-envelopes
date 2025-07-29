import { render } from '@react-email/render'
import NewOperationEmail from '@/emails/NewOperationEmail'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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