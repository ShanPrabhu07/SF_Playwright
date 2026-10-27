const { expect } = require("@playwright/test");
const path = require('path');

class ChapterAudio {
  constructor(page) {
    this.page = page;
    this.QAPage = page.locator("a[href*='/checking/']").filter({ hasText: /Questions & answers/i }).or(page.getByRole('link', { name: /Questions & answers/i })).first();
    this.manageAudioBtn = page.locator("button.add-audio-button");
    this.chapterDialog = page.locator("mat-dialog-container, [role='dialog'], [id*='mat-mdc-dialog']").first();
    this.saveBtn = page.locator("#audio-save-btn");
    this.audioFile = page.locator("div.wrapper-audio");
    this.timingFile = page.locator("div.wrapper-timing");
    this.browseFile = page.locator("input.mat-mdc-tooltip-trigger");
    this.audioPlayerInDialog = page.locator("div.audio-player-manage");
    this.playChapter = page.locator("button").filter({ hasText: 'play_circle_outline' });
    this.audioPlayer = page.locator("div.scripture-audio-player-wrapper");
    this.audioFileDeleteBtn = page.locator("div.wrapper-audio .delete");
    this.timingFileDeleteBtn = page.locator("div.wrapper-timing .delete");
  }

  async QApageClick() {
    const audioPath = path.resolve(__dirname, '../data/chapterAudio/ETU-RUT-001.mp3');
    const timingPath = path.resolve(__dirname, '../data/chapterAudio/ETU-RUT-001.txt');

    const currentUrl = this.page.url();
    const match = currentUrl.match(/\/projects\/([a-f0-9]+)/);
    const projectId = match ? match[1] : null;

    if (projectId && !currentUrl.includes('/checking/NUM/1')) {
      await this.page.goto(`/projects/${projectId}/checking/NUM/1`);
    } else if (!projectId) {
      await this.QAPage.waitFor({ state: "visible", timeout: 25000 });
      await this.QAPage.click();
    }

    await this.page.waitForURL(/\/projects\/[a-f0-9]+\/checking\/NUM\/1/, { timeout: 30000 });

    // Add chapter audio
    await this.manageAudioBtn.waitFor({ state: "visible", timeout: 25000 });
    await this.manageAudioBtn.click();
    await expect(this.chapterDialog).toBeVisible({ timeout: 15000 });
    await this.saveBtn.click();
    await expect(this.audioFile).toHaveCSS('border-color', 'rgb(147, 0, 10)');
    await expect(this.timingFile).toHaveCSS('border-color', 'rgb(147, 0, 10)');

    const audioInput = this.audioFile.locator('input[type="file"]').or(this.browseFile).first();
    const timingInput = this.timingFile.locator('input[type="file"]').first();

    await audioInput.setInputFiles(audioPath);
    if (await timingInput.count() > 0) {
      await timingInput.setInputFiles(timingPath);
    } else {
      await this.browseFile.setInputFiles([audioPath, timingPath]);
    }

    await expect(this.audioPlayerInDialog).toBeVisible({ timeout: 15000 });
    await this.saveBtn.click();
    await expect(this.chapterDialog).toBeHidden({ timeout: 15000 });

    // Play chapter audio
    await expect(this.playChapter).toBeVisible({ timeout: 15000 });
    await this.playChapter.click();
    await expect(this.audioPlayer).toBeVisible({ timeout: 15000 });

    // Delete chapter audio
    await this.manageAudioBtn.click();
    await expect(this.chapterDialog).toBeVisible({ timeout: 15000 });
    await this.audioFileDeleteBtn.click();
    await this.timingFileDeleteBtn.click();
    await this.saveBtn.click();
    await expect(this.chapterDialog).toBeHidden({ timeout: 15000 });
    await expect(this.playChapter).toBeHidden({ timeout: 15000 });
  }
}

module.exports = ChapterAudio;
