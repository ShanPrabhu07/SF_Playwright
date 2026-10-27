const { expect } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

class AddQuestion {
  constructor(page) {
    this.page = page;
    this.managePage = page.locator("span.mat-mdc-list-item-unscoped-content").filter({ hasText: ' Manage questions ' }).or(page.getByRole('link', { name: /Manage questions/i })).first();

    this.addQuestionBtn = page.locator("button.add-question-button").filter({ visible: true }).first();
    this.startRef = page.locator("#scripture-start input");
    this.endRef = page.locator("#scripture-end input");

    this.questionBox = page.locator("#textarea");
    this.saveBtn = page.locator("#question-save-btn");

    this.bookRow = page.locator("div#text-with-questions-list mat-expansion-panel-header").filter({ hasText: /^Ruth\b/i }).first();
    this.chapterRow = page.locator("div#text-with-questions-list mat-expansion-panel-header").filter({ hasText: /^Ruth 1\b/i }).first();
    this.questionContent = page.locator(".overflow-ellipsis");
    this.createdQuestions = page.locator(".overflow-ellipsis");

    this.startRefDropdown = page.locator(".mat-mdc-form-field-icon-suffix .mdc-icon-button").first();
    this.endRefDropdown = page.locator(".mat-mdc-form-field-icon-suffix .mdc-icon-button").last();
    this.chooseBookdialog = page.locator("[id*=mat-mdc-dialog-title] span, mat-dialog-container h1, mat-dialog-container h2").last();
    this.selectBook = page.locator(".mdc-button, button").filter({ hasText: /^Ruth/i }).first();

    this.ChapterNumber = page.locator("div.mat-mdc-dialog-content button").filter({ hasText: /^2$/ }).or(page.locator("div.mat-mdc-dialog-content button").nth(1)).first();
    this.startVerseNumber = page.locator("div.mat-mdc-dialog-content button").filter({ hasText: /^3$/ }).or(page.locator("div.mat-mdc-dialog-content button").nth(2)).first();
    this.endVerseNumber = page.locator("div.mat-mdc-dialog-content button").filter({ hasText: /^9$/ }).or(page.locator("div.mat-mdc-dialog-content button").nth(6)).first();

    this.ruthBookRow = page.locator("div#text-with-questions-list mat-expansion-panel-header").filter({ hasText: /^Ruth\b/i }).first();
    this.ruthChapterRow = page.locator("div#text-with-questions-list mat-expansion-panel-header").filter({ hasText: /^Ruth 2\b/i }).first();
    this.textContent = page.locator("div.flex").first();

    // export
    this.exportBtn = page.locator("#export-btn");
  }

  async managePageClick() {
    const currentUrl = this.page.url();
    const match = currentUrl.match(/\/projects\/([a-f0-9]+)/);
    const projectId = match ? match[1] : null;

    if (projectId && currentUrl.match(/\/projects\/[a-f0-9]+\/checking\/?$/)) {
      // Already on manage questions page
    } else if (projectId) {
      await this.page.goto(`/projects/${projectId}/checking`);
    } else {
      await this.managePage.waitFor({ state: "visible", timeout: 25000 });
      await this.managePage.click();
    }

    await this.page.waitForURL(/\/projects\/[a-f0-9]+\/checking\/?$/, { timeout: 25000 });
    await this.page.locator("h1").filter({ hasText: /Manage questions|My progress/i }).waitFor({ state: "visible", timeout: 25000 });
    await this.page.locator("#loading-questions-message").waitFor({ state: "detached", timeout: 25000 }).catch(() => {});
  }

  async createQuestion(questionsList) {
    for (const data of questionsList) {
      await this.addQuestionBtn.waitFor({ state: "visible", timeout: 25000 });
      await this.addQuestionBtn.click();
      await this.startRef.click();
      await this.startRef.fill(data.reference);
      await this.questionBox.click();
      await this.questionBox.fill(data.question);
      await this.saveBtn.click();
      await this.saveBtn.waitFor({ state: "hidden", timeout: 15000 });
    }
  }

