import { formatCurrency } from '@/lib/currency'
import { Html, Head, Body, Container, Text, Link } from '@react-email/components'
import * as React from 'react'

interface NewOperationEmailProps {
  userName: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  description?: string
  categoryName?: string
}

export default function NewOperationEmail({
  userName,
  amount,
  type,
  description,
  categoryName,
}: NewOperationEmailProps) {
  const operationType = type === 'INCOME' ? 'entrada' : 'saída';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Nova Operação Financeira no Meus Envelopes</Text>
          <Text style={paragraph}>Olá {userName},</Text>
          <Text style={paragraph}>
            Uma nova operação de {operationType} foi registrada:
          </Text>
          <Text style={details}>
            <strong>Valor:</strong> {formatCurrency(amount)}
          </Text>
          {description && (
            <Text style={details}>
              <strong>Descrição:</strong> {description || 'Sem descrição'}
            </Text>
          )}
          {categoryName && (
            <Text style={details}>
              <strong>Categoria:</strong> {categoryName || 'Não categorizada'}
            </Text>
          )}
          <Text style={paragraph}>
            Você pode visualizar seu painel aqui:
            <Link href="https://your-app-url.com/dashboard" style={link}>
              Painel MeusEnvelopes
            </Link>
          </Text>
          <Text style={footer}>Obrigado por usar o Meus Envelopes!</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
  padding: '0 30px',
}

const paragraph = {
  padding: '0 30px',
  margin: '0',
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#3c4149',
}

const details = {
  padding: '0 30px',
  margin: '0',
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#3c4149',
}

const link = {
  color: '#067df7',
  textDecoration: 'none',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  padding: '0 30px',
  marginTop: '20px',
}
