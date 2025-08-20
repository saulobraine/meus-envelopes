// Configurações globais do sistema
export const APP_CONFIG = {
  // Configurações de paginação
  PAGINATION: {
    ITEMS_PER_PAGE: 30,
  },
  
  // Configurações de importação
  IMPORT: {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    SUPPORTED_FORMATS: ['csv', 'xlsx', 'xls'],
  },
  
  // Configurações de transações
  TRANSACTIONS: {
    DEFAULT_CURRENCY: 'BRL',
    DATE_FORMATS: ['d/m/Y', 'd-m-Y', 'd.m.Y', 'Y-m-d'],
  },
  
  // Configurações de envelopes
  ENVELOPES: {
    DEFAULT_GLOBAL_NAME: 'Remuneração',
  },
} as const;

// Tipos para as configurações
export type AppConfig = typeof APP_CONFIG;
export type PaginationConfig = typeof APP_CONFIG.PAGINATION;
export type ImportConfig = typeof APP_CONFIG.IMPORT;
export type TransactionsConfig = typeof APP_CONFIG.TRANSACTIONS;
export type EnvelopesConfig = typeof APP_CONFIG.ENVELOPES;
