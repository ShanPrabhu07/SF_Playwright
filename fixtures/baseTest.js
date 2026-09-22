const base = require('@playwright/test');
const OpenProject = require('../pages/OpenProject.page');
const AddQuestions = require('../pages/AddQuestions.page');

const test = base.test.extend({
  // OpenProject (Home) Page Fixture
  homePage: async ({ page }, use) => {
    const homePage = new OpenProject(page);
    await use(homePage);
  },

  // AddQuestions Page Fixture
  questionsPage: async ({ page }, use) => {
    const questionsPage = new AddQuestions(page);
    await use(questionsPage);
  },

});

module.exports = {
  test,
  expect: base.expect,
};
