const { expect } = require('@playwright/test');

class UsersPage {
  constructor(page) {
    this.page = page;
    this.userPage = page.locator("a[href*='users']").first();
    this.emailField = page.locator("input[type='email']");
    this.inviteLangSelect = page.locator("#invitation-language mat-select");
    this.inviteLang = page.locator("mat-option").filter({ hasText: /English \(US\)/i }).first();
    this.sendBtn = page.locator("#send-btn");
    this.awaitingMsg = page.locator("#guest .mat-column-name");
  }

  async inviteUser(email = "abc@gmail.com") {
    const currentUrl = this.page.url();
    const match = currentUrl.match(/\/projects\/([a-f0-9]+)/);
    const projectId = match ? match[1] : null;

    if (projectId && currentUrl.match(/\/projects\/[a-f0-9]+\/users\/?$/)) {
      // Already on users page
    } else if (projectId) {
      await this.page.goto(`/projects/${projectId}/users`);
    } else {
      await this.userPage.waitFor({ state: "visible", timeout: 45000 });
      await this.userPage.click();
    }

    await this.page.waitForURL(/.*\/users/, { timeout: 45000 });
    await expect(this.page.locator("h1")).toHaveText("Users", { timeout: 25000 });

    await this.emailField.waitFor({ state: "visible", timeout: 15000 });
    await this.emailField.fill(email);

    // Click mat-select with force:true to avoid pointer interception from floating mat-label
    await this.inviteLangSelect.waitFor({ state: "visible", timeout: 15000 });
    await this.inviteLangSelect.click({ force: true });

    await this.inviteLang.waitFor({ state: "visible", timeout: 10000 });
    await this.inviteLang.click();

    await expect(this.sendBtn).toBeEnabled({ timeout: 10000 });
    await this.sendBtn.click();
  }
}

module.exports = UsersPage;
