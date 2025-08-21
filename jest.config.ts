import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  // Add more setup options before each test
  setupFilesAfterEnv: ["<rootDir>/src/test-utils/setup.ts"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "ts-jest",
      {
        // Use Babel for transpilation if you have a babel.config.js
        // If not, ts-jest will handle it.
        // For Next.js, it's common to use Babel.
        // If you have a babel.config.js, ts-jest will use it automatically.
      },
    ],
  },
  // Ignore paths that are not relevant for testing
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

  // Transform ignore patterns for ES modules
  transformIgnorePatterns: [
    "node_modules/(?!(isows|@supabase|@supabase-js|@supabase/realtime-js|@supabase/ssr)/)",
  ],

  // Mock modules that cause ESM issues
  moduleNameMapper: {
    // Handle module aliases
    "@/lib/(.*)": "<rootDir>/src/lib/$1",
    "@/components/(.*)": "<rootDir>/src/components/$1",
    "@/app/(.*)": "<rootDir>/src/app/$1",
    "@/hooks/(.*)": "<rootDir>/src/hooks/$1",
    "@/emails/(.*)": "<rootDir>/src/emails/$1",

    // Mock Supabase modules
    "^@supabase/supabase-js$": "<rootDir>/src/test-utils/supabase-mocks.ts",
    "^@supabase/ssr$": "<rootDir>/src/test-utils/supabase-mocks.ts",
    "^@supabase/realtime-js$": "<rootDir>/src/test-utils/supabase-mocks.ts",
    "^@supabase/storage-js$": "<rootDir>/src/test-utils/supabase-mocks.ts",
    "^@supabase/auth-helpers-nextjs$":
      "<rootDir>/src/test-utils/supabase-mocks.ts",
    "^@supabase/auth-helpers-react$":
      "<rootDir>/src/test-utils/supabase-mocks.ts",
    "^@supabase/auth-ui-react$": "<rootDir>/src/test-utils/supabase-mocks.ts",
    "^@supabase/auth-ui-shared$": "<rootDir>/src/test-utils/supabase-mocks.ts",

    // Mock Next.js modules that cause issues
    "^next/cache$": "<rootDir>/src/test-utils/next-mocks.ts",
    "^next/headers$": "<rootDir>/src/test-utils/next-mocks.ts",
    "^next/server$": "<rootDir>/src/test-utils/next-mocks.ts",

    // Mock Supabase server modules
    "^@/lib/supabase/server$":
      "<rootDir>/src/test-utils/supabase-server-mocks.ts",
    "^@/lib/supabase/client$": "<rootDir>/src/test-utils/supabase-mocks.ts",
  },
  // If you have a specific file for global setup, uncomment the line below
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

// createJestConfig is exported this way to ensure it works in production
export default createJestConfig(config);
