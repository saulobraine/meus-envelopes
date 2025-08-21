/**
 * Mocks para Next.js
 *
 * Este arquivo resolve problemas com módulos do Next.js
 * que não são compatíveis com o ambiente de teste do Jest.
 */

// Mock do next/cache
export const revalidatePath = jest.fn();
export const revalidateTag = jest.fn();
export const unstable_cache = jest.fn();

// Mock do next/headers
export const headers = jest.fn(() => new Map());
export const cookies = jest.fn(() => ({
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  getAll: jest.fn(),
}));

// Mock do next/server
export const NextRequest = jest.fn();
export const NextResponse = {
  json: jest.fn(),
  redirect: jest.fn(),
  next: jest.fn(),
};

// Mock do next/navigation
export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}));

export const usePathname = jest.fn(() => "/");
export const useSearchParams = jest.fn(() => new URLSearchParams());
