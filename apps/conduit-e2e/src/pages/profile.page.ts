import { expect, type Locator, type Page } from '@playwright/test';
import { ArticlePreview, BasePage } from '@e2e/utils';
import { FeedTabs } from '../components';

export class ProfilePage extends BasePage {
  readonly tabs: FeedTabs;

  constructor(page: Page) {
    super(page);
    this.tabs = new FeedTabs(page.locator('.articles-toggle'));
  }

  get userInfo(): Locator {
    return this.page.locator('.user-info');
  }

  get username(): Locator {
    return this.userInfo.getByRole('heading', { level: 4 });
  }

  get bio(): Locator {
    return this.userInfo.locator('p');
  }

  get previews(): Locator {
    return this.page.locator('.article-preview').filter({ has: this.page.getByRole('heading', { level: 1 }) });
  }

  articlePreview(title: string): ArticlePreview {
    return new ArticlePreview(this.previews.filter({ has: this.page.getByRole('heading', { name: title, exact: true }) }));
  }

  async goto(username: string): Promise<void> {
    await this.page.goto(`/profile/${username}`);
  }

  async waitForLoad(): Promise<void> {
    await expect(this.username).not.toBeEmpty();
    await expect(this.page.getByText('Loading articles...')).toBeHidden();
  }
}
