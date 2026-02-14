import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env['CI']

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',

  // Global timeout for each test
  timeout: 8 * 1000,

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: isCI,

  // Retry on CI only
  retries: isCI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: 1,

  // Reporter to use
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list']
  ],

  // Shared settings for all projects
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  // Configure projects for major browsers
  projects: [
    // New UI tests (empty until we start building new UI)
    {
      name: 'chromium',
      testMatch: '*.test.ts',
      testIgnore: ['**/legacy/**', '**/visual/**'],
      use: { ...devices['Desktop Chrome'] }
    },
    // Legacy UI tests - run with pnpm test:e2e:legacy
    {
      name: 'legacy',
      testDir: 'e2e/legacy',
      testMatch: '**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Legacy routes are now at /legacy/* prefix
        baseURL: 'http://localhost:5173/legacy'
      }
    },
    // Visual regression testing - single browser for consistency
    {
      name: 'visual',
      testMatch: '**/visual/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Consistent viewport for visual regression
        viewport: { width: 1280, height: 720 }
      }
    }
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !isCI,
    timeout: 120 * 1000
  }
})
