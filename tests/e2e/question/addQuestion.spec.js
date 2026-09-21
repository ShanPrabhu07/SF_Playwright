const{test}=require("@playwright/test");

const { POManager } = require("../../../pages/index.page");

test("Add a Question", async({page})=>{

  
    /*connecting the project, login will be handled by config file */
    const poManger = new POManager(page);
    await poManger.getHomePage().openProject();

   /* adding a questions */
   
  await poManger.getAddQuestionsPage().managePageClick();
 await poManger.getAddQuestionsPage().createQuestion();

  /* verify created question */

   await poManger.getAddQuestionsPage().verifyCreatedQuestion();

  /*Add a question and verify the reference */

  //await poManger.getAddQuestionsPage().verifyQuestionReferences();

})