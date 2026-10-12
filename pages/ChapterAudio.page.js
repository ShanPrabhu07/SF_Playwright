const {test,expect}= require("@playwright/test");

class chapterAudio{


constructor(page){

    this.page = page;
    this.QAPage=page.locator("span.mat-mdc-list-item-unscoped-content").filter({hasText:' Questions & answers '});
    this.manageAudioBtn=page.locator("button.add-audio-button");
    this.chapterDialog=page.locator("[id*='mat-mdc-dialog-ng-cli-universal']");
    this.saveBtn=page.locator("#audio-save-btn");
    this.audioFile=page.locator("div.wrapper-audio");
    this.timingFile=page.locator("div.wrapper-timing");
    this.browseFile=page.locator("input.mat-mdc-tooltip-trigger");
    this.audioPlayerInDialog=page.locator("div.audio-player-manage");
    this.playChapter=page.locator("button").filter({hasText:'play_circle_outline'});
    this.audioPlayer=page.locator("div.scripture-audio-player-wrapper");
    this.audioFileDeleteBtn=page.locator("div.wrapper-audio .delete");
    this.timingFileDeleteBtn=page.locator("div.wrapper-timing .delete")


}

async QApageClick(){

    await this.QAPage.click();

    //Add chapter audio
    await this.manageAudioBtn.click();
    await expect(this.chapterDialog).toBeVisible();
    await this.saveBtn.click();
    await expect(this.audioFile).toHaveCSS('border-color','rgb(147, 0, 10)');
    await expect(this.timingFile).toHaveCSS('border-color','rgb(147, 0, 10)');
    await this.browseFile.setInputFiles("C:/Users/Prabhu/Documents/Sound recordings/ETU-RUT-001.mp3");
    await this.browseFile.setInputFiles("C:/Users/Prabhu/Documents/Sound recordings/ETU-RUT-001.txt");
    await expect(this.audioPlayerInDialog).toBeVisible();
    await this.saveBtn.click();
    await expect (this.chapterDialog).toBeHidden();

    //Play chapter audio
    await expect(this.playChapter).toBeVisible();
    await this.playChapter.click();
    await expect(this.audioPlayer).toBeVisible();

    //Delete chapter audio
    await this.manageAudioBtn.click();
    await expect(this.chapterDialog).toBeVisible();
    await this.audioFileDeleteBtn.click();
    await this.timingFileDeleteBtn.click();
    await this.saveBtn.click();
    await expect (this.chapterDialog).toBeHidden();
    await expect(this.playChapter).toBeHidden();

}


}

module.exports=chapterAudio;