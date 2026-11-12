import { type Locator } from '@playwright/test';

export class CommentCard {
  constructor(readonly root: Locator) {}

  get body(): Locator {
    return this.root.locator('.card-text');
  }

  get author(): Locator {
    return this.root.locator('.comment-author').last();
  }

  get deleteButton(): Locator {
    return this.root.locator('.mod-options i, .mod-options .ion-trash-a').first();
  }

  async delete(): Promise<void> {
    await this.deleteButton.click();
  }
}
