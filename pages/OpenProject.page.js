const { expect } = require('@playwright/test');

class OpenProject {
  constructor(page) {
    this.page = page;
    this.notConnectedProjects = page.locator("#header-not-connected-projects");
    this.connectButton = page.locator(".user-unconnected-project").filter({ has: page.locator(".project-name b", { hasText: "ETL" })})
    .getByRole("link", { name: "Connect" });
    this.connectPage = page.getByRole("heading");
    this.connectBtnProjectPage = page.getByRole("button",{name:"Connect"});

    //deleteProject locators

    this.settings = page.locator("a[href*='settings']");
    this.deleteSection = page.getByRole('heading',{level:2});
    this.deleteProjectBtnPage = page.getByRole('button',{name:' Delete this project '});
    this.projectTextBox = page.getByLabel("Project Name");
    this.deleteProjectBtn = page.locator("#project-delete-btn");

  }

        this.page=page;
     /*   this.loginBtn= page.locator("text=Log In").first();
        this.loginWithParatextBtn=page.locator("text=Log in with Paratext");
        this.emailField=page.locator("#email");
        this.submitBtn=page.locator("button.login-button").first();
        this.nextBtn=page.locator("text=Next").first();
        this.pwdField=page.locator("#password input");
        this.header=page.locator(".content h1"); */
        this.connectProjectHeading=page.locator("[id*='user-connected-project-card']").first();
        this.projectName=page.locator("text=  - EnglishToTamil ");
    }
  async openProject() {

    await this.page.goto('/');

    await this.notConnectedProjects.scrollIntoViewIfNeeded();

    await expect(this.notConnectedProjects).toHaveText('Not connected');

    await this.connectButton.waitFor({ state: 'visible', timeout: 30000 });

    await this.connectButton.click();
   
    await this.connectPage.waitFor({state:"visible",timeout:30000});

    await expect(this.connectPage).toHaveText("Connect Paratext Project");

    await  this.connectBtnProjectPage.click();

     await this.page.waitForURL(/\/projects\/[a-f0-9]+/, { timeout: 120000});

    console.log("project connected");

    // Wait for the workspace editor tab to be fully rendered (ensures Angular router is settled)
    await expect(this.page.locator("div#target div.tab-header-content").filter({ hasText: ' ETL ' })).toHaveText('book ETL ', { timeout: 25000 });

  }

  async deleteProject(){

    await this.settings.click();

    await this.deleteSection.scrollIntoViewIfNeeded();

    await this.deleteProjectBtnPage.click();

    await this.projectTextBox.click();

    await this.projectTextBox.fill("EnglishToTamil");

    await this.deleteProjectBtn.click();

  await this.page.waitForURL(/projects$/, { timeout: 30000 });


  }
}

module.exports = OpenProject;
