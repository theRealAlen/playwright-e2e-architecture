import { expect, type Locator, type Page } from '@playwright/test';
import { apiUrl, BasePage, ErrorMessages, withRejectedResponses, type Credentials } from '@e2e/utils';

export class LoginPage extends BasePage {
  readonly errors: ErrorMessages;

  constructor(page: Page) {
    super(page);
    this.errors = new ErrorMessages(page.locator('.error-messages'));
  }

  get emailInput(): Locator {
    return this.textbox('Email');
  }

  get passwordInput(): Locator {
    return this.textbox('Password');
  }

  get submitButton(): Locator {
    return this.button('Sign in');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async waitForLoad(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  }

  async submit(credentials: Pick<Credentials, 'email' | 'password'>): Promise<void> {
    await this.emailInput.fill(credentials.email);
    await this.passwordInput.fill(credentials.password);
    await this.submitButton.click();
  }

  async signIn(credentials: Pick<Credentials, 'email' | 'password'>): Promise<void> {
    await withRejectedResponses(this.page, new URL(apiUrl()).origin, async () => {
      await this.submit(credentials);
      await expect(this.page).not.toHaveURL(/\/login$/);
    });
  }
}
