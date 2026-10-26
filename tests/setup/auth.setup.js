const { test } = require('../../fixtures/baseTest');
const fs = require('fs');

test("authenticate as admin", async ({ browser, page, loginPage }) => {
  // If a storage state exists, verify if it is still valid before skipping
  if (fs.existsSync(".auth/sf-admin.json") && fs.statSync(".auth/sf-admin.json").size > 100) {
    const testContext = await browser.newContext({ storageState: '.auth/sf-admin.json' });
    const testPage = await testContext.newPage();
    try {
      await testPage.goto(process.env.BASE_URL || 'https://qa.scriptureforge.org/', { timeout: 20000 });
      await testPage.waitForURL(/projects/, { timeout: 10000 });
      console.log("Restored auth session is valid! Skipping login.");
      await testContext.close();
      return;
    } catch (e) {
      console.log("Restored session expired or invalid. Performing fresh login with credentials and TOTP...");
      await testContext.close();
    }
  }

  // Allow up to 90 seconds for fresh login with Google 2FA
  test.setTimeout(90000);

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
