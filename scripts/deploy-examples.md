# 🚀 Exemplos de Deploy para Diferentes Provedores

Este arquivo contém exemplos de como configurar e executar deploy em diferentes plataformas de hosting.

## 🌐 Vercel

### Configuração Básica

```bash
# Instalar CLI do Vercel
npm i -g vercel

# Login
vercel login

# Configurar projeto
vercel

# Deploy
vercel --prod
```

### Deploy com Migração

```bash
# 1. Executar migração localmente
npm run db:migrate

# 2. Deploy para Vercel
vercel --prod

# 3. Verificar saúde
vercel logs
```

### Script Personalizado para Vercel

```json
{
  "scripts": {
    "vercel-build": "npm run db:migrate && npm run build",
    "vercel-deploy": "vercel --prod"
  }
}
```

## ☁️ Netlify

### Configuração Básica

```bash
# Instalar CLI do Netlify
npm i -g netlify-cli

# Login
netlify login

# Configurar projeto
netlify init

# Deploy
netlify deploy --prod
```

### Deploy com Migração

```bash
# 1. Executar migração
npm run db:migrate

# 2. Build
npm run build

# 3. Deploy
netlify deploy --prod --dir=out
```

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "out"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🐳 Docker

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Instalar dependências
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Build da aplicação
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Imagem de produção
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Scripts Docker

```bash
# Build e deploy
docker build -t meus-envelopes .
docker run -p 3000:3000 meus-envelopes

# Com Docker Compose
docker-compose up -d

# Deploy com migração
docker-compose exec app npm run db:migrate
```

## 🚀 Railway

### Configuração

```bash
# Instalar CLI do Railway
npm i -g @railway/cli

# Login
railway login

# Configurar projeto
railway init

# Deploy
railway up
```

### railway.json

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Deploy com Migração

```bash
# 1. Deploy da aplicação
railway up

# 2. Executar migração
railway run npm run db:migrate

# 3. Verificar saúde
railway run npm run db:health
```

## ☸️ Kubernetes

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: meus-envelopes
spec:
  replicas: 3
  selector:
    matchLabels:
      app: meus-envelopes
  template:
    metadata:
      labels:
        app: meus-envelopes
    spec:
      containers:
        - name: app
          image: meus-envelopes:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
            - name: NEXTAUTH_SECRET
              valueFrom:
                secretKeyRef:
                  name: app-secret
                  key: nextauth-secret
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: meus-envelopes-service
spec:
  selector:
    app: meus-envelopes
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

### Job de Migração

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  template:
    spec:
      containers:
        - name: migration
          image: meus-envelopes:latest
          command: ["npm", "run", "db:migrate"]
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
      restartPolicy: Never
  backoffLimit: 3
```

## 🔧 Scripts de Deploy Personalizados

### Deploy para VPS

```bash
#!/bin/bash
# deploy-vps.sh

set -e

echo "🚀 Iniciando deploy para VPS..."

# Variáveis
APP_NAME="meus-envelopes"
DEPLOY_PATH="/var/www/$APP_NAME"
BACKUP_PATH="/var/backups/$APP_NAME"

# Backup
echo "💾 Criando backup..."
mkdir -p $BACKUP_PATH
if [ -d "$DEPLOY_PATH" ]; then
    tar -czf "$BACKUP_PATH/backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C $DEPLOY_PATH .
fi

# Pull do código
echo "📥 Atualizando código..."
cd $DEPLOY_PATH
git pull origin main

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --only=production

# Executar migração
echo "🗄️ Executando migração..."
npm run db:migrate

# Build da aplicação
echo "🏗️ Construindo aplicação..."
npm run build

# Reiniciar serviço
echo "🔄 Reiniciando serviço..."
sudo systemctl restart $APP_NAME

# Verificar saúde
echo "🏥 Verificando saúde..."
sleep 10
curl -f http://localhost:3000/api/health || exit 1

echo "✅ Deploy concluído com sucesso!"
```

### Deploy para AWS

```bash
#!/bin/bash
# deploy-aws.sh

set -e

echo "🚀 Iniciando deploy para AWS..."

# Variáveis
S3_BUCKET="meus-envelopes-static"
CLOUDFRONT_DISTRIBUTION="E1234567890ABCD"

# Build da aplicação
echo "🏗️ Construindo aplicação..."
npm run build

# Upload para S3
echo "☁️ Fazendo upload para S3..."
aws s3 sync out/ s3://$S3_BUCKET --delete

# Invalidar cache do CloudFront
echo "🔄 Invalidando cache..."
aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION \
    --paths "/*"

# Executar migração no RDS
echo "🗄️ Executando migração..."
npm run db:migrate

echo "✅ Deploy para AWS concluído!"
```

## 📊 Monitoramento e Logs

### Health Check Endpoint

```typescript
// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Verificar conexão com banco
    await prisma.$connect();

    // Verificar tabelas principais
    const userCount = await prisma.user.count();
    const envelopeCount = await prisma.envelope.count();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        users: userCount,
        envelopes: envelopeCount,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

### Logs Estruturados

```typescript
// scripts/deploy.ts (exemplo de log estruturado)
function logDeployEvent(event: string, details: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "unknown",
  };

  console.log(JSON.stringify(logEntry));

  // Aqui você pode enviar para serviços de log como:
  // - CloudWatch (AWS)
  // - Stackdriver (GCP)
  // - Log Analytics (Azure)
  // - Datadog, New Relic, etc.
}
```

## 🔒 Segurança

### Variáveis de Ambiente

```bash
# .env.production
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-domain.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Variáveis de segurança
NODE_ENV=production
HIDE_POWERED_BY=true
ENABLE_HTTPS_REDIRECT=true
```

### Headers de Segurança

```typescript
// next.config.js
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};
```

---

**💡 Dica:** Sempre teste seus scripts de deploy em ambiente de desenvolvimento antes de usar em produção!
