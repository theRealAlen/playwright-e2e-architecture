import { test } from '../../../src/fixtures/test.fixture';

test.describe('Authentication > Login', () => {
  test.describe('Scenario: Signing in with valid credentials - SC-001', { tag: ['@auth', '@smoke'] }, () => {
    test('Signing in with a registered account shows the username in the header', async ({ loginPage, freshUser }) => {
      await loginPage.goto();
      await loginPage.waitForLoad();

      await loginPage.signIn(freshUser.credentials);

      await loginPage.header.expectSignedInAs(freshUser.user.username);
    });
  });

  test.describe('Scenario: Rejecting bad credentials - SC-002', { tag: ['@auth'] }, () => {
    const cases = [
      { title: 'a wrong password', credentials: (email: string) => ({ email, password: 'not-the-password' }) },
      { title: 'an unknown email', credentials: () => ({ email: 'nobody-here@example.test', password: 'whatever-1' }) },
    ];

    for (const scenario of cases) {
      test(`Signing in with ${scenario.title} keeps the user on the login page with an error`, async ({ loginPage, freshUser }) => {
        await loginPage.goto();
        await loginPage.waitForLoad();

        await loginPage.submit(scenario.credentials(freshUser.credentials.email));

        await loginPage.errors.expectMessage(/invalid/i);
        await loginPage.expectPath(/\/login$/);
        await loginPage.header.expectSignedOut();
      });
    }
  });
});
