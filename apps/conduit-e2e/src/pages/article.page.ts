import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@e2e/utils';
import { CommentCard } from '../components';

export class ArticlePage extends BasePage {
  readonly banner: Locator;

  constructor(page: Page) {
    super(page);
    this.banner = page.locator('.banner');
  }

  get title(): Locator {
    return this.banner.getByRole('heading', { level: 1 });
  }

  get body(): Locator {
    return this.page.locator('.article-content');
  }

  get tags(): Locator {
    return this.page.locator('.article-content .tag-list li, .tag-list li');
  }

  get editButton(): Locator {
    return this.banner.getByRole('link', { name: 'Edit Article' }).or(this.banner.getByRole('button', { name: 'Edit Article' }));
  }

  get deleteButton(): Locator {
    return this.banner.getByRole('button', { name: 'Delete Article' });
  }

  followButton(username: string): Locator {
    return this.banner.getByRole('button', { name: new RegExp(`Follow\\s+${username}`) });
  }

  get commentInput(): Locator {
    return this.textbox('Write a comment...');
  }

  get postCommentButton(): Locator {
    return this.button('Post Comment');
  }

  get comments(): Locator {
    return this.page.locator('.card').filter({ has: this.page.locator('.card-text') });
  }

  comment(text: string): CommentCard {
    return new CommentCard(this.comments.filter({ hasText: text }));
  }

  async goto(slug: string): Promise<void> {
    await this.page.goto(`/article/${slug}`);
  }

  async waitForLoad(): Promise<void> {
    await expect(this.title).not.toBeEmpty();
    await expect(this.body).toBeVisible();
  }

  async postComment(text: string): Promise<void> {
    await this.commentInput.fill(text);
    await this.postCommentButton.click();
  }

  async deleteArticle(): Promise<void> {
    await this.deleteButton.click();
  }
}
