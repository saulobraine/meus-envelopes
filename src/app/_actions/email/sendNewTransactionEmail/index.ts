"use server";

import { render } from '@react-email/render'
import NewTransactionEmail from '@/emails/NewTransactionEmail'
import { transporter } from '@/lib/email'

export async function sendNewTransactionEmail({
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
      console.error('Invalid amount provided to sendNewTransactionEmail:', amount);
      return; // Or handle the error as appropriate for your application
    }

    const emailHtml = await render(
      NewTransactionEmail({
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
      subject: 'New Financial Transaction Recorded',
      html: emailHtml,
    })
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
