const {expect}= require('@playwright/test');

class EditPage{

constructor(page){

    this.page=page;
    this.editPage= page.locator("#tools-menu-list").filter({hasText:" Edit & review "});
    this.bookDropdown = page.locator("span.mat-mdc-select-value-text").first();
    this.bookList = page.getByRole("listbox");
    this.selectBook= page.getByRole("option").filter({hasText:"Numbers"});
    this.verse1=page.locator('[data-segment="verse_1_1"]');

}

async addTextToBook(verseCount){
    // Navigate to Edit & review if not already there
    await this.page.getByRole('link', { name: 'Edit & review' }).click();
    await this.page.waitForLoadState('networkidle');

    // Select Book
    await this.bookDropdown.waitFor({state:"visible", timeout:15000});
    await this.bookDropdown.click({force:true});
    await this.bookList.waitFor({state:"visible",timeout:25000});
    await this.selectBook.click();

    // Add text verse-by-verse using real keyboard typing (Quill requires typing events, NOT fill)
    for (let i = 1; i <= verseCount; i++) {
        const verseLocator = this.page.locator(`[data-segment="verse_1_${i}"]`);
        await verseLocator.waitFor({ state: "visible", timeout: 15000 });
        await verseLocator.click();
        await this.page.keyboard.type(`verse${i} data `);
    }

    // Wait for ShareDB WebSocket debounced auto-save to commit to the server
    await this.page.waitForTimeout(3000);

    // Reload page to verify persistence from server
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');

    // Assert that the text persisted after page refresh
    for (let i = 1; i <= verseCount; i++) {
        const verseLocator = this.page.locator(`[data-segment="verse_1_${i}"]`);
        await expect(verseLocator).toContainText(`verse${i} data`);
        console.log(`Verse ${i} content after reload:`, await verseLocator.textContent());
    }
}


}

module.exports=EditPage;