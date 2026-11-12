# Article Tests

**Specs:** `editor.spec.ts`, `article.spec.ts`, `comments.spec.ts`
**Feature:** Articles > Articles
**Tags:** `@articles`, `@comments`, `@smoke`

## Editor

| SC     | Test                                                            | Status    | Description                                                                        |
| ------ | --------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------- |
| SC-005 | Publishing a new article opens it with its title, body and tags | Automated | The editor creates the article and redirects to it; everything typed is rendered.  |
| SC-006 | Editing the title of a published article shows the new title    | Automated | The editor loads an existing article's values and saving updates the article page. |

## Reading

| SC     | Test                                                               | Status    | Description                                                                   |
| ------ | ------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------- |
| SC-007 | Deleting your own article returns home and removes it from the API | Automated | The author's Delete removes the article for everyone, not just from the page. |
| SC-008 | Another author's article offers Follow and hides Edit and Delete   | Automated | Author-only controls are not offered on someone else's article.               |

## Comments

| SC     | Test                                                              | Status    | Description                                                                                 |
| ------ | ----------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| SC-009 | Posting a comment shows it under the article with the author name | Automated | A posted comment appears immediately, attributed to the signed-in user, and the box clears. |
| SC-010 | Deleting your own comment removes it from the page and the API    | Automated | The trash icon on your own comment deletes it on the server.                                |
