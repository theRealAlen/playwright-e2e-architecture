import { expect, type Locator, type Page } from '@playwright/test';
import { ArticlePreview, BasePage } from '@e2e/utils';
import { FeedTabs, TagSidebar } from '../components';

export class HomePage extends BasePage {
  readonly feedTabs: FeedTabs;
  readonly tagSidebar: TagSidebar;

  constructor(page: Page) {
    super(page);
    this.feedTabs = new FeedTabs(page.locator('.feed-toggle'));
    this.tagSidebar = new TagSidebar(page.locator('.sidebar'));
  }

  get previews(): Locator {
    return this.page.locator('.article-preview').filter({ has: this.page.getByRole('heading', { level: 1 }) });
  }

  get emptyFeed(): Locator {
    return this.page.getByText('No articles are here... yet.');
  }

  get loadingFeed(): Locator {
    return this.page.getByText('Loading articles...');
  }

  articlePreview(title: string): ArticlePreview {
    return new ArticlePreview(this.previews.filter({ has: this.page.getByRole('heading', { name: title, exact: true }) }));
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async waitForLoad(): Promise<void> {
    await expect(this.tagSidebar.heading).toBeVisible();
    await expect(this.loadingFeed).toBeHidden();
  }
}
