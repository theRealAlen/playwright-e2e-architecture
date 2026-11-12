import { baseTest, signInInBrowser, appUrl, type UserHandle } from '@e2e/utils';
import { ArticlePage, EditorPage, HomePage, LoginPage, ProfilePage, RegisterPage, SettingsPage } from '../pages';
import { AUTH_FILE } from '../paths';

type ConduitFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  editorPage: EditorPage;
  articlePage: ArticlePage;
  settingsPage: SettingsPage;
  profilePage: ProfilePage;
  signInAs: (user: UserHandle) => Promise<void>;
};

export const test = baseTest.extend<ConduitFixtures>({
  authFile: [AUTH_FILE, { scope: 'worker' }],

  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  editorPage: async ({ page }, use) => use(new EditorPage(page)),
  articlePage: async ({ page }, use) => use(new ArticlePage(page)),
  settingsPage: async ({ page }, use) => use(new SettingsPage(page)),
  profilePage: async ({ page }, use) => use(new ProfilePage(page)),

  signInAs: async ({ page }, use) => {
    await use((user) => signInInBrowser(page, appUrl(), user.user.token));
  },
});

export { expect } from '@playwright/test';
