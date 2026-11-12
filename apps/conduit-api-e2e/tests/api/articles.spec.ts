import { createArticle, favoriteArticle, getArticle, randomArticle } from '@e2e/utils';
import { expect, test } from '../../src/fixtures/test.fixture';

test.describe('API > Articles', () => {
  test.describe('Scenario: Creating an article - SC-101', { tag: ['@api', '@articles'] }, () => {
    test('Creating an article returns it with a slug and the caller as author', async ({ apiClient, session, cleanup }) => {
      const draft = randomArticle();

      const article = await createArticle(apiClient, draft);
      cleanup.add(`delete article ${article.slug}`, () => apiClient.delete(`articles/${article.slug}`));

      expect(article.slug).toBeTruthy();
      expect(article).toMatchObject({ title: draft.title, description: draft.description, body: draft.body, favoritesCount: 0 });
      expect(article.tagList).toEqual(draft.tagList);
      expect(article.author.username).toBe(session.user.username);
    });
  });

  test.describe('Scenario: Rejected writes - SC-102', { tag: ['@api', '@articles'] }, () => {
    test('Creating an article without a title is refused with a validation error', async ({ apiClient }) => {
      const response = await apiClient.raw('POST', 'articles', { article: { ...randomArticle(), title: '' } });

      expect(response.status()).toBe(422);
      expect(await response.json()).toHaveProperty('errors');
    });

    test('Creating an article without a token is refused as unauthorized', async ({ anonClient }) => {
      const response = await anonClient.raw('POST', 'articles', { article: randomArticle() });

      expect(response.status()).toBe(401);
    });

    test("Deleting another user's article is refused and leaves it in place", async ({ apiClient, otherUser, testArticle }) => {
      const response = await otherUser.client.raw('DELETE', `articles/${testArticle.slug}`);

      expect(response.status()).toBeGreaterThanOrEqual(401);
      expect(response.status()).toBeLessThan(500);
      await expect(getArticle(apiClient, testArticle.slug)).resolves.toMatchObject({ slug: testArticle.slug });
    });
  });

  test.describe('Scenario: Favorites - SC-103', { tag: ['@api', '@favorites'] }, () => {
    test('Favoriting an article increments its count for every reader', async ({ otherUser, testArticle, anonClient }) => {
      const favorited = await favoriteArticle(otherUser.client, testArticle.slug);

      expect(favorited).toMatchObject({ favorited: true, favoritesCount: 1 });
      await expect(getArticle(anonClient, testArticle.slug)).resolves.toMatchObject({ favoritesCount: 1, favorited: false });
    });
  });
});
