const{test,expect}=require('../../../fixtures/baseTest');

test('Adding text on edit page',async({homePage,editPage})=>{

    await homePage.openProject();

    await editPage.addTextToBook(5);



})