import { expect, type Locator } from '@playwright/test';

export class ErrorMessages {
  constructor(readonly root: Locator) {}

  get items(): Locator {
    return this.root.locator('li');
  }

  async expectMessage(text: string | RegExp): Promise<void> {
    await expect(this.items.filter({ hasText: text })).toBeVisible();
  }
}
