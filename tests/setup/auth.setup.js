const { test, expect } = require("@playwright/test");

//const authFile = ".auth/sf-admin.json";

test("authenticate as admin", async ({ page }) => {

    await page.goto("https://qa.scriptureforge.org");
   

    await expect(page).toHaveTitle("Scripture Forge QA");

    await page.getByText("Log In").first().click();

    await page.getByText("Log in with Paratext").click();

    await page.locator("#email").fill(process.env.SF_EMAIL);

    await page.locator("button.login-button").first().click();

    await page.getByText("Next").first().waitFor({
        state: "visible",
        timeout: 35000
    });

    await page.getByText("Next").first().click();

    await page.locator("#password input").fill(process.env.SF_PASSWORD);

    await page.getByText("Next").first().click();

    await expect(page.locator(".content h1"))
        .toHaveText("My projects");

    await page.context().storageState({
        path: ".auth/sf-admin.json"
    });
});