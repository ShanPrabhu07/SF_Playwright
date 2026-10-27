const { expect } = require('@playwright/test');

class OpenProject {
  constructor(page) {
    this.page = page;
    this.notConnectedProjects = page.locator("#header-not-connected-projects");
    this.connectButton = page.locator(".user-unconnected-project")
      .filter({ has: page.locator(".project-name b", { hasText: "ETL" }) })
      .getByRole("link", { name: "Connect" });
    this.connectPage = page.getByRole("heading");
    this.connectBtnProjectPage = page.getByRole("button", { name: "Connect" });

    // deleteProject locators
    this.settings = page.locator("a[href*='settings']");
    this.deleteSection = page.getByRole('heading', { level: 2 });
    this.deleteProjectBtnPage = page.getByRole('button', { name: /Delete this project/i });
    this.projectTextBox = page.getByLabel("Project Name");
    this.deleteProjectBtn = page.locator("#project-delete-btn");
  }

  getConnectBtn(projectName) {
    return this.page.locator(".user-unconnected-project")
      .filter({ has: this.page.locator(".project-name b", { hasText: projectName }) })
      .getByRole("link", { name: "Connect" });
  }

  async openProject(projectName = process.env.SF_PROJECT_NAME || 'ETL') {
    await this.page.goto('/');

    // 1. Wait for projects dashboard heading to load
    await this.page.locator('h1, .content h1').filter({ hasText: 'My projects' })
      .waitFor({ state: 'visible', timeout: 30000 });

    // 2. Check if project is already connected in the "Connected" section
    const connectedCard = this.page.locator('.user-connected-project')
      .filter({ hasText: projectName })
      .first();

    const isAlreadyConnected = await connectedCard
      .waitFor({ state: 'attached', timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    if (isAlreadyConnected) {
      console.log(`Project "${projectName}" is already connected. Opening project...`);
      await connectedCard.scrollIntoViewIfNeeded();
      await connectedCard.click();
    } else {
      console.log(`Project "${projectName}" is not connected. Connecting project...`);
      await this.notConnectedProjects.scrollIntoViewIfNeeded();
      await expect(this.notConnectedProjects).toHaveText(/Not connected|Connect a project to get started/i);

      const connectBtn = this.getConnectBtn(projectName);
      await connectBtn.waitFor({ state: 'visible', timeout: 30000 });
      await connectBtn.click();

      await this.connectPage.waitFor({ state: "visible", timeout: 30000 });
      await expect(this.connectPage).toHaveText("Connect Paratext Project");

      await this.connectBtnProjectPage.click();
    }

    await this.page.waitForURL(/\/projects\/[a-f0-9]+/, { timeout: 120000 });
    console.log("project connected");

    // Wait for the workspace navigation to be fully rendered (ensures Angular router is settled)
    await this.page.locator("a[href*='settings'], a[href*='checking'], a[href*='translate']").first().waitFor({ state: 'visible', timeout: 25000 });
  }

  async deleteProject(confirmName = process.env.SF_PROJECT_DELETE_CONFIRM || 'EnglishToTamil') {
    const match = this.page.url().match(/\/projects\/([a-f0-9]+)/);
    if (!match) {
      console.log('Not in project workspace. Skipping project deletion.');
      return;
    }
    const projectId = match[1];

    // Dismiss any open modals or dialogs first so they do not intercept pointer events
    await this.page.keyboard.press('Escape').catch(() => {});

    // Navigate directly to project settings to ensure reliable navigation even if drawer is collapsed
    await this.page.goto(`/projects/${projectId}/settings`);
    await this.page.waitForLoadState('domcontentloaded');

    const deleteBtn = this.page.getByRole('button', { name: /Delete this project/i });
    await deleteBtn.waitFor({ state: 'visible', timeout: 30000 });
    await deleteBtn.scrollIntoViewIfNeeded();
    await deleteBtn.click();

    await this.projectTextBox.waitFor({ state: 'visible', timeout: 15000 });
    await this.projectTextBox.fill(confirmName);

    await this.deleteProjectBtn.waitFor({ state: 'visible', timeout: 10000 });
    await this.deleteProjectBtn.click({ force: true });
    await this.page.waitForURL(url => !url.pathname.includes(projectId), { timeout: 30000 });
  }
}

module.exports = OpenProject;
