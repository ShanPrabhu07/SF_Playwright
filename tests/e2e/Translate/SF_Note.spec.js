const { test, expect } = require('../../../fixtures/baseTest');

test('Add a SF Note',async({homePage,editPage,connectedProject})=>{

    await editPage.addSF_Note("Numbers");
    await editPage.editSF_Note();
    await editPage.deleteSF_Note();

})