import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/mobile',
  testIgnore: 'maraton.spec.ts',
  workers: 1,
  timeout: 120000,
  use: { baseURL: 'http://127.0.0.1:4173', hasTouch: true, isMobile: true, trace: 'retain-on-failure', launchOptions: { channel: 'chrome' } },
  projects: [360, 375, 390, 430].map((width, i) => ({ name: `${width}px`, use: { viewport: { width, height: [800, 812, 844, 932][i] } } })),
  webServer: { command: 'npm run preview -- --host 127.0.0.1', port: 4173, reuseExistingServer: true },
});
