import { uniqueName } from '@e2e/utils';
import { expect, test } from '../../../src/fixtures/test.fixture';

test.describe('Settings > Profile settings', () => {
  test.describe('Scenario: Editing the bio - SC-015', { tag: ['@settings'] }, () => {
    test('Saving a new bio shows it on the public profile', async ({ settingsPage, profilePage, freshUser, signInAs }) => {
      const bio = uniqueName('Writes end-to-end tests');

      await signInAs(freshUser);
      await settingsPage.goto();
      await settingsPage.waitForLoad();
      await settingsPage.updateProfile({ username: freshUser.user.username, email: freshUser.credentials.email, bio });

      await profilePage.expectPath(new RegExp(`/profile/${freshUser.user.username}$`));
      await profilePage.waitForLoad();
      await expect(profilePage.bio).toHaveText(bio);
    });
  });

  test.describe('Scenario: Logging out - SC-016', { tag: ['@settings', '@auth'] }, () => {
    test('Logging out from settings returns the header to its signed-out state', async ({ settingsPage, freshUser, signInAs }) => {
      await signInAs(freshUser);
      await settingsPage.goto();
      await settingsPage.waitForLoad();

      await settingsPage.logoutButton.click();

      await settingsPage.header.expectSignedOut();
    });
  });
});
