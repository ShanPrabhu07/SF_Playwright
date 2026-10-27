import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

const environment = process.env.ENV || 'qa';
dotenv.config({ path: path.resolve(__dirname, `config/env/.env.${environment}`) });

export default defineConfig({
  testDir: './tests',
  retries: process.env.CI ? 0 : 0, // 0 retries in CI for fast feedback (no 10-minute retry stalls)
  timeout: 180 * 1000, // 180 seconds (3 minutes) timeout per test to allow for Paratext project sync
  workers: 1,
  reporter: [
    ['line'],
    ['html', { outputFolder: 'playwright-report' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
    },
    {
      name: 'chromium',
      use: {
        storageState: '.auth/sf-admin.json',
      },
      dependencies: ['setup'],
    },
  ],

  expect: {
    timeout: 30 * 1000,
  },

  use: {
    baseURL: process.env.BASE_URL || 'https://qa.scriptureforge.org/',
    channel: process.env.CI ? undefined : 'chrome',
    headless: process.env.CI ? true : false,
    viewport: process.env.CI ? { width: 1920, height: 1080 } : null,
    launchOptions: {
      args: process.env.CI ? [] : ['--start-maximized'],
    },
    trace: 'retain-on-failure',
    video: 'on',
    screenshot: 'only-on-failure',
    navigationTimeout: 60_000,
  },
});
