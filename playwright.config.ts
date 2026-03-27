import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  globalSetup: './test/e2e/global-setup.ts',
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: 'playwright-report' }],
        ['github'],
        ['junit', { outputFile: 'test-results/e2e-junit.xml' }],
      ]
    : [['html', { open: 'never' }]],
  outputDir: './test-results/e2e',
  maxFailures: 1, // Stop on first failure

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // Always use preview server for reliable content database
    // In CI, build is done separately; locally, build if needed
    command: process.env.CI ? 'pnpm preview' : 'pnpm build && pnpm preview',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180000, // 3 min for build + preview
  },
});
