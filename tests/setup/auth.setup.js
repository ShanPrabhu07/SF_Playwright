const {test}= require('../../fixtures/baseTest')

test("authenticate as admin", async ({ page,loginPage }) => {

        await loginPage.goto();
        await loginPage.loginWithParatext(process.env.SF_EMAIL, process.env.SF_PASSWORD);
        await loginPage.verifyLoggedIn();


    await page.context().storageState({
        path: ".auth/sf-admin.json"
    });
});