const base = require('@playwright/test');
const LoginPage = require('../pages/Login.page');
const OpenProject = require('../pages/OpenProject.page');
const AddQuestions = require('../pages/AddQuestions.page');
const EditPage=require("../pages/EditPage.page");


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

});

module.exports = {
  test,
  expect: base.expect,
};
