# 🚀 Scripts de Deploy e Migração Automática

Este diretório contém scripts para automatizar o processo de deploy e migração do banco de dados do projeto **meus ENVELOPES**.

## 📋 Scripts Disponíveis

### 🔄 `migrate.ts` - Migração Automática

Executa migrações do Prisma e seed do banco automaticamente.

**Uso:**

```bash
npm run db:migrate
```

**O que faz:**

1. Gera o cliente Prisma
2. Executa migrações pendentes
3. Verifica saúde do banco
4. Executa seed se necessário

### 🚀 `deploy.ts` - Deploy Completo

Script principal de deploy que inclui build, migração e verificação.

**Uso:**

```bash
# Deploy completo
npm run deploy

# Deploy em produção
npm run deploy:prod

# Deploy pulando build
npm run deploy:skip-build

# Deploy pulando migração
npm run deploy:skip-migration
```

**Opções:**

- `--skip-install`: Pula instalação de dependências
- `--skip-build`: Pula build da aplicação
- `--skip-migration`: Pula migração do banco
- `--skip-health-check`: Pula verificação de saúde
- `--production` ou `-p`: Marca como deploy em produção

### 🏥 `health-check.ts` - Verificação de Saúde

Verifica a integridade e performance do banco de dados.

**Uso:**

```bash
npm run db:health
```

**Verificações:**

- Conexão com o banco
- Integridade das tabelas
- Dados essenciais
- Performance das queries

**Códigos de saída:**

- `0`: Saudável
- `2`: Avisos
- `1`: Não saudável

### 🔄 `rollback.ts` - Rollback de Migrações

Permite reverter para uma migração específica em caso de problemas.

**Uso:**

```bash
# Listar migrações disponíveis
npm run db:rollback

# Rollback para migração específica
npm run db:rollback 20241201000000_init

# Forçar rollback
npm run db:rollback --force 20241201000000_init

# Simular rollback (dry run)
npm run db:rollback --dry-run 20241201000000_init

# Rollback sem backup
npm run db:rollback --no-backup --force 20241201000000_init
```

**⚠️ ATENÇÃO:** Rollback pode causar perda de dados!

## 🛠️ Scripts NPM

### Comandos de Banco de Dados

```bash
npm run db:migrate      # Executa migrações
npm run db:deploy       # Deploy com migração
npm run db:health       # Verifica saúde do banco
npm run db:rollback     # Rollback de migrações
npm run db:seed         # Executa seed do banco
```

### Comandos de Deploy

```bash
npm run deploy          # Deploy padrão
npm run deploy:prod     # Deploy em produção
npm run deploy:skip-build    # Deploy sem build
npm run deploy:skip-migration # Deploy sem migração
```

## 🔧 Configuração

### Variáveis de Ambiente Obrigatórias

```bash
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Variáveis de Ambiente Opcionais

```bash
NODE_ENV=production          # Ambiente (development/production)
SKIP_INSTALL=true           # Pula instalação de dependências
SKIP_BUILD=true             # Pula build da aplicação
SKIP_MIGRATION=true         # Pula migração do banco
SKIP_HEALTH_CHECK=true      # Pula verificação de saúde
START_APP=true              # Inicia aplicação automaticamente
CLEAR_CACHE=true            # Limpa cache do npm
```

## 🚀 CI/CD

### GitHub Actions

O workflow `.github/workflows/deploy.yml` automatiza:

1. **Testes** - Executa suite de testes
2. **Migração** - Atualiza banco de dados
3. **Deploy Staging** - Para branch `develop`
4. **Deploy Produção** - Para branch `main`
5. **Rollback** - Manual via workflow dispatch

### Vercel

Configuração em `vercel.json` com:

- Build automático
- Variáveis de ambiente
- Região Brasil (gru1)
- Deploy automático para main/develop

## 📊 Monitoramento

### Verificação de Saúde

```bash
# Verificação manual
npm run db:health

# Verificação automática no deploy
npm run deploy
```

### Logs de Deploy

Os scripts geram logs detalhados com:

- ✅ Sucessos
- ⚠️ Avisos
- ❌ Erros
- 📊 Métricas de performance
- 🕐 Timestamps

## 🆘 Solução de Problemas

### Problemas Comuns

#### 1. Falha na Migração

```bash
# Verificar saúde do banco
npm run db:health

# Tentar migração novamente
npm run db:migrate
```

#### 2. Falha no Deploy

```bash
# Deploy sem migração primeiro
npm run deploy:skip-migration

# Depois executar migração separadamente
npm run db:migrate
```

#### 3. Problemas de Conexão

```bash
# Verificar variáveis de ambiente
echo $DATABASE_URL

# Testar conexão
npm run db:health
```

### Rollback de Emergência

```bash
# Listar migrações disponíveis
npm run db:rollback

# Rollback para migração estável
npm run db:rollback --force 20241201000000_init
```

## 🔒 Segurança

### Produção

- Sempre use `--production` para deploys em produção
- Verifique variáveis de ambiente antes do deploy
- Execute backup antes de migrações críticas
- Monitore logs após deploy

### Desenvolvimento

- Use `--dry-run` para testar scripts
- Teste em ambiente de staging primeiro
- Mantenha backups regulares

## 📚 Recursos Adicionais

### Documentação

- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions](https://docs.github.com/en/actions)

### Suporte

- Issues do projeto para bugs
- Pull requests para melhorias
- Documentação interna para detalhes técnicos

---

**⚠️ IMPORTANTE:** Sempre teste scripts em ambiente de desenvolvimento antes de usar em produção!
