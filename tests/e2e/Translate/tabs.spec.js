const { test, expect } = require('../../../fixtures/baseTest');

test('Opening history tab',async({homePage,editPage,connectedProject})=>{

    await editPage.addTextToBook(5,"Numbers");
    await editPage.addHistorytab(5);

})

test('Opening resource tab', async({homePage,editPage,connectedProject})=>{

    await editPage.addResourceTab();

})