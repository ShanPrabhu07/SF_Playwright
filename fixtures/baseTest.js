const base = require('@playwright/test');
const LoginPage = require('../pages/Login.page');
const OpenProject = require('../pages/OpenProject.page');
const AddQuestions = require('../pages/AddQuestions.page');
const EditPage = require('../pages/EditPage.page');
const chapterAudio= require("../pages/ChapterAudio.page");


const test = base.test.extend({
 
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new OpenProject(page));
  },

  questionsPage: async ({ page }, use) => {
    await use(new AddQuestions(page));
  },

  editPage: async({page},use)=>{
    await use(new EditPage(page));

  },

  chapterAudio: async({page},use)=>{
    await use(new chapterAudio(page))
  },

  // connect and delete project for each spec/test files
 connectedProject: async ({ homePage }, use) => {
    await homePage.openProject();
    try {
      await use();
    } finally {
      // Safe teardown: only delete if workspace exists
      await homePage.deleteProject().catch(err => console.warn('Teardown cleanup skipped:', err.message));
    }
  }, 

  

});

module.exports = {
  test,
  expect: base.expect,
};
