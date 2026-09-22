const {test,expect}=require("@playwright/test");
const testData=require("../data/question.json")

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
}


async managePageClick() {

await this.managePage.waitFor({state:"visible",timeout:25000});
await this.managePage.click();
console.log("Current URL:", await this.page.url());

await expect(this.page.locator("h1")).toHaveText("Manage questions");

     
}

async createQuestion(){

     for (const data of testData.questions) {

    await this.addQuestionBtn.waitFor({state:"visible"});
    await this.addQuestionBtn.click();
    await this.startRef.click();
    await this.startRef.fill(data.reference);
    await this.questionBox.click();
    await this.questionBox.fill(data.question);
    await this.saveBtn.click();
    
     }
}

async verifyCreatedQuestion(){

    await this.bookRow.waitFor({state:'visible'});
    await this.bookRow.click();
    await this.chapterRow.waitFor({state:'visible'});
    await this.chapterRow.click();

    for (let i = 0; i < testData.questions.length; i++) {

    const expectedQuestion = testData.questions[i].question;

    await expect(this.createdQuestions.nth(i))
        .toHaveText(expectedQuestion);
    }

    await this.bookRow.waitFor({state:'visible'});
    await this.bookRow.click();
}

/*
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

} */

}


module.exports=AddQuestion;