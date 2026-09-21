const { test, expect } = require("@playwright/test");



class OpenProject{

    constructor(page){

        this.page=page;
        this.loginBtn= page.locator("text=Log In").first();
        this.loginWithParatextBtn=page.locator("text=Log in with Paratext");
        this.emailField=page.locator("#email");
        this.submitBtn=page.locator("button.login-button").first();
        this.nextBtn=page.locator("text=Next").first();
        this.pwdField=page.locator("#password input");
        this.header=page.locator(".content h1");
        this.connectProjectHeading=page.locator("[id*='user-connected-project-card']").first();
        this.projectName=page.locator("text=  - EnglishToTamil ");
    }





async openProject(){

          await this.page.goto("/");

await this.connectProjectHeading.waitFor();

await this.projectName.waitFor({state: "visible",timeout:15000});

await this.page.locator("mat-card").filter({hasText:'  - EnglishToTamil '}).click();

await this.page.locator("span.project-name").waitFor({state:"visible",timeout:15000});

await expect(this.page.locator("div.tab-header-content ").filter({hasText:' ETL '})).toHaveText('book ETL ');
}



}

module.exports = OpenProject;