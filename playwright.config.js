import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: './config/env/.env.qa' });

export default defineConfig({
  testDir: './tests',
  timeout: 40 * 1000,
  workers:1,
  reporter: [
    ['line'],
    ['html', { outputFolder: 'playwright-report' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],

     projects: [
        {
            name: "setup",
            testMatch: /auth\.setup\.js/,
        },

        {
            name: "chromium",
            use: {
                viewport: null,
                storageState: ".auth/sf-admin.json",
            },
            dependencies: ["setup"]
        }
    ],

    expect:{
      timeout:40*1000,
    },
 
  use: {
    baseURL: "https://qa.scriptureforge.org/",
    channel: 'chrome',
    headless: false,
    viewport: null,
    launchOptions: {
      args: ['--start-maximized'],
    },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    navigationTimeout: 120_000,
    
  },
});

