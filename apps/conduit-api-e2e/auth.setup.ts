import { request, test as setup } from '@playwright/test';
import { appUrl, createHttpClient, newApiContext, registerUser, saveSession } from '@e2e/utils';
import { AUTH_FILE } from './src/paths';

setup('register the shared session user', async () => {
  const context = await newApiContext(request);
  saveSession(AUTH_FILE, appUrl(), await registerUser(createHttpClient(context)));
  await context.dispose();
});
