const { test: base, expect } = require('./baseTest');

const test = base.extend({

  connectedProject: async ({ homePage }, use) => {

    await homePage.openProject();

    try{
    await use();
    } finally{
    await homePage.deleteProject();
  }}

});

module.exports = {
  test,
  expect
};