import { expect, type Locator } from '@playwright/test';

export class FeedTabs {
  constructor(readonly root: Locator) {}

  tab(name: string): Locator {
    return this.root.locator('.nav-link').filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) });
  }

  async open(name: 'Your Feed' | 'Global Feed' | 'My Posts' | 'Favorited Posts'): Promise<void> {
    await this.tab(name).click();
    await expect(this.tab(name)).toHaveClass(/active/);
  }
}
