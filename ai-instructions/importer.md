# 📦 Plano Completo – Importador/Exportador Inteligente – _MeusEnvelopes_

## 🎯 Objetivo

Desenvolver um sistema inteligente de **importação e exportação de transações financeiras** com:

- Categorização automática
- Deduplicação com revisão manual
- Histórico completo de importações
- Processamento de transações agendadas
- Experiência centrada no usuário brasileiro

---

## 🧱 1. Modelos de Dados (Prisma)

### Modelo `Transaction`

```ts
model Transaction {
  id               String           @id @default(cuid())
  userId           String
  date             DateTime
  description      String
  amount           Int              // Armazenado em centavos
  type             TransactionType
  categoryId       String
  status           TransactionStatus @default(COMPLETED)
  scheduledAt      DateTime?
  processedAt      DateTime?
  importSessionId  String?
  importSession    ImportSession?   @relation(fields: [importSessionId], references: [id])

  category         Category         @relation(fields: [categoryId], references: [id])
  user             User             @relation(fields: [userId], references: [id])
}
```

### Enum `TransactionStatus`

```ts
enum TransactionStatus {
  COMPLETED
  PENDING
  SCHEDULED
}
```

---

### Modelo `ImportSession`

```ts
model ImportSession {
  id              String    @id @default(cuid())
  userId          String
  createdAt       DateTime @default(now())
  fileName        String
  importedCount   Int      @default(0)
  ignoredCount    Int      @default(0)
  errorCount      Int      @default(0)
  transactions    Transaction[]
  errors          Json?
  previewItems    ImportTransactionPreview[]

  user            User     @relation(fields: [userId], references: [id])
}
```

### Modelo `ImportTransactionPreview`

```ts
model ImportTransactionPreview {
  id              String   @id @default(cuid())
  importSessionId String
  status          PreviewStatus
  resolved        Boolean @default(false)
  data            Json

  importSession   ImportSession @relation(fields: [importSessionId], references: [id])
}
```

### Enum `PreviewStatus`

```ts
enum PreviewStatus {
  NEW
  DUPLICATE
  ERROR
}
```

---

## 🔄 2. Importador de Transações

### Rota:

`/importar`

### Ação:

`app/_actions/importarTransacoes.ts`

### Etapas:

1. **Leitura do arquivo**
   - Suporte a `.csv` e `.xlsx`
   - Colunas esperadas: `DATA`, `DESCRIÇÃO`, `VALOR`, `CATEGORIA`, `STATUS`

2. **Criação da sessão de importação**
   - Salva `fileName`, `userId`, `createdAt`

3. **Validação por linha**
   - Converte `VALOR` para inteiro em centavos
   - Categoria: busca ou cria
   - `STATUS`: usa `COMPLETED` como padrão
   - Armazena erros se existirem

4. **Deduplicação**
   - Compara por: `userId`, `date`, `amount`, `description`, `type`
   - Se duplicada → salva como `ImportTransactionPreview` com status `DUPLICATE`
   - Se erro → `ERROR`
   - Se válida → cria `Transaction`

5. **Resumo**

```ts
{
  success: true,
  importSessionId: string,
  importedCount: number,
  duplicateCount: number,
  errorCount: number
}
```

---

## 🖼 3. Interface de Importação

### Rota:

`/importar`

### Funcionalidades:

- Upload de arquivo `.csv` ou `.xlsx`
- Pré-visualização das primeiras linhas
- Feedback ao usuário:
  - Transações importadas
  - Duplicadas pendentes
  - Erros encontrados

---

## 📚 4. Histórico de Importações

### Rota:

`/importacoes`

- Lista de sessões:
  - Data
  - Nome do arquivo
  - Importadas, Duplicadas, Erros

### Rota:

`/importacoes/[id]`

- Exibe detalhes da sessão:
  - Transações criadas
  - Erros por linha
  - Transações duplicadas com ações:

| Ação      | Efeito                                      |
| --------- | ------------------------------------------- |
| Ignorar   | Marca como resolvida, não adiciona          |
| Adicionar | Cria nova `Transaction`, marca como resolvida |

---

## 📤 5. Exportador de Transações

### Rota:

`/exportar`

### Ação:

`app/_actions/exportarTransacoes.ts`

### Funcionalidades:

- Exportar CSV: `DATA`, `DESCRIÇÃO`, `VALOR`, `CATEGORIA`, `STATUS`
- Despesas → valor negativo
- Filtros opcionais:
  - Período (`de`, `até`)
  - Status

---

## ⏰ 6. Cron Job – Transações Agendadas

### Ferramenta:

Supabase Edge Function (agendada diariamente)

### Lógica:

- Buscar transações com:
  - `status = SCHEDULED`
  - `scheduledAt <= hoje`

- Para cada:
  - Atualiza para `COMPLETED`
  - Define `processedAt`
  - Envia notificação ao usuário

---

## 🔐 Requisitos Técnicos e de UX

| Área            | Requisitos                                              |
| --------------- | ------------------------------------------------------- |
| Monetário       | Armazenar valores como centavos (`Int`)                 |
| Deduplicação    | Comparação por userId, data, valor, descrição e tipo    |
| Histórico       | Tela de sessões com detalhes e ações sobre duplicados   |
| Controle manual | Usuário pode ignorar ou forçar importação de duplicadas |
| Segurança       | Validação e sanitização dos dados                       |
| Performance     | Inserção em lote e controle de tamanho de arquivo       |
