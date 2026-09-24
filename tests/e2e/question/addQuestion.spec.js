const { test } = require("../../../fixtures/baseTest");

test("Add a Question", async ({ homePage, questionsPage }) => {
  /* connecting the project, login is handled by setup project */
  await homePage.openProject();

  /* adding questions */
  await questionsPage.managePageClick();
  await questionsPage.createQuestion();

  /* verify created question */
  await questionsPage.verifyCreatedQuestion();

  /* Add a question and verify the reference */
  // await questionsPage.verifyQuestionReferences();
});
