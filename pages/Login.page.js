const { expect } = require('@playwright/test');
const OTPAuth = require('otpauth');

class LoginPage {
  constructor(page) {
    this.page = page;

    this.loginBtn = page.getByText('Log In').first();
    this.loginWithParatextBtn = page.getByText('Log in with Paratext');

    this.emailInput = page.locator('#email');
    this.loginSubmitBtn = page.locator('button.login-button').first();
    this.passwordInput = page.locator('input[type="password"], input[name="Passwd"]');
    this.nextBtn = page.getByRole('button', { name: 'Next' }).or(page.locator('#passwordNext button, #identifierNext button, #totpNext button'));

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
        // Wait briefly to see if Google routes to a challenge page or directly to Scripture Forge
        await this.page.waitForURL(/challenge|projects/i, { timeout: 15000 }).catch(() => {});

        if (this.page.url().includes('challenge')) {
          // Check if we are already on the Authenticator TOTP challenge screen
          const isAuthenticatorChallenge = this.page.url().includes('/challenge/totp') ||
            await this.page.getByText(/authenticator/i).first().isVisible({ timeout: 2000 }).catch(() => false);

          if (!isAuthenticatorChallenge) {
            const authOption = this.page.getByText(/authenticator/i).first();
            const tryAnotherWay = this.page.getByRole('button', { name: /try another way/i })
              .or(this.page.locator('button:has-text("Try another way"), div[role="button"]:has-text("Try another way")'))
              .or(this.page.getByText('Try another way'));

            if (await authOption.isVisible({ timeout: 2000 }).catch(() => false)) {
              console.log('Selecting Google Authenticator option...');
              await authOption.click();
            } else if (await tryAnotherWay.first().isVisible({ timeout: 5000 }).catch(() => false)) {
              console.log('Clicking "Try another way" to switch to Google Authenticator...');
              await tryAnotherWay.first().click();
              try {
                await authOption.waitFor({ state: 'visible', timeout: 8000 });
                await authOption.click();
              } catch {
                console.warn('Warning: "Google Authenticator" was not listed under "Try another way".');
              }
            }
          }

          // Locate the TOTP pin input on the Authenticator challenge screen
          const pinInput = this.page.locator('input[type="tel"], #totpPin, input[name="totpPin"]').first();
          await pinInput.waitFor({ state: 'visible', timeout: 15000 });

          // Generate the live 6-digit TOTP code
          const totp = new OTPAuth.TOTP({
            secret: process.env.SF_TOTP_SECRET.replace(/\s+/g, ''),
          });
          const token = totp.generate();
          console.log(`Generated TOTP 2FA code: ${token}`);

          await pinInput.fill(token);

          // Click Next
          const nextButton = this.page.getByRole('button', { name: 'Next' })
            .or(this.page.locator('#totpNext button, #totpNext, button[type="button"]:has-text("Next")'))
            .first();
          await nextButton.click();
        }
      } catch (e) {
        console.log('2FA handling notice:', e.message);
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