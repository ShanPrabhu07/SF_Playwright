const {test,expect}=require("@playwright/test");

class UsersPage{

    constructor(page){

          this.page=page;
          this.userPage= page.locator("[href*='users']");
          this.emailField=page.locator("[type='email']");
          this.inviteLangField=page.getByText("Invitation language");
          this.inviteLang=page.getByText(" English (US) ");
          this.sendBtn=page.locator("#send-btn");
          this.awaitingMsg=page.locator("#guest .mat-column-name");
    }

    async inviteUser(){

        await this.userPage.waitFor({ state: "visible", timeout: 45000 });
        await this.userPage.click();
       // await this.page.waitForLoadState('networkidle');
        await this.page.waitForURL(/.*\/users/, { timeout: 45000 });
        await expect(this.page.locator("h1")).toHaveText("Users", { timeout: 25000 });
        await this.emailField.fill("abc@gmail.com");
        await this.inviteLangField.click();
        await this.inviteLang.click();
        await this.sendBtn.click();
        // await expect(this.awaitingMsg).toHaveText("Awaiting response from abc@gmail.com");

    }


}

module.exports=UsersPage;