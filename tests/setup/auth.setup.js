const { test } = require('../../fixtures/baseTest');
const fs = require('fs');

test("authenticate as admin", async ({ page, loginPage }) => {
  // If a storage state exists, verify if it is still valid before skipping
  if (fs.existsSync(".auth/sf-admin.json") && fs.statSync(".auth/sf-admin.json").size > 100) {
    try {
      await loginPage.goto();
      await loginPage.verifyLoggedIn();
      console.log("Restored auth session is valid! Skipping login.");
      return;
    } catch (e) {
      console.log("Restored session expired or invalid. Performing fresh login with credentials and TOTP...");
    }
  }

  if (!process.env.SF_EMAIL || !process.env.SF_PASSWORD) {
    throw new Error("Missing SF_EMAIL or SF_PASSWORD environment variables! Please configure them in GitHub Secrets or .env file.");
  }

  await loginPage.goto();
  await loginPage.loginWithParatext(process.env.SF_EMAIL, process.env.SF_PASSWORD);
  await loginPage.verifyLoggedIn();

  await page.context().storageState({
    path: ".auth/sf-admin.json",
  });
});
