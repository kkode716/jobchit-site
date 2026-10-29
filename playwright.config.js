import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const bddDir = defineBddConfig({ features: 'features/*.feature', steps: 'features/steps/*.js' });

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:8080' },
  projects: [
    { name: 'bdd', testDir: bddDir },
    { name: 'a11y', testDir: 'tests' },
  ],
  webServer: [
    { command: 'node scripts/serve.mjs _site 8080 /', url: 'http://localhost:8080/', reuseExistingServer: !process.env.CI },
    { command: 'node scripts/serve.mjs _site-sub 8081 /jobchit-site/', url: 'http://localhost:8081/jobchit-site/', reuseExistingServer: !process.env.CI },
  ],
});
