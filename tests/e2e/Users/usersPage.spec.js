const { test, expect } = require('../../../fixtures/baseTest');


test("User Page automation",async({homePage,usersPage,connectedProject})=>{

    await usersPage.inviteUser();

})