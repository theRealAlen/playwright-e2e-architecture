import { randomCredentials } from '@e2e/utils';
import { test } from '../../../src/fixtures/test.fixture';

test.describe('Authentication > Sign up', () => {
  test.describe('Scenario: Creating an account - SC-003', { tag: ['@auth', '@smoke'] }, () => {
    test('Signing up with new details signs the user straight in', async ({ registerPage }) => {
      const credentials = randomCredentials();

      await registerPage.goto();
      await registerPage.waitForLoad();
      await registerPage.submit(credentials);

      await registerPage.header.expectSignedInAs(credentials.username);
    });
  });

  test.describe('Scenario: Duplicate accounts - SC-004', { tag: ['@auth'] }, () => {
    test('Signing up with a taken username shows an error and creates no session', async ({ registerPage, freshUser }) => {
      await registerPage.goto();
      await registerPage.waitForLoad();

      await registerPage.submit({ ...randomCredentials(), username: freshUser.user.username });

      await registerPage.errors.expectMessage(/username.*(taken|exists)/i);
      await registerPage.header.expectSignedOut();
    });
  });
});
