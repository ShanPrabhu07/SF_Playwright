const { test, expect } = require('../../../fixtures/baseTest');
const testData=require("../../../data/question.json");


test("Add a Question", async ({ homePage,connectedProject,questionsPage }) => {

  /* adding questions */
  await questionsPage.managePageClick();
  await questionsPage.createQuestion(testData.questions);

  /* verify created question */
  await questionsPage.verifyCreatedQuestion(testData.questions);

 
});

test("verify the question reference",async({homePage,connectedProject,questionsPage})=>{

  await questionsPage.managePageClick();

   /* Add a question and verify the reference */
   await questionsPage.verifyQuestionReferences();

});

