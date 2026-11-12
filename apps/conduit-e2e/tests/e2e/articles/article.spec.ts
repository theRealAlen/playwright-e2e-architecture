import { ApiError, createArticle, deleteArticle, getArticle } from '@e2e/utils';
import { expect, test } from '../../../src/fixtures/test.fixture';

test.describe('Articles > Reading', () => {
  test.describe('Scenario: Deleting an article - SC-007', { tag: ['@articles'] }, () => {
    test('Deleting your own article returns home and removes it from the API', async ({
      articlePage,
      homePage,
      testArticle,
      anonClient,
    }) => {
      await articlePage.goto(testArticle.slug);
      await articlePage.waitForLoad();

      await articlePage.deleteArticle();

      await homePage.expectPath(/^\/$/);
      await expect(getArticle(anonClient, testArticle.slug)).rejects.toThrow(ApiError);
    });
  });

  test.describe("Scenario: Someone else's article - SC-008", { tag: ['@articles'] }, () => {
    test("Another author's article offers Follow and hides Edit and Delete", async ({ articlePage, otherUser, cleanup }) => {
      const article = await createArticle(otherUser.client);
      cleanup.add(`delete article ${article.slug}`, () => deleteArticle(otherUser.client, article.slug));

      await articlePage.goto(article.slug);
      await articlePage.waitForLoad();

      await expect(articlePage.followButton(otherUser.user.username)).toBeVisible();
      await expect(articlePage.editButton).toBeHidden();
      await expect(articlePage.deleteButton).toBeHidden();
    });
  });
});
