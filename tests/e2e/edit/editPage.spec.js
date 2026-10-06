const{test,expect}=require('../../../fixtures/projectHooks');

test('Adding text on edit page',async({homePage,editPage,connectedProject})=>{

    await editPage.addTextToBook(5,"Numbers");

})