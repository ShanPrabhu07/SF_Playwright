const { test, expect } = require('../../../fixtures/baseTest');
const testData=require("../../../data/question.json");


test("Add a Question", async ({ homePage,connectedProject,questionsPage }) => {

  /* adding questions */
  await questionsPage.managePageClick();
  await questionsPage.createQuestion(testData.questions);

  /* verify created question */
  await questionsPage.verifyCreatedQuestion(testData.questions);

  /* Add a question and verify the reference */
  // await questionsPage.verifyQuestion References();
});

