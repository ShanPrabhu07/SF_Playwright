const { expect } = require('@playwright/test');

class EditPage {
  constructor(page) {
    this.page = page;
    this.editPage = page.locator("#tools-menu-list").filter({ hasText: " Edit & review " });
    this.bookDropdown = page.locator("span.mat-mdc-select-value-text").first();
    this.bookList = page.getByRole("listbox");
    this.verse1 = page.locator('[data-segment="verse_1_1"]');

    // Add SF Note Selectors
    this.SF_AddCmtIcon = page.getByText("add_comment");
    this.SF_NoteDialog = page.locator("mat-dialog-container, [role='dialog'], [id*='mat-mdc-dialog']").first();
    this.SF_CommentField = page.locator("mat-dialog-container textarea, mat-dialog-container input, [id*='mat-input']").first();
    this.SF_SaveBtn = page.getByText('Save');

    // Edit SF Note selectors
    this.SF_NoteIcon = page.locator("display-note");
    this.editBtn = page.locator(".edit-button");

    // Delete SF Note selectors
    this.deleteBtn = page.locator(".delete-button");
    this.deleteDialog = page.getByRole("heading", { level: 2 });
    this.deleteBtnInDialog = page.locator("button.mat-mdc-unelevated-button, mat-dialog-container button").filter({ hasText: /delete/i }).first();

    // History tab
    this.addtabBtn = page.locator("#source app-tab-header[aria-haspopup='menu']");
    this.historyBtn = page.locator("Button").filter({ hasText: "History" });
    this.historyTab = page.locator(".closeable.movable");
    this.historyDropdown = page.locator("[panelclass='history-select-panel']");
    this.previousVersion = page.locator("[role='listbox'] mat-option").nth(1);
    this.restoreThisVersionBtn = page.locator(".revert-history");
    this.restoreDialog = page.getByRole("heading", { level: 2 });
    this.restoreBtn = page.getByRole("button", { name: "Restore", exact: true });
    this.snackBar = page.locator("simple-snack-bar");

    // Resource tab
    this.resourceBtn = page.locator("Button").filter({ hasText: "Resource..." });
    this.resourceDialog = page.locator("app-editor-tab-add-resource-dialog h1");
    this.resourceInput = page.locator("[placeholder='Project or resource']");
    this.resourceList = page.locator("mat-optgroup mat-option").nth(1);
    this.selectBtn = page.getByRole("button", { name: "Select", exact: true });
    this.resourceTab = page.locator("#source app-tab-header").filter({ hasText: " DHH94 " });
  }

  async addTextToBook(verseCount, bookName) {
    const currentUrl = this.page.url();
    const match = currentUrl.match(/\/projects\/([a-f0-9]+)/);
    const projectId = match ? match[1] : null;

    if (projectId && currentUrl.match(/\/projects\/[a-f0-9]+\/translate\/NUM\/1/)) {
      // already on edit page
    } else {
      await this.page.getByRole('link', { name: 'Edit & review' }).click();
      await this.page.waitForLoadState('networkidle');
    }

    // Select Book
    await this.bookDropdown.waitFor({ state: "visible", timeout: 15000 });
    await this.bookDropdown.click({ force: true });
    await this.bookList.waitFor({ state: "visible", timeout: 25000 });
    await this.page.getByRole("option").filter({ hasText: bookName }).click();

    // Add text verse-by-verse using real keyboard typing (Quill requires typing events, NOT fill)
    for (let i = 1; i <= verseCount; i++) {
      const verseLocator = this.page.locator(`#target-text-area [data-segment="verse_1_${i}"]`);
      await verseLocator.waitFor({ state: "visible", timeout: 15000 });
      await verseLocator.click();
      await this.page.keyboard.type(`verse${i} data `);
    }
  }

  async verifyAddedText(verseCount) {
    // Wait for ShareDB WebSocket debounced auto-save to commit to the server
    await this.page.waitForTimeout(3000);

    // Reload page to verify persistence from server
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');

    // Assert that the text persisted after page refresh
    for (let i = 1; i <= verseCount; i++) {
      const verseLocator = this.page.locator(`#target-text-area [data-segment="verse_1_${i}"]`);
      await expect(verseLocator).toContainText(`verse${i} data`);
      console.log(`Verse ${i} content after reload:`, await verseLocator.textContent());
    }
  }

  async addSF_Note(bookName) {
    await this.page.getByRole('link', { name: 'Edit & review' }).click();
    await this.page.waitForLoadState('networkidle');

    // Select Book
    await this.bookDropdown.waitFor({ state: "visible", timeout: 15000 });
    await this.bookDropdown.click({ force: true });
    await this.bookList.waitFor({ state: "visible", timeout: 25000 });
    await this.page.getByRole("option").filter({ hasText: bookName }).click();

    // Add SF note
    await this.verse1.click();
    await this.SF_AddCmtIcon.click();
    await expect(this.SF_NoteDialog).toBeVisible({ timeout: 15000 });
    await this.SF_CommentField.fill("Test");
    await this.SF_SaveBtn.click();
  }

  async editSF_Note() {
    await expect(this.SF_NoteIcon).toBeVisible({ timeout: 15000 });
    await this.SF_NoteIcon.click();
    await expect(this.SF_NoteDialog).toBeVisible({ timeout: 15000 });
    await this.editBtn.click();
    await this.SF_CommentField.click();
    await this.SF_CommentField.clear();
    await this.SF_CommentField.fill("Edited text");
    await this.SF_SaveBtn.click();
  }

  async deleteSF_Note() {
    await this.SF_NoteIcon.click();
    await expect(this.SF_NoteDialog).toBeVisible({ timeout: 15000 });
    await this.deleteBtn.click();
    await expect(this.deleteDialog).toHaveText("Permanently delete this comment?", { timeout: 15000 });
    await this.deleteBtnInDialog.click();
    await expect(this.SF_NoteIcon).toBeHidden({ timeout: 15000 });
  }

  async addHistorytab(verseCount) {
    await this.addtabBtn.click();
    await this.historyBtn.click();
    await expect(this.historyTab).toBeVisible({ timeout: 15000 });
    await this.historyDropdown.click();
    await this.previousVersion.click();
    await expect(this.restoreThisVersionBtn).toBeVisible({ timeout: 15000 });
    await this.restoreThisVersionBtn.click();
    await expect(this.restoreDialog).toHaveText("Are you sure you want to restore this chapter to the selected revision?", { timeout: 15000 });
    await this.restoreBtn.click();

    await expect(this.snackBar).toHaveText("Successfully restored previous version", { timeout: 15000 });
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');

    for (let i = 1; i <= verseCount; i++) {
      const verseLocator = this.page.locator(`#target-text-area [data-segment="verse_1_${i}"]`);
      await expect(verseLocator).toContainText(` `);
      console.log(`Verse ${i} content after reload:`, await verseLocator.textContent());
    }
  }

  async addResourceTab() {
    await this.addtabBtn.click();
    await this.resourceBtn.click();
    await expect(this.resourceDialog).toHaveText("Open Resource Tab", { timeout: 15000 });
    await this.resourceInput.click();
    await this.resourceInput.type("DHH94");
    await this.resourceList.click();
    await this.selectBtn.click();
    await expect(this.resourceTab).toBeVisible({ timeout: 15000 });
  }
}

module.exports = EditPage;
