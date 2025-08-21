# Mocks Compartilhados para Testes

Este diretório contém mocks e utilitários compartilhados que podem ser reutilizados em diferentes suites de teste, seguindo os princípios de DRY (Don't Repeat Yourself) e facilitando a manutenção dos testes.

## 📁 Estrutura

```
shared/
├── README.md           # Esta documentação
├── index.ts            # Arquivo principal que exporta todos os mocks
├── auth.ts             # Mocks e utilitários de autenticação
├── prisma.ts           # Mocks e utilitários do Prisma
└── next-cache.ts       # Mocks e utilitários do Next.js cache
```

## 🎯 Benefícios da Estrutura Compartilhada

### 1. **Reutilização de Código**
- Mocks definidos uma vez, usados em múltiplos testes
- Utilitários padronizados para cenários comuns
- Configurações centralizadas

### 2. **Manutenibilidade**
- Mudanças em um local afetam todos os testes
- Padrões consistentes em toda a aplicação
- Fácil atualização de dependências

### 3. **Legibilidade**
- Testes mais limpos e focados na lógica de negócio
- Menos código boilerplate nos arquivos de teste
- Intenção clara através de nomes descritivos

### 4. **Flexibilidade**
- Configuração de cenários de teste através de funções
- Suporte a diferentes ambientes (test, CI, local)
- Políticas de retry e timeout configuráveis

## 🔧 Mocks Disponíveis

### Autenticação (`auth.ts`)
```typescript
import { 
  setupAuthenticatedUser, 
  setupUnauthenticatedUser,
  TEST_USERS 
} from "../shared/auth";

// Configurar usuário autenticado
setupAuthenticatedUser();

// Configurar usuário não autenticado
setupUnauthenticatedUser();

// Usar usuários padrão
setupAuthenticatedUser(TEST_USERS.ADMIN);
```

### Prisma (`prisma.ts`)
```typescript
import { 
  setupPrismaSuccess,
  setupPrismaFailure,
  setupPrismaNull,
  expectPrismaOperationWasCalled
} from "../shared/prisma";

// Configurar operação de sucesso
setupPrismaSuccess('envelope', 'create', { id: '123' });

// Configurar operação de falha
setupPrismaFailure('envelope', 'create', 'Database error');

// Configurar retorno nulo
setupPrismaNull('envelope', 'findFirst');

// Validar chamadas
expectPrismaOperationWasCalled('envelope', 'create');
```

### Next.js Cache (`next-cache.ts`)
```typescript
import { 
  expectCacheWasRevalidated,
  expectCacheWasRevalidatedWithPath
} from "../shared/next-cache";

// Validar revalidação
expectCacheWasRevalidated();

// Validar revalidação com caminho específico
expectCacheWasRevalidatedWithPath('/dashboard');
```

## 🚀 Como Usar

### 1. **Importar Mocks Necessários**
```typescript
import { 
  setupAuthenticatedUser,
  setupPrismaSuccess,
  expectCacheWasRevalidated
} from "../shared";
```

### 2. **Configurar Cenário de Teste**
```typescript
beforeEach(() => {
  setupAuthenticatedUser();
  setupPrismaSuccess('envelope', 'findFirst', null);
  setupPrismaSuccess('envelope', 'create', {});
});
```

### 3. **Executar Teste**
```typescript
it('deve criar envelope com sucesso', async () => {
  await create(mockFormData);
  
  expectPrismaOperationWasCalled('envelope', 'create');
  expectCacheWasRevalidatedWithPath('/dashboard');
});
```

## 📋 Cenários de Teste Pré-configurados

### Cenário Padrão
```typescript
import { setupDefaultTestScenario } from "../shared";

beforeEach(() => {
  setupDefaultTestScenario();
});
```

### Cenário de Falha
```typescript
import { setupFailureTestScenario } from "../shared";

beforeEach(() => {
  setupFailureTestScenario();
});
```

### Cenário de Falha Intermitente
```typescript
import { setupIntermittentFailureTestScenario } from "../shared";

beforeEach(() => {
  setupIntermittentFailureTestScenario();
});
```

## 🔄 Gerenciamento de Estado

### Limpar Mocks
```typescript
import { clearAllSharedMocks } from "../shared";

afterEach(() => {
  clearAllSharedMocks();
});
```

### Resetar Mocks
```typescript
import { resetAllSharedMocks } from "../shared";

beforeEach(() => {
  resetAllSharedMocks();
});
```

### Restaurar Mocks
```typescript
import { restoreAllSharedMocks } from "../shared";

afterAll(() => {
  restoreAllSharedMocks();
});
```

## 🌍 Configuração de Ambiente

### Ambiente de Teste
```typescript
import { setupTestEnvironment } from "../shared";

beforeAll(() => {
  setupTestEnvironment('test'); // Padrão
});
```

### Ambiente CI
```typescript
import { setupTestEnvironment } from "../shared";

beforeAll(() => {
  setupTestEnvironment('ci');
});
```

### Ambiente Local
```typescript
import { setupTestEnvironment } from "../shared";

beforeAll(() => {
  setupTestEnvironment('local');
});
```

## 📊 Configurações Disponíveis

### Timeouts
- **Unit**: 5 segundos
- **Integration**: 10 segundos  
- **E2E**: 30 segundos

### Políticas de Retry
- **Max Attempts**: 3
- **Backoff Delay**: 1 segundo

### Mensagens de Erro Padrão
- Autenticação
- Banco de dados
- Cache
- Validação

## 🛠️ Extensibilidade

### Adicionar Novo Mock
1. Criar arquivo em `shared/`
2. Implementar funções de mock
3. Exportar no `index.ts`
4. Documentar uso

### Adicionar Novo Cenário
1. Criar função de configuração
2. Adicionar ao `index.ts`
3. Documentar parâmetros
4. Exemplo de uso

### Adicionar Nova Validação
1. Implementar função de expect
2. Adicionar ao arquivo apropriado
3. Documentar comportamento
4. Exemplo de uso

## 📝 Exemplos de Uso

### Teste Simples
```typescript
import { setupAuthenticatedUser, setupPrismaSuccess } from "../shared";

describe('Operação Simples', () => {
  beforeEach(() => {
    setupAuthenticatedUser();
    setupPrismaSuccess('model', 'operation', {});
  });

  it('deve executar com sucesso', async () => {
    // Teste aqui
  });
});
```

### Teste com Múltiplos Cenários
```typescript
import { setupAuthTestScenario } from "../shared";

describe('Múltiplos Cenários', () => {
  it('deve funcionar com usuário autenticado', () => {
    setupAuthTestScenario('success');
    // Teste aqui
  });

  it('deve falhar com usuário não autenticado', () => {
    setupAuthTestScenario('failure');
    // Teste aqui
  });
});
```

### Teste de Integração
```typescript
import { setupDefaultTestScenario } from "../shared";

describe('Integração', () => {
  beforeEach(() => {
    setupDefaultTestScenario();
  });

  it('deve executar fluxo completo', async () => {
    // Teste de integração aqui
  });
});
```

## 🚨 Boas Práticas

### 1. **Sempre Limpar Estado**
```typescript
afterEach(() => {
  clearAllSharedMocks();
});
```

### 2. **Usar Cenários Pré-configurados**
```typescript
// ✅ Bom
beforeEach(() => {
  setupDefaultTestScenario();
});

// ❌ Evitar
beforeEach(() => {
  // Configuração manual repetitiva
});
```

### 3. **Validar Comportamento Esperado**
```typescript
// ✅ Bom
expectPrismaOperationWasCalled('envelope', 'create');
expectCacheWasRevalidatedWithPath('/dashboard');

// ❌ Evitar
expect(mockFunction).toHaveBeenCalled();
```

### 4. **Documentar Cenários Complexos**
```typescript
/**
 * Testa cenário de falha intermitente do banco
 * com retry automático após 2 falhas
 */
it('deve lidar com falhas intermitentes', async () => {
  setupIntermittentFailureTestScenario();
  // Teste aqui
});
```

## 🔍 Debugging

### Verificar Estado dos Mocks
```typescript
import { mockPrismaClient } from "../shared/prisma";

console.log('Mock calls:', mockPrismaClient.envelope.create.mock.calls);
```

### Verificar Configuração
```typescript
import { GLOBAL_TEST_CONFIG } from "../shared";

console.log('Config:', GLOBAL_TEST_CONFIG);
```

### Logs de Mock
```typescript
// Ativar logs detalhados
jest.spyOn(console, 'log').mockImplementation(() => {});
```

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Mantenedor**: Equipe de Desenvolvimento
