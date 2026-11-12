# Feed Tests

**Specs:** `your-feed.spec.ts`, `favorites.spec.ts`, `home-states.spec.ts`
**Feature:** Feed > Feed
**Tags:** `@feed`, `@favorites`, `@mocked`

## Your Feed

| SC     | Test                                                  | Status    | Description                                                                  |
| ------ | ----------------------------------------------------- | --------- | ---------------------------------------------------------------------------- |
| SC-011 | Your Feed lists a followed author's new article       | Automated | Following an author puts their new articles in the follower's personal feed. |
| SC-011 | Your Feed is empty for an account that follows nobody | Automated | A brand-new account sees the empty state, not the global feed.               |

## Favorites

| SC     | Test                                                                                | Status    | Description                                                                                 |
| ------ | ----------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| SC-012 | Favoriting an article bumps its count and lists it under the user's Favorited Posts | Automated | The heart button increments the count and the article shows on the favoriter's profile tab. |

## Home page states

| SC     | Test                                                               | Status    | Description                                                                          |
| ------ | ------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------ |
| SC-013 | Popular Tags lists exactly the tags the API returns                | Automated | The sidebar renders the tag list from `GET /tags`, in order. The response is mocked. |
| SC-014 | The global feed shows the empty state when the API has no articles | Automated | An empty article list renders the "No articles" message. The response is mocked.     |

## Notes

- Feed tests sign in as a `freshUser` so no other test can follow or post into the same feed.
- The practice backend scopes article lists per account: `?author=` and `?favorited=` only return the caller's own articles, and the global feed shows only seed content. Your Feed is the one list that shows another account's articles. That is why favorites use the user's own article, and why anything asserting on global-feed contents mocks the response.
