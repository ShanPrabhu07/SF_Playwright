const{test}=require("../../../fixtures/baseTest");
const testData=require("../../../data/question.json");

test("export button feature",async({homePage,connectedProject,questionsPage})=>{


     await questionsPage.managePageClick();

    await questionsPage.exportBtnNotVisible();

    await questionsPage.createQuestion(testData.questions);

    await questionsPage.exportBtnVisible();
    await questionsPage.exportAndVerifyQuestionFile( process.env.SF_PROJECT_NAME || 'ETL',
    testData.questions);





})