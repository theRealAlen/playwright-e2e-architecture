import { expect, test } from '../../../src/fixtures/test.fixture';

test.describe('Feed > Favorites', () => {
  test.describe('Scenario: Favoriting an article - SC-012', { tag: ['@feed', '@favorites'] }, () => {
    test("Favoriting an article bumps its count and lists it under the user's Favorited Posts", async ({
      profilePage,
      testArticle,
      session,
    }) => {
      await profilePage.goto(session.user.username);
      await profilePage.waitForLoad();
      const preview = profilePage.articlePreview(testArticle.title);
      await preview.expectFavoritesCount(0);

      await preview.toggleFavorite();
      await preview.expectFavoritesCount(1);

      await profilePage.tabs.open('Favorited Posts');
      await expect(profilePage.articlePreview(testArticle.title).root).toBeVisible();
    });
  });
});
