/**
 * Mocks para supabase/server.ts
 *
 * Este arquivo intercepta as importações do supabase/server.ts
 * para evitar problemas com módulos ESM.
 */

import { mockSupabaseServer, mockAuth } from "./supabase-mocks";

// Mock da função createClient
export const createClient = jest.fn(() => mockSupabaseServer);

// Mock da função getAuthenticatedUser
export const getAuthenticatedUser = jest.fn(() =>
  Promise.resolve({ user: mockAuth.user })
);

// Mock da função createServerClient
export const createServerClient = jest.fn(() => mockSupabaseServer);
