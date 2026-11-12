import type { HttpClient } from './http-client';
import type { Profile } from './types';

export async function followUser(client: HttpClient, username: string): Promise<Profile> {
  return (await client.post<{ profile: Profile }>(`profiles/${username}/follow`)).profile;
}
