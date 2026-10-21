const { test } = require('../../fixtures/baseTest');

test("authenticate as admin", async ({ page, loginPage }) => {
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
