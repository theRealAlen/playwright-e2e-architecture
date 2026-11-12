import type { HttpClient } from './http-client';
import type { Credentials, User } from './types';
import { uniqueSuffix } from '../helpers/unique';

export function randomCredentials(): Credentials {
  const id = uniqueSuffix();
  return { username: `e2e${id}`, email: `e2e+${id}@example.test`, password: `Pw-${id}!` };
}

export async function registerUser(
  anonClient: HttpClient,
  credentials = randomCredentials()
): Promise<{ user: User; credentials: Credentials }> {
  const { user } = await anonClient.post<{ user: User }>('users', { user: credentials });
  return { user, credentials };
}

export async function currentUser(client: HttpClient): Promise<User> {
  return (await client.get<{ user: User }>('user')).user;
}

export async function updateUser(client: HttpClient, changes: Partial<Pick<User, 'bio' | 'image' | 'username' | 'email'>>): Promise<User> {
  return (await client.put<{ user: User }>('user', { user: changes })).user;
}
