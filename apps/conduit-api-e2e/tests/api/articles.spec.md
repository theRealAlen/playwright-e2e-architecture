# Articles API Tests

**Spec:** `articles.spec.ts`
**Feature:** API > Articles
**Tags:** `@api`, `@articles`, `@favorites`

| SC     | Test                                                                   | Status    | Description                                                                                   |
| ------ | ---------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| SC-101 | Creating an article returns it with a slug and the caller as author    | Automated | `POST /articles` echoes the payload, generates a slug, and attributes it to the token's user. |
| SC-102 | Creating an article without a title is refused with a validation error | Automated | An empty title is a 422 with an `errors` body.                                                |
| SC-102 | Creating an article without a token is refused as unauthorized         | Automated | Writes need a token; anonymous `POST /articles` is a 401.                                     |
| SC-102 | Deleting another user's article is refused and leaves it in place      | Automated | Only the author can delete; the article still resolves after the refused call.                |
| SC-103 | Favoriting an article increments its count for every reader            | Automated | The favorite is counted globally but `favorited` stays per-reader.                            |

## Notes

- API scenarios use SC-1xx so UI and API ids never compete for the same range.
