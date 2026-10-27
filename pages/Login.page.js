const { expect } = require('@playwright/test');
const OTPAuth = require('otpauth');

class LoginPage {
  constructor(page) {
    this.page = page;

    this.loginBtn = page.getByText('Log In').first();
    this.loginWithParatextBtn = page.getByText('Log in with Paratext');

    this.emailInput = page.locator('#email');
    this.loginSubmitBtn = page.locator('button.login-button').first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.nextBtn = page.getByRole('button', { name: 'Next' }).or(page.locator('#passwordNext button, #identifierNext button, #totpNext button')).first();

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
        // Wait for either Google Challenge/account page or direct redirect to Scripture Forge
        await this.page.waitForURL(/challenge|projects|accounts\.google\.com/i, { timeout: 25000 }).catch(() => {});

        // If we are still on Google accounts domain and not on /projects
        if (this.page.url().includes('accounts.google.com') && !this.page.url().includes('/projects')) {
          console.log('Google 2FA challenge detected. URL:', this.page.url());

          // Check if TOTP pin input is already visible
          const pinLocator = this.page.locator('input[type="tel"], #totpPin, input[name="totpPin"], input#idvPin').first();
          let isPinVisible = await pinLocator.isVisible({ timeout: 4000 }).catch(() => false);

          // If PIN input is not visible, Google likely presented the "Check your phone" (Device Prompt) screen
          if (!isPinVisible) {
            console.log('PIN input not visible yet. Checking for "Try another way" to select Authenticator...');

            // Look for "Try another way"
            const tryAnotherWay = this.page.locator('button, div[role="button"], a')
              .filter({ hasText: /try another way/i })
              .first();

            if (await tryAnotherWay.isVisible({ timeout: 5000 }).catch(() => false)) {
              console.log('Clicking "Try another way"...');
              await tryAnotherWay.click({ force: true });
              await this.page.waitForTimeout(1000);
            }

            // Click the Authenticator option from the list of options
            const authOption = this.page.locator('li, div[role="link"], div[role="button"], button')
              .filter({ hasText: /authenticator/i })
              .first();

            if (await authOption.isVisible({ timeout: 6000 }).catch(() => false)) {
              console.log('Clicking "Google Authenticator" option...');
              await authOption.click({ force: true });
            }
          }

          // Locate the TOTP pin input on the Authenticator challenge screen
          if (await pinLocator.isVisible({ timeout: 15000 }).catch(() => false)) {
            // Generate the live 6-digit TOTP code
            const totp = new OTPAuth.TOTP({
              secret: process.env.SF_TOTP_SECRET.replace(/\s+/g, ''),
            });
            const token = totp.generate();
            console.log(`Generated and entering TOTP 2FA code: ${token}`);

            await pinLocator.fill(token);

            // Click Next
            const nextButton = this.page.locator('#totpNext button, #totpNext, #idvPrgNext button, button[type="button"]:has-text("Next"), button:has-text("Next")').first();
            await nextButton.click({ force: true });
          } else {
            console.log('Could not find TOTP pin input. Waiting in case manual device prompt ("Yes, it\'s me") was tapped...');
          }
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