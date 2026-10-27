const { test } = require('../../fixtures/baseTest');
const fs = require('fs');

test("authenticate as admin", async ({ browser, page, loginPage }) => {
  // If a storage state exists, verify if it is still valid before skipping
  if (fs.existsSync(".auth/sf-admin.json") && fs.statSync(".auth/sf-admin.json").size > 100) {
    const testContext = await browser.newContext({ storageState: '.auth/sf-admin.json' });
    const testPage = await testContext.newPage();
    const baseUrl = process.env.BASE_URL || 'https://qa.scriptureforge.org/';
    const projectsUrl = new URL('/projects', baseUrl).toString();

    try {
      console.log(`Validating restored session directly at ${projectsUrl}...`);
      await testPage.goto(projectsUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });

      // If session is valid, we will be on /projects and the dashboard header or avatar will appear
      await testPage.waitForURL(url => url.pathname.includes('/projects'), { timeout: 25000 });
      await testPage.locator('.content h1, button img[alt], button .avatar, app-projects').first().waitFor({ state: 'visible', timeout: 25000 });

      console.log("Restored auth session is valid! Skipping interactive login.");
      await testContext.close();
      return;
    } catch (e) {
      console.log(`Restored session validation failed (current URL: ${testPage.url()}, error: ${e.message}). Performing fresh login with credentials and TOTP...`);
      await testContext.close();
    }
  } else {
    console.log("No valid .auth/sf-admin.json found. Performing fresh login with credentials and TOTP...");
  }

  // Allow up to 120 seconds for fresh Paratext + Google 2FA login
  test.setTimeout(120000);

  if (!process.env.SF_EMAIL || !process.env.SF_PASSWORD) {
    throw new Error("Missing SF_EMAIL or SF_PASSWORD environment variables! Please configure them in GitHub Secrets or .env file.");
  }

  await loginPage.goto();
  await loginPage.loginWithParatext(process.env.SF_EMAIL, process.env.SF_PASSWORD);
  await loginPage.verifyLoggedIn();

  await page.context().storageState({
    path: ".auth/sf-admin.json",
  });
  console.log("Fresh session state saved to .auth/sf-admin.json successfully.");
});
