const {expect} = require('@playwright/test');

class LoginPage{

constructor(page){

    this.page=page;

    this.loginBtn = page.getByText('Log In').first();
    this.loginWithParatextBtn = page.getByText('Log in with Paratext');
    
    this.emailInput = page.locator('#email');
    this.loginSubmitBtn = page.locator('button.login-button').first();
    this.passwordInput = page.locator('#password input');
    this.nextBtn = page.getByText('Next').first();
    this.errorMessage = page.locator('.error-message, .alert-danger, [role="alert"]');
    
    this.myProjectsHeader = page.locator('.content h1');
    this.userAvatarBtn = page.locator('button img[alt], button .avatar').first();
    this.logoutBtn = page.getByText('Log Out');
  }
  async goto() {
    await this.page.goto('/');
  }
  async loginWithParatext(email, password) {
    await this.loginBtn.click();
    await this.loginWithParatextBtn.click();
    await this.emailInput.fill(email);
    await this.loginSubmitBtn.click();
    await this.nextBtn.waitFor({ state: 'visible', timeout: 35000 });
    await this.nextBtn.click();
    await this.passwordInput.fill(password);
    await this.nextBtn.click();
  }
  async logout() {
    await this.userAvatarBtn.click();
    await this.logoutBtn.click();
    await this.loginBtn.waitFor({ state: 'visible' });
  }
  async verifyLoggedIn() {
    await expect(this.myProjectsHeader).toHaveText('My projects');
  }
}
module.exports = LoginPage;