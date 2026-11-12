import { expect, type Locator } from '@playwright/test';
import { BasePage, captureJson, type Article, type NewArticle } from '@e2e/utils';

export class EditorPage extends BasePage {
  get titleInput(): Locator {
    return this.textbox('Article Title');
  }

  get descriptionInput(): Locator {
    return this.textbox("What's this article about?");
  }

  get bodyInput(): Locator {
    return this.textbox('Write your article (in markdown)');
  }

  get tagsInput(): Locator {
    return this.textbox('Enter tags');
  }

  get publishButton(): Locator {
    return this.button('Publish Article');
  }

  async goto(slug?: string): Promise<void> {
    await this.page.goto(slug ? `/editor/${slug}` : '/editor');
  }

  async waitForLoad(): Promise<void> {
    await expect(this.publishButton).toBeVisible();
  }

  async fill(article: Partial<NewArticle>): Promise<void> {
    if (article.title !== undefined) await this.titleInput.fill(article.title);
    if (article.description !== undefined) await this.descriptionInput.fill(article.description);
    if (article.body !== undefined) await this.bodyInput.fill(article.body);
    for (const tag of article.tagList ?? []) {
      await this.tagsInput.fill(tag);
      await this.tagsInput.press('Enter');
    }
  }

  /** Publishes and returns the saved article as the API answered it, so the caller can clean it up by slug. */
  async publish(): Promise<Article> {
    const { article } = await captureJson<{ article: Article }>(
      this.page,
      { method: this.page.url().endsWith('/editor') ? 'POST' : 'PUT', path: /\/api\/articles/ },
      () => this.publishButton.click()
    );
    await expect(this.page).toHaveURL((url) => decodeURIComponent(url.pathname) === `/article/${article.slug}`);
    return article;
  }
}
