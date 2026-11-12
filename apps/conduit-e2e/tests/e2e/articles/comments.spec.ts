import { addComment, listComments, uniqueName } from '@e2e/utils';
import { expect, test } from '../../../src/fixtures/test.fixture';

test.describe('Articles > Comments', () => {
  test.describe('Scenario: Posting a comment - SC-009', { tag: ['@articles', '@comments'] }, () => {
    test('Posting a comment shows it under the article with the author name', async ({ articlePage, testArticle, session }) => {
      const text = uniqueName('A comment');

      await articlePage.goto(testArticle.slug);
      await articlePage.waitForLoad();
      await articlePage.postComment(text);

      const comment = articlePage.comment(text);
      await expect(comment.body).toHaveText(text);
      await expect(comment.author).toHaveText(session.user.username);
      await expect(articlePage.commentInput).toHaveValue('');
    });
  });

  test.describe('Scenario: Deleting a comment - SC-010', { tag: ['@articles', '@comments'] }, () => {
    test('Deleting your own comment removes it from the page and the API', async ({ articlePage, testArticle, apiClient }) => {
      const text = uniqueName('Short-lived comment');
      await addComment(apiClient, testArticle.slug, text);

      await articlePage.goto(testArticle.slug);
      await articlePage.waitForLoad();
      await articlePage.comment(text).delete();

      await expect(articlePage.comment(text).root).toBeHidden();
      await expect.poll(async () => (await listComments(apiClient, testArticle.slug)).map((c) => c.body)).not.toContain(text);
    });
  });
});
