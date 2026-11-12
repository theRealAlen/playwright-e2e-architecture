import { mockJson } from '@e2e/utils';
import { expect, test } from '../../../src/fixtures/test.fixture';

test.describe('Feed > Home page states', () => {
  test.describe('Scenario: Popular tags come from the API - SC-013', { tag: ['@feed', '@mocked'] }, () => {
    test('Popular Tags lists exactly the tags the API returns', async ({ page, homePage }) => {
      const tags = ['mocked-alpha', 'mocked-beta', 'mocked-gamma'];
      await mockJson(page, { method: 'GET', path: /\/api\/tags$/ }, { tags });

      await homePage.goto();
      await homePage.waitForLoad();

      await expect(homePage.tagSidebar.tags).toHaveText(tags);
    });
  });

  test.describe('Scenario: Empty global feed - SC-014', { tag: ['@feed', '@mocked'] }, () => {
    test('The global feed shows the empty state when the API has no articles', async ({ page, homePage }) => {
      await mockJson(page, { method: 'GET', path: /\/api\/articles$/ }, { articles: [], articlesCount: 0 });

      await homePage.goto();
      await homePage.waitForLoad();
      await homePage.feedTabs.open('Global Feed');

      await expect(homePage.emptyFeed).toBeVisible();
      await expect(homePage.previews).toHaveCount(0);
    });
  });
});
