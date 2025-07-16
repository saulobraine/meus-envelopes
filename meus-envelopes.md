### **Briefing Completo do Projeto: "MeusEnvelopes"**

### **1. Resumo do Projeto**

**"MeusEnvelopes"** é um aplicativo de controle financeiro pessoal, projetado para ser simples, intuitivo e poderoso. Seu principal diferencial é um sistema de "orçamento por envelopes", que permite aos usuários alocar sua renda mensal em categorias de gastos de forma flexível e adaptável, seja por valores fixos ou por porcentagens da renda. O objetivo é dar ao usuário clareza total sobre seu fluxo de caixa e capacitá-lo a tomar decisões financeiras inteligentes.

### **2. Nome e Identidade Visual**

- **Nome do Aplicativo:** `MeusEnvelopes`
- **Conceito do Logo:** Um design hiper-minimalista e limpo. O logo consiste em um único ícone de envelope estilizado. Integradas sutilmente às linhas do envelope, há duas pequenas setas: uma verde (apontando para dentro ou para a direita, representando a receita) e uma vermelha (apontando para fora ou para a esquerda, representando a despesa). O estilo é "flat design", vetorial e otimizado para ser um ícone de aplicativo moderno e reconhecível.

> **Prompt Final para Geração do Logo:**
> Logo para um aplicativo financeiro chamado "MeusEnvelopes". O design deve ser hiper-minimalista e limpo, apresentando um único ícone de envelope estilizado. Integrado sutilmente às linhas do envelope, devem haver duas setas pequenas e distintas. Uma seta, representando a receita (entrada), deve ser colorida em verde. A outra seta, representando a despesa (saída), deve ser colorida em vermelho. O estilo deve ser "flat design" (design plano), em formato de logo vetorial, perfeito para um ícone de aplicativo moderno.

### **3. Arquitetura de Tecnologia**

- **Framework:** Next.js 15+ (com App Router)
- **Linguagem:** TypeScript
- **Backend & Autenticação:** Supabase (PostgreSQL + Auth)
- **ORM:** Prisma
- **Comunicação Cliente-Servidor:** React Server Components e Server Actions
- **Estilização:** Tailwind CSS
- **Gráficos:** Recharts
- **E-mails Transacionais:** Supabase Functions + Resend
- **Validação de Dados:** Zod

---

### **Roadmap Detalhado do Projeto (MVP em Etapas)**

Aqui estão os prompts detalhados para cada fase do desenvolvimento.

#### **Etapa 0: Configuração e Fundações do Projeto**

> **Prompt para IA - Etapa 0**
>
> **Assunto:** Configuração do Projeto "MeusEnvelopes" com Next.js 15 (App Router), Supabase e Prisma.
>
> **Instruções:**
>
> 1. Crie um novo projeto Next.js 15 com App Router, TypeScript e Tailwind CSS.
> 2. Configure um projeto no Supabase e as variáveis de ambiente (`.env`) com as chaves de API e a string de conexão do banco de dados.
> 3. Instale, inicialize e configure o Prisma para se conectar ao banco de dados do Supabase.
> 4. Crie os helpers de cliente e servidor do Supabase para o App Router (`lib/supabase/client.ts`, `lib/supabase/server.ts`).
> 5. Crie uma instância global do Prisma Client (`lib/prisma.ts`).
> 6. Gere a primeira `migration` do Prisma para validar a conexão: `npx prisma migrate dev --name initial_setup`.

#### **Etapa 1: Autenticação e Modelagem de Dados Inicial**

> **Prompt para IA - Etapa 1**
>
> **Assunto:** Implementação de Autenticação com Google e Modelagem de Dados Essencial.
>
> **Instruções:**
>
> 1.  **Modelagem de Dados (Prisma):** No `schema.prisma`, defina os modelos `User`, `Category` e `Operation` (com Enum `OperationType` para `INCOME` e `EXPENSE`). Documente todos os campos.
> 2.  Gere e aplique a `migration` e atualize o Prisma Client.
> 3.  **Autenticação:** Configure o provedor Google no Supabase. Crie a página de Login (`app/login/page.tsx`), a rota de callback (`app/auth/callback/route.ts`) e um `middleware.ts` para proteger as rotas da aplicação.

#### **Etapa 2: CRUD de Operações e Dashboard Visual**

> **Prompt para IA - Etapa 2**
>
> **Assunto:** CRUD de Operações, Categorias e Construção do Dashboard Visual.
>
> **Instruções:**
>
> 1.  **Server Actions:** Crie Server Actions para o CRUD completo de `Operation` e `Category`. Use Zod para validação e `revalidatePath` para atualizar a UI.
> 2.  **Interface:** No dashboard (`app/dashboard/page.tsx`), desenvolva a UI para listar operações e um formulário para adicionar novas transações.
> 3.  **Gráficos Iniciais:** Usando `recharts`, exiba um gráfico de barras (Receitas vs. Despesas do mês) e um gráfico de pizza (distribuição de despesas por categoria).

#### **Etapa 3: Sistema de Planejamento e Envelopes de Gastos**

> **Prompt para IA - Etapa 3**
>
> **Assunto:** Implementação do Sistema de Planejamento com Envelopes de Gastos.
>
> **Instruções:**
>
> 1.  **Modelagem de Dados (Prisma):** Adicione os modelos `MonthlyIncome` (renda mensal), `BudgetEnvelope` (envelopes principais com % de alocação) e `CategoryBudget` (orçamento da categoria, fixo ou % de um envelope). Execute a `migration`.
> 2.  **Página de Planejamento (`app/planning/page.tsx`):** Crie a interface para o usuário:
>     - Registrar a renda do mês (fixa + variável).
>     - Criar e gerenciar seus `BudgetEnvelopes`.
>     - Configurar o orçamento para cada categoria (valor fixo ou porcentagem de um envelope).
> 3.  **Server Actions (`app/_actions/planning.ts`):** Implemente as ações para o CRUD dos novos modelos e uma função `getCalculatedBudgets(userId, month, year)` para calcular os limites de gasto em R$ para cada categoria.
> 4.  **Integração com o Dashboard:** Atualize o dashboard para exibir o progresso dos gastos em relação aos limites calculados dinamicamente (ex: "Alimentação: Gasto R$ 250 de R$ 415").

#### **Etapa 4: Colaboração e Notificações**

> **Prompt para IA - Etapa 4**
>
> **Assunto:** Implementação do Modo Família e Notificações por E-mail.
>
> **Instruções:**
>
> 1.  **Modo Família:** Modele a permissão com uma tabela `SharedAccountAccess` no Prisma. Crie a UI e as Server Actions para o fluxo de convite e gerenciamento. Adapte as Server Actions de leitura para incluir dados de contas compartilhadas.
> 2.  **Notificações por E-mail:** Configure o Resend e instale o React Email. Crie um template para notificar novas transações. Crie uma Supabase Function acionada por um Database Webhook na tabela `Operation` para renderizar e enviar os e-mails personalizados.
