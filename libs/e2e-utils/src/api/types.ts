export interface User {
  username: string;
  email: string;
  token: string;
  bio: string | null;
  image: string | null;
}

export interface Credentials {
  username: string;
  email: string;
  password: string;
}

export interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}

export interface Comment {
  id: number;
  body: string;
  author: Profile;
}

export interface NewArticle {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}
