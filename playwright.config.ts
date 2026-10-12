import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

// BASE_URL on antud siis, kui testitakse juba avaldatud versiooni (Verceli eelvaade või avalik pood).
// Siis kohalikku serverit ei käivitata.
const externalUrl = process.env.BASE_URL;
// Verceli eelvaated võivad olla kaitstud; „Protection Bypass for Automation” saladus laseb testid läbi.
const vercelBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // CI-s kirjutatakse ka JSON-aruanne, millest .github/scripts/toendid.mjs koostab PR-i tõendid.
  reporter: process.env.CI ? [['github'], ['list'], ['json', { outputFile: 'reports/e2e.json' }]] : 'list',
  use: {
    baseURL: externalUrl ?? `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    ...(vercelBypass && {
      extraHTTPHeaders: {
        'x-vercel-protection-bypass': vercelBypass,
        'x-vercel-set-bypass-cookie': 'true',
      },
    }),
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobiil', use: { ...devices['Pixel 7'] } },
  ],
  // Testib tootmisversiooni, mitte arendusserverit.
  webServer: externalUrl
    ? undefined
    : {
        command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
