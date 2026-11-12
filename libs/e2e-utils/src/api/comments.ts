import type { HttpClient } from './http-client';
import type { Comment } from './types';

export async function addComment(client: HttpClient, slug: string, body: string): Promise<Comment> {
  return (await client.post<{ comment: Comment }>(`articles/${slug}/comments`, { comment: { body } })).comment;
}

export async function listComments(client: HttpClient, slug: string): Promise<Comment[]> {
  return (await client.get<{ comments: Comment[] }>(`articles/${slug}/comments`)).comments;
}
