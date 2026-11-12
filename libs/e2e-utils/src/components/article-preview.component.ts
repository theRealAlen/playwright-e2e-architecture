import { expect, type Locator } from '@playwright/test';

export class ArticlePreview {
  constructor(readonly root: Locator) {}

  get title(): Locator {
    return this.root.getByRole('heading', { level: 1 });
  }

  get description(): Locator {
    return this.root.locator('p').first();
  }

  get author(): Locator {
    return this.root.locator('.author');
  }

  get favoriteButton(): Locator {
    return this.root.getByRole('button');
  }

  get tags(): Locator {
    return this.root.locator('.tag-list li');
  }

  async open(): Promise<void> {
    await this.title.click();
  }

  async toggleFavorite(): Promise<void> {
    await this.favoriteButton.click();
  }

  async expectFavoritesCount(count: number): Promise<void> {
    await expect(this.favoriteButton).toHaveText(new RegExp(`^\\s*${count}\\s*$`));
  }
}
