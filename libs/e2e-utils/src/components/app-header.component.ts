import { expect, type Locator } from '@playwright/test';

export class AppHeader {
  constructor(readonly root: Locator) {}

  link(name: string): Locator {
    return this.root.getByRole('link', { name, exact: true });
  }

  get newArticleLink(): Locator {
    return this.root.getByRole('link', { name: 'New Article' });
  }

  get settingsLink(): Locator {
    return this.root.getByRole('link', { name: 'Settings' });
  }

  get signInLink(): Locator {
    return this.link('Sign in');
  }

  profileLink(username: string): Locator {
    return this.link(username);
  }

  async expectSignedInAs(username: string): Promise<void> {
    await expect(this.profileLink(username)).toBeVisible();
    await expect(this.signInLink).toBeHidden();
  }

  async expectSignedOut(): Promise<void> {
    await expect(this.signInLink).toBeVisible();
  }
}
