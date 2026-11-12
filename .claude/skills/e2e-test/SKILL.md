---
name: e2e-test
description: Write, extend, debug or review Playwright tests in this repo (apps/conduit-e2e, apps/conduit-api-e2e, libs/e2e-utils). Use for any spec, page object, component object, fixture, seeding helper, SC-NNN scenario or .spec.md plan.
---

# Writing E2E tests

## Rules

1. **Seed via API, assert via UI.** Click only through the flow under test.
2. **No raw locators in specs.** Selectors live in page or component objects. ESLint enforces this.
3. **Every scenario `describe` ends in `SC-NNN`**, unique across all suites. UI tests use SC-001 to SC-099, API tests SC-101 and up.
4. **Every spec file is named by exactly one `.spec.md` plan**, with one row per `test()` and the title verbatim.
5. **No sleeps.** Use web-first `expect`, `expect.poll`, or `pollUntil` for backend state.
6. **Reuse first.** Read `libs/e2e-utils/src/index.ts` and the suite's `src/pages` / `src/components` barrels before adding anything.

## Order of work

1. **Pick the suite.** Browser behaviour goes in `apps/conduit-e2e`. Pure API contract tests go in `apps/conduit-api-e2e`.
2. **Reserve an id:** `npm run e2e:check-ids` prints the next free one.
3. **Find the plan.** `grep -rl '^\*\*Feature:\*\* <Main> > <Sub>' apps/*/tests` usually finds an existing plan: add rows to it. Only start a new one (`templates/spec.md.template`) when the area has none.
4. **Read the real DOM** before writing a selector: `npx playwright codegen <url>`, `--ui`, or the
   `error-context.md` snapshot of a failed run. Never guess labels.
5. **Seed.** Prefer, in order:
   1. a fixture: `testArticle`, `freshUser`, `otherUser`, `test.use({ articleCount })`
   2. an existing API helper
   3. a new helper in `libs/e2e-utils/src/api/`, exported from the barrel
6. **Objects.**
   - A page object extends `BasePage`, has `goto()` and implements `waitForLoad()` by asserting on content that appears last.
   - A component object takes a root `Locator` and hangs every locator off it.
   - Add both to the suite's barrel and fixture.
7. **Spec.** Use `templates/spec.ts.template`: a feature `describe`, then `Scenario: … - SC-NNN` with tags, then tests titled in the present tense.
8. **Run it twice:** `npm run e2e:ui -- --grep SC-NNN --repeat-each 2 --retries 0`.
9. **Before pushing:** `npm run lint && npm run typecheck && npm run e2e:check-ids && npm run e2e:check-plans`.

## Cleanup

Anything a test creates outside a seeding fixture gets registered right away:

```ts
const article = await editorPage.publish();
cleanup.add(`delete article ${article.slug}`, () => apiClient.delete(`articles/${article.slug}`));
```

If the UI changes an id (an edit that renames a slug), register the new one too.

## Titles

Say what the system does, specific enough that a red test names the broken behaviour. Banned: _correctly,
properly, successfully, works, should, verify, handles_.

- ✗ `Edit article works`
- ✓ `Editing the title of a published article shows the new title`

## Plan notes

Notes record facts about the **system** that a maintainer would otherwise get wrong: shared state, serial mode, backend quirks. How a locator or helper works goes in a code comment instead.

## Reviewing

Check the rules above, then:

- Assertions are auto-retrying.
- Created names come from `uniqueName` / `randomArticle`.
- Nothing seeded is left without cleanup.
- Raised timeouts are justified.
- The test fails when the behaviour it guards is broken.
