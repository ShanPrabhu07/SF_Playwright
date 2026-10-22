const { test } = require('../../fixtures/baseTest');
const fs = require('fs');

test("authenticate as admin", async ({ page, loginPage }) => {
  // If a valid storage state is already present (e.g. restored from GitHub Secret), skip Google login!
  if (fs.existsSync(".auth/sf-admin.json") && fs.statSync(".auth/sf-admin.json").size > 100) {
    console.log("Using restored auth session from .auth/sf-admin.json. Skipping Google login.");
    return;
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
