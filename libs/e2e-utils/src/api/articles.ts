import type { HttpClient } from './http-client';
import type { Article, NewArticle } from './types';
import { uniqueSuffix } from '../helpers/unique';

export function randomArticle(overrides: Partial<NewArticle> = {}): NewArticle {
  const id = uniqueSuffix();
  return {
    title: `E2E article ${id}`,
    description: `About ${id}`,
    body: `Body of the article ${id}.`,
    tagList: [`e2e${id}`],
    ...overrides,
  };
}

export async function createArticle(client: HttpClient, overrides: Partial<NewArticle> = {}): Promise<Article> {
  return (await client.post<{ article: Article }>('articles', { article: randomArticle(overrides) })).article;
}

export async function getArticle(client: HttpClient, slug: string): Promise<Article> {
  return (await client.get<{ article: Article }>(`articles/${slug}`)).article;
}

export async function deleteArticle(client: HttpClient, slug: string): Promise<void> {
  await client.delete(`articles/${slug}`);
}

export async function favoriteArticle(client: HttpClient, slug: string): Promise<Article> {
  return (await client.post<{ article: Article }>(`articles/${slug}/favorite`)).article;
}
