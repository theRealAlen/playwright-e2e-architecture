import { expect, type Locator } from '@playwright/test';
import { BasePage } from '@e2e/utils';

export class SettingsPage extends BasePage {
  get bioInput(): Locator {
    return this.textbox('Short bio about you');
  }

  get updateButton(): Locator {
    return this.button('Update Settings');
  }

  get logoutButton(): Locator {
    return this.button('Or click here to logout.');
  }

  get usernameInput(): Locator {
    return this.textbox('Username');
  }

  get emailInput(): Locator {
    return this.textbox('Email');
  }

  async goto(): Promise<void> {
    await this.page.goto('/settings');
  }

  async waitForLoad(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Your Settings' })).toBeVisible();
    await expect(this.updateButton).toBeEnabled();
  }

  /** The form never pre-fills (it is patched with an Observable, not the user), so every field it submits is filled here. */
  async updateProfile(profile: { username: string; email: string; bio: string }): Promise<void> {
    await this.usernameInput.fill(profile.username);
    await this.emailInput.fill(profile.email);
    await this.bioInput.fill(profile.bio);
    await this.updateButton.click();
  }
}
