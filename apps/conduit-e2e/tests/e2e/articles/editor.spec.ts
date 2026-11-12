import { randomArticle } from '@e2e/utils';
import { expect, test } from '../../../src/fixtures/test.fixture';

test.describe('Articles > Editor', () => {
  test.describe('Scenario: Publishing a new article - SC-005', { tag: ['@articles', '@smoke'] }, () => {
    test('Publishing a new article opens it with its title, body and tags', async ({ editorPage, articlePage, apiClient, cleanup }) => {
      const draft = randomArticle();

      await editorPage.goto();
      await editorPage.waitForLoad();
      await editorPage.fill(draft);
      const article = await editorPage.publish();
      cleanup.add(`delete article ${article.slug}`, () => apiClient.delete(`articles/${article.slug}`));

      await articlePage.waitForLoad();
      await expect(articlePage.title).toHaveText(draft.title);
      await expect(articlePage.body).toContainText(draft.body);
      await expect(articlePage.tags).toContainText(draft.tagList);
    });
  });

  test.describe('Scenario: Editing an article - SC-006', { tag: ['@articles'] }, () => {
    test('Editing the title of a published article shows the new title', async ({
      editorPage,
      articlePage,
      testArticle,
      apiClient,
      cleanup,
    }) => {
      const newTitle = `${testArticle.title} (edited)`;

      await editorPage.goto(testArticle.slug);
      await editorPage.waitForLoad();
      await expect(editorPage.titleInput).toHaveValue(testArticle.title);

      await editorPage.fill({ title: newTitle });
      const edited = await editorPage.publish();
      cleanup.add(`delete article ${edited.slug}`, () => apiClient.delete(`articles/${edited.slug}`));

      await articlePage.waitForLoad();
      await expect(articlePage.title).toHaveText(newTitle);
    });
  });
});
