import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: './config/env/.env.qa' });
dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 40 * 1000,
  reporter: [['html', { outputFolder: 'playwright-report' }]],

     projects: [

        {
            name: "setup",
            testMatch: /auth\.setup\.js/,
        },

        {
            name: "chromium",
            use: {
                //browserName: "chromium",
                ...devices["Desktop Chrome"],
                
                 baseURL: "https://qa.scriptureforge.org/",
                 storageState: ".auth/sf-admin.json",
            },

            dependencies: ["setup"]
        }
    ],

    expect:{
      timeout:40*1000,
    },
 
  use: {

    channel: 'chrome',
    headless:false,
    trace:"retain-on-failure",
    screenshot: "only-on-failure",
    navigationTimeout: 120_000,
  },

 
});
