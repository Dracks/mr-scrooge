import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./config/setupTests.js'],
    include: ['**/*.spec.tsx', '**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'cobertura'],
      reportsDirectory: './coverage/react-view',
    },
  },
});