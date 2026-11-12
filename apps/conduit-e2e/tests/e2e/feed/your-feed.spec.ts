import { createArticle, deleteArticle, followUser } from '@e2e/utils';
import { expect, test } from '../../../src/fixtures/test.fixture';

test.describe('Feed > Your Feed', () => {
  test.describe('Scenario: Following an author - SC-011', { tag: ['@feed'] }, () => {
    test("Your Feed lists a followed author's new article", async ({ homePage, freshUser, otherUser, signInAs, cleanup }) => {
      await followUser(freshUser.client, otherUser.user.username);
      const article = await createArticle(otherUser.client);
      cleanup.add(`delete article ${article.slug}`, () => deleteArticle(otherUser.client, article.slug));

      await signInAs(freshUser);
      await homePage.waitForLoad();
      await homePage.feedTabs.open('Your Feed');

      const preview = homePage.articlePreview(article.title);
      await expect(preview.root).toBeVisible();
      await expect(preview.author).toContainText(otherUser.user.username);
    });

    test('Your Feed is empty for an account that follows nobody', async ({ homePage, freshUser, signInAs }) => {
      await signInAs(freshUser);
      await homePage.waitForLoad();
      await homePage.feedTabs.open('Your Feed');

      await expect(homePage.emptyFeed).toBeVisible();
    });
  });
});
