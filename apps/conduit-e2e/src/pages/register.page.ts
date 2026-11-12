import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage, ErrorMessages, type Credentials } from '@e2e/utils';

export class RegisterPage extends BasePage {
  readonly errors: ErrorMessages;

  constructor(page: Page) {
    super(page);
    this.errors = new ErrorMessages(page.locator('.error-messages'));
  }

  get usernameInput(): Locator {
    return this.textbox('Username');
  }

  get emailInput(): Locator {
    return this.textbox('Email');
  }

  get passwordInput(): Locator {
    return this.textbox('Password');
  }

  get submitButton(): Locator {
    return this.button('Sign up');
  }

  async goto(): Promise<void> {
    await this.page.goto('/register');
  }

  async waitForLoad(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
  }

  async submit(credentials: Credentials): Promise<void> {
    await this.usernameInput.fill(credentials.username);
    await this.emailInput.fill(credentials.email);
    await this.passwordInput.fill(credentials.password);
    await this.submitButton.click();
  }
}
