import { Html, Head, Body, Container, Text, Link } from '@react-email/components'
import * as React from 'react'

interface WelcomeEmailProps {
  userName: string
}

export default function WelcomeEmail({
  userName,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Bem-vindo(a) ao Meus Envelopes!</Text>
          <Text style={paragraph}>Olá {userName},</Text>
          <Text style={paragraph}>
            Estamos muito felizes em ter você conosco. O Meus Envelopes foi criado para ajudar você a organizar suas finanças de forma simples e eficiente.
          </Text>
          <Text style={paragraph}>
            Para começar a usar, acesse seu painel:
            <Link href="https://your-app-url.com/dashboard" style={link}>
              Acessar Painel
            </Link>
          </Text>
          <Text style={footer}>Se precisar de ajuda, não hesite em nos contatar.</Text>
          <Text style={footer}>Atenciosamente,</Text>
          <Text style={footer}>A equipe Meus Envelopes</Text>
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