  async expandBook(bookName = 'Ruth') {
    const bookHeader = this.page.locator("div#text-with-questions-list mat-expansion-panel-header")
      .filter({ hasText: new RegExp(`^${bookName}\\b`, 'i') })
      .first();
    await bookHeader.waitFor({ state: 'visible', timeout: 25000 });
    const isExpanded = await bookHeader.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await bookHeader.click();
      await expect(bookHeader).toHaveAttribute('aria-expanded', 'true', { timeout: 10000 });
    }
    return bookHeader;
  }

  async expandChapter(chapterText = 'Ruth 1') {
    const chapterHeader = this.page.locator("div#text-with-questions-list mat-expansion-panel-header")
      .filter({ hasText: new RegExp(`^${chapterText}\\b`, 'i') })
      .first();
    await chapterHeader.waitFor({ state: 'visible', timeout: 25000 });
    const isExpanded = await chapterHeader.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await chapterHeader.click();
      await expect(chapterHeader).toHaveAttribute('aria-expanded', 'true', { timeout: 10000 });
    }
    return chapterHeader;
  }

  async verifyCreatedQuestion(questionsList) {
    await this.expandBook('Ruth');
    await this.expandChapter('Ruth 1');

    for (const data of questionsList) {
      await expect(this.createdQuestions.filter({ hasText: data.question }).first()).toBeVisible({ timeout: 15000 });
    }
  }

  async verifyQuestionReferences() {
    await this.addQuestionBtn.waitFor({ state: "visible", timeout: 25000 });
    await this.addQuestionBtn.click();
    await this.startRef.click();
    await this.startRefDropdown.waitFor({ state: "visible", timeout: 15000 });
    await this.startRefDropdown.click();

    await this.chooseBookdialog.waitFor({ state: "visible", timeout: 15000 });
    await expect(this.chooseBookdialog).toHaveText("Choose book");
    await this.selectBook.click();

    await this.chooseBookdialog.waitFor({ state: "visible", timeout: 15000 });
    await expect(this.chooseBookdialog).toHaveText("Choose chapter");
    await this.ChapterNumber.click();
    await this.startVerseNumber.click();

    await this.endRefDropdown.waitFor({ state: "visible", timeout: 15000 });
    await this.endRefDropdown.click();

    await this.chooseBookdialog.waitFor({ state: "visible", timeout: 15000 });
    await expect(this.chooseBookdialog).toHaveText("Choose end verse");
    await this.endVerseNumber.click();

    await this.questionBox.click();
    const questionText = `Question-${Date.now()}`;
    await this.questionBox.fill(questionText);
    await this.saveBtn.click();
    await this.saveBtn.waitFor({ state: "hidden", timeout: 15000 });

    await this.expandBook('Ruth');
    await this.expandChapter('Ruth 2');

    // Locate the row containing questionText (either via parent of .overflow-ellipsis or .flex)
    const questionItem = this.createdQuestions.filter({ hasText: questionText }).first();
    await expect(questionItem).toBeVisible({ timeout: 15000 });

    const row = questionItem.locator('xpath=ancestor::div[contains(@class, "flex")][1]').or(this.page.locator("div#text-with-questions-list div.flex").filter({ hasText: questionText })).or(this.textContent).first();
    await row.waitFor({ state: "visible", timeout: 10000 });
    const textContent = await row.textContent();
    const verseMatch = textContent.match(/v\d+-\d+/);
    expect(verseMatch).not.toBeNull();
    const verseRange = verseMatch[0].substring(1);
    console.log('Verified verse range:', verseRange);
    expect(verseRange).toBe('3-9');
  }

  async exportBtnNotVisible() {
    await expect(this.exportBtn).toBeHidden();
  }

  async exportBtnVisible() {
    await expect(this.exportBtn).toBeVisible({ timeout: 15000 });
  }

  async exportAndVerifyQuestionFile(projectCode = process.env.SF_PROJECT_NAME || 'ETL', expectedQuestions = []) {
    // 1. Set up download listener BEFORE clicking the export button
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });
    await this.exportBtn.click();
    const download = await downloadPromise;

    // 2. Validate filename pattern (e.g. ETL_questions_2026-10-19_1230.csv)
    const fileName = download.suggestedFilename();
    const expectedPattern = new RegExp(`^${projectCode}_questions_\\d{4}-\\d{2}-\\d{2}_\\d{4}\\.csv$`);
    expect(fileName).toMatch(expectedPattern);

    // 3. Ensure the downloads directory exists and save the file
    const downloadDir = path.resolve(__dirname, '../test-results/downloads');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    const savedFilePath = path.join(downloadDir, fileName);
    await download.saveAs(savedFilePath);

    // 4. Verify file exists on disk and is not empty (size > 0 bytes)
    expect(fs.existsSync(savedFilePath)).toBeTruthy();
    const stats = fs.statSync(savedFilePath);
    expect(stats.size).toBeGreaterThan(0);

    // 5. Verify CSV content contains header and the exported questions
    if (expectedQuestions && expectedQuestions.length > 0) {
      const fileContent = fs.readFileSync(savedFilePath, 'utf-8');

      // Explicitly verify the CSV header row
      expect(fileContent).toContain("Reference,Question");

      // Verify each question (trimmed to prevent whitespace mismatches)
      for (const item of expectedQuestions) {
        expect(fileContent).toContain(item.question.trim());
      }
    }
    console.log(`Successfully verified downloaded file: ${fileName} (${stats.size} bytes)`);
    return savedFilePath;
  }
}

module.exports = AddQuestion;
