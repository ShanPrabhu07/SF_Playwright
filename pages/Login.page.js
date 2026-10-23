const { expect } = require('@playwright/test');
const OTPAuth = require('otpauth');

class LoginPage {
  constructor(page) {
    this.page = page;

    this.loginBtn = page.getByText('Log In').first();
    this.loginWithParatextBtn = page.getByText('Log in with Paratext');

    this.emailInput = page.locator('#email');
    this.loginSubmitBtn = page.locator('button.login-button').first();
    this.passwordInput = page.locator('input[type="password"]');
    this.nextBtn = page.getByRole('button', { name: 'Next' });

    // Google 2FA Authenticator Code Input
    this.totpInput = page.locator('input[type="tel"], #totpPin, input[name="totpPin"]');

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

    // 1. Google Email step
    await this.nextBtn.waitFor({ state: 'visible', timeout: 35000 });
    await this.nextBtn.click();

    // 2. Google Password step
    await this.passwordInput.waitFor({ state: 'visible', timeout: 35000 });
    await this.passwordInput.fill(password);
    await this.nextBtn.click();

    // 3. Google 2FA Step (if prompted)
    if (process.env.SF_TOTP_SECRET) {
      try {
        await this.totpInput.waitFor({ state: 'visible', timeout: 10000 });

        // Generate the live 6-digit TOTP code
        const totp = new OTPAuth.TOTP({
          secret: process.env.SF_TOTP_SECRET.replace(/\s+/g, ''),
        });
        const token = totp.generate();

        console.log(`Generated TOTP 2FA code: ${token}`);
        await this.totpInput.fill(token);
        await this.nextBtn.click();
      } catch (e) {
        // 2FA prompt was not shown (already trusted or skipped)
      }
    }
  }

  async verifyLoggedIn() {
    await this.page.waitForURL(/projects/, { timeout: 60000 });
    await this.myProjectsHeader.waitFor({ state: 'visible', timeout: 35000 });
    await expect(this.myProjectsHeader).toHaveText('My projects');
  }
}

module.exports = LoginPage;