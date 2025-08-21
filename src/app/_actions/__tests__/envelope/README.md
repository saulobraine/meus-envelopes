# Testes Unitários - Fluxos de Envelope

Este diretório contém todos os testes unitários para os fluxos de envelope da aplicação "meus ENVELOPES".

## 📁 Estrutura dos Testes

```
envelope/
├── README.md                 # Esta documentação
├── setup.ts                  # Configurações e utilitários compartilhados
├── index.test.ts            # Arquivo principal que executa todos os testes
├── create.test.ts           # Testes para criação de envelopes
├── get.test.ts              # Testes para busca de envelopes
├── update.test.ts           # Testes para atualização de envelopes
├── remove.test.ts           # Testes para remoção de envelopes
├── utils.test.ts            # Testes para validações e utilitários
├── edge-cases.test.ts       # Testes para casos de borda
└── integration.test.ts      # Testes de integração
```

## 🚀 Como Executar os Testes

### Executar todos os testes de envelope
```bash
npm test -- src/app/_actions/__tests__/envelope/
```

### Executar um arquivo específico
```bash
npm test -- src/app/_actions/__tests__/envelope/create.test.ts
```

### Executar com coverage
```bash
npm test -- --coverage src/app/_actions/__tests__/envelope/
```

### Executar em modo watch
```bash
npm test -- --watch src/app/_actions/__tests__/envelope/
```

## 🧪 Tipos de Teste

### 1. Testes Unitários
- **create.test.ts**: Testa a criação de envelopes
- **get.test.ts**: Testa a busca e listagem de envelopes
- **update.test.ts**: Testa a atualização de envelopes
- **remove.test.ts**: Testa a remoção de envelopes

### 2. Testes de Validação
- **utils.test.ts**: Testa schemas de validação, formatação de dados e regras de negócio

### 3. Testes de Casos de Borda
- **edge-cases.test.ts**: Testa cenários extremos, dados inválidos e situações especiais

### 4. Testes de Integração
- **integration.test.ts**: Testa fluxos completos e interações entre operações

## 🔧 Configurações

### Setup Compartilhado (`setup.ts`)
- Configurações globais para testes
- Utilitários para criação de dados de teste
- Funções de validação compartilhadas
- Constantes e mensagens de erro padrão

### Configurações de Teste
- Timeouts configuráveis por ambiente
- Configurações para CI/CD vs desenvolvimento local
- Retry policies para testes instáveis

## 📊 Cobertura de Testes

Os testes cobrem:

### Funcionalidades Principais
- ✅ Criação de envelopes (create)
- ✅ Busca de envelopes (get)
- ✅ Atualização de envelopes (update)
- ✅ Remoção de envelopes (remove)

### Validações
- ✅ Schema de validação Zod
- ✅ Validação de tipos de dados
- ✅ Validação de regras de negócio
- ✅ Tratamento de dados inválidos

### Segurança
- ✅ Autenticação de usuário
- ✅ Isolamento de dados por usuário
- ✅ Verificação de permissões
- ✅ Proteção contra acesso não autorizado

### Casos de Borda
- ✅ Valores extremos (muito grandes, negativos, zero)
- ✅ Nomes com caracteres especiais
- ✅ Falhas de banco de dados
- ✅ Concorrência e estados inconsistentes

### Integração
- ✅ Fluxos CRUD completos
- ✅ Interações entre operações
- ✅ Consistência de dados
- ✅ Revalidação de cache

## 🎯 Cenários de Teste

### Cenários de Sucesso
- Criação de envelope com dados válidos
- Busca de envelopes do usuário e globais
- Atualização de envelope existente
- Remoção de envelope deletável

### Cenários de Erro
- Tentativa de criar envelope duplicado
- Usuário não autenticado
- Dados de entrada inválidos
- Operações em envelopes inexistentes

### Cenários de Borda
- Valores monetários extremos
- Nomes de envelope muito longos
- Falhas intermitentes de banco
- Mudanças de estado durante operações

## 🔍 Mocks e Dependências

### Dependências Mockadas
- `@/lib/prisma`: Cliente Prisma para operações de banco
- `@/lib/supabase/server`: Autenticação de usuário
- `next/cache`: Revalidação de cache

### Estrutura de Mocks
```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    envelope: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
```

## 📝 Padrões de Teste

### Nomenclatura
- Descrever o comportamento esperado
- Usar português para descrições
- Seguir padrão: "deve [ação] quando [condição]"

### Estrutura
```typescript
describe('Nome da Funcionalidade', () => {
  beforeEach(() => {
    // Setup comum
  });

  it('deve executar ação esperada', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Assertions
- Verificar chamadas de mock
- Validar dados retornados
- Testar tratamento de erros
- Verificar efeitos colaterais (revalidação de cache)

## 🚨 Tratamento de Erros

### Erros Esperados
- Validação de dados
- Autenticação falhada
- Conflitos de negócio
- Falhas de banco de dados

### Verificações de Erro
```typescript
await expect(operation()).rejects.toThrow('Mensagem esperada');
expect(mockFunction).not.toHaveBeenCalled();
```

## 🔄 Revalidação de Cache

### Verificações
- Cache revalidado após operações de sucesso
- Cache não revalidado após falhas
- Caminho correto revalidado (`/dashboard`)

## 📈 Métricas de Qualidade

### Indicadores
- Cobertura de código > 90%
- Tempo de execução < 5 segundos
- Taxa de sucesso > 95%
- Zero testes flaky

### Relatórios
- Coverage report em HTML
- Test results em console
- Failures detalhados com stack traces

## 🛠️ Manutenção

### Adicionando Novos Testes
1. Criar arquivo `.test.ts` seguindo padrão existente
2. Importar no `index.test.ts`
3. Adicionar documentação aqui
4. Executar testes para verificar

### Atualizando Testes Existentes
1. Manter compatibilidade com mudanças de API
2. Atualizar mocks conforme necessário
3. Verificar cobertura após mudanças
4. Executar suite completa

### Debugging
- Usar `console.log` temporariamente
- Executar testes individuais
- Verificar configurações de Jest
- Validar imports e mocks

## 📚 Recursos Adicionais

### Documentação
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Next.js Testing](https://nextjs.org/docs/testing)

### Ferramentas
- Jest DevTools para debugging
- Coverage reports para análise
- Test runners para execução paralela

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Mantenedor**: Equipe de Desenvolvimento
