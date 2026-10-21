const {test,expect}=require("@playwright/test");
const path = require("path");
const fs = require("fs");

class AddQuestion{

constructor(page){

    this.page=page;
    this.managePage=page.locator("span.mat-mdc-list-item-unscoped-content").filter({hasText:' Manage questions '});

    this.addQuestionBtn= page.locator(".add-question-button").first();
    this.startRef= page.locator("#scripture-start input");
    this.endRef=page.locator("#scripture-end input");
    
    this.questionBox =page.locator("#textarea");
    this.saveBtn=page.locator("#question-save-btn");

    this.bookRow=page.locator("div#text-with-questions-list mat-expansion-panel-header").first();
    this.chapterRow=page.locator("div#text-with-questions-list mat-expansion-panel-header").last();
    this.questionContent=page.locator(".overflow-ellipsis");
    this.questionContentCount=page.locator(".overflow-ellipsis").count();
    this.createdQuestions =page.locator(".overflow-ellipsis");

    this.startRefDropdown = page.locator(".mat-mdc-form-field-icon-suffix .mdc-icon-button").first();
    this.endRefDropdown = page.locator(".mat-mdc-form-field-icon-suffix .mdc-icon-button").last();
    this.chooseBookdialog=page.locator("[id*=mat-mdc-dialog-title] span").last();
    this.selectBook = page.locator(".mdc-button").filter({hasText:"Ruth"});

    this.ChapterNumber = page.locator("div.mat-mdc-dialog-content button").nth(1);
    this.startVerseNumber = page.locator("div.mat-mdc-dialog-content button").nth(2);
    this.endVerseNumber = page.locator("div.mat-mdc-dialog-content button").nth(6);

    this.ruthBookRow=page.locator("div#text-with-questions-list mat-expansion-panel-header").filter({hasText:"Ruth"}).first();
    this.ruthChapterRow=page.locator("div#text-with-questions-list mat-expansion-panel-header").filter({hasText:"Ruth"}).last();
    this.textContent = page.locator("div.flex").first();

    //export

    this.exportBtn=page.locator("#export-btn");
    
}


async managePageClick() {
  await this.managePage.waitFor({ state: "visible", timeout: 25000 });
  await this.managePage.click();
  await this.page.waitForURL(/.*\/checking/, { timeout: 25000 });
  await expect(this.page.locator("h1")).toHaveText("Manage questions", { timeout: 25000 });
}

async createQuestion(questionsList){

     for (const data of questionsList) {

    await this.addQuestionBtn.waitFor({state:"visible"});
    await this.addQuestionBtn.click();
    await this.startRef.click();
    await this.startRef.fill(data.reference);
    await this.questionBox.click();
    await this.questionBox.fill(data.question);
    await this.saveBtn.click();
    await this.saveBtn.waitFor({ state: "hidden", timeout: 15000 });
     }
}

async verifyCreatedQuestion(questionsList){

    await this.bookRow.waitFor({state:'visible'});
    await this.bookRow.click();
    await this.chapterRow.waitFor({state:'visible'});
    await this.chapterRow.click();

    for (const data of questionsList) {
      await expect(this.createdQuestions.filter({ hasText: data.question }).first()).toBeVisible({ timeout: 15000 });
    }

    await this.bookRow.waitFor({state:'visible'});
    await this.bookRow.click();
}


async verifyQuestionReferences(){

    await this.addQuestionBtn.waitFor({state:"visible"});
    await this.addQuestionBtn.click();
    await this.startRef.click();
    await this.startRefDropdown.waitFor({state:"visible"});
    await this.startRefDropdown.click();
    await this.chooseBookdialog.waitFor({state:"visible"});
    await expect(this.chooseBookdialog).toHaveText("Choose book");
    await this.selectBook.click();
    await this.chooseBookdialog.waitFor({state:"visible"});
    await expect(this.chooseBookdialog).toHaveText("Choose chapter");
    await this.ChapterNumber.click();
    await this.startVerseNumber.click();

    await this.endRefDropdown.waitFor({state:"visible"});
    await this.endRefDropdown.click();
    await this.chooseBookdialog.waitFor({state:"visible"});
    await expect(this.chooseBookdialog).toHaveText("Choose end verse");
    await this.endVerseNumber.click();
    await this.questionBox.click();
    await this.questionBox.fill(`Question-${Date.now()}`);
    await this.saveBtn.click();

    await this.ruthBookRow.waitFor({state:'visible'});
    await this.ruthBookRow.click();
    await this.ruthChapterRow.waitFor({state:'visible'});
    await this.ruthChapterRow.click();
    await this.textContent.waitFor({state:'visible'});
    const textContent = await this.textContent.textContent()
    const verseRange = textContent.match(/v\d+-\d+/)[0].substring(1);;
    console.log(verseRange);

} 

async exportBtnNotVisible(){

  await expect(this.exportBtn).toBeHidden();
}    

async exportBtnVisible(){

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


module.exports=AddQuestion;