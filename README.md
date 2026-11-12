# Playwright E2E Architecture

A reference Playwright setup for a product with more than one test suite: a shared library, a UI suite and an
API suite, written against the [RealWorld "Conduit"](https://github.com/gothinkster/realworld) practice app.
The app is a stand-in. The point is the structure, conventions and guard rails, which carry over to any product.

```
libs/e2e-utils/          shared by every suite
  api/                   HttpClient over APIRequestContext + one seeding module per resource
  auth/                  session storage: log in by writing storageState, not by typing
  components/            component objects used on every page (header, article preview, errors)
  config/                env + the Playwright config every suite spreads
  email/                 one inbox interface for Mailpit locally / a hosted inbox in deployed envs
  fixtures/              baseTest: clients, seeded data, cleanup stack
  helpers/               network capture & mocking, pollUntil, unique names
  pages/                 BasePage
apps/conduit-e2e/        UI suite: page objects, component objects, specs + .spec.md plans
apps/conduit-api-e2e/    API suite: no browser, same lib, same fixtures
scripts/                 guard scripts run on pre-push and in CI
.claude/skills/e2e-test/ the workflow, written for an AI agent and humans alike
```

## Running

```bash
npm ci
cp .env.example .env          # defaults point at the public practice deployment
npx playwright install chromium

npm run e2e:api
npm run e2e:ui
npm run e2e:ui -- --grep SC-012 --repeat-each 3     # one scenario, flake-checked
npm run e2e:ui -- --grep @smoke --ui
```

No credentials are needed: each run registers its own accounts.

## Ideas worth stealing

**Seed through the API, assert through the UI.** Every precondition is created with `libs/e2e-utils/api`
helpers or fixtures. A test only clicks through the flow it is actually testing.

**Fixtures do the arranging.**

- `testArticle` / `testArticles`: seeded data. `test.use({ articleCount: 5 })` changes how many.
- `freshUser`: a brand-new account for tests that need isolation. `signInAs(freshUser)` drives the browser as that user.
- `otherUser`: a second account per worker, for anything that needs two people.
- `apiClient` / `anonClient`: worker-scoped HTTP clients, so one request context per worker instead of one per test.
- `cleanup`: a LIFO stack every helper and test can push teardown onto. It runs even when the test fails,
  treats a 404 as already gone, and reports every other failure together instead of stopping at the first.

**Log in once, through storage.** The `setup` project registers a user over the API and writes the token
straight into a `storageState` file. No suite types into a login form except the login spec itself.
Logged-out specs live under `tests/e2e/authentication/` and run in their own project without that state.

**A thin, typed seeding client.** `newApiContext` builds one request context per identity: base URL, auth
token and extra headers in one place. `createHttpClient` turns it into typed JSON calls and throws an
`ApiError` with method, URL, status and body, so a seeding failure explains itself and cleanup can ignore a 404. Only reads retry, and only on socket errors (Playwright's `maxRetries`), so a retried write can never
double-create.

**Network helpers that compose.**

- `captureJson(page, matcher, action)` returns the API response a click triggered, e.g. the slug of the
  article the editor just created, so the test can clean it up.
- `mockJson` fulfils matching requests and lets everything else through.
- `applyRouteHeaders` adds headers (a rate-limit bypass, a tenant id) to every API request.

The last two both use `route.fallback()`, never `route.continue()`. `continue` ends the handler chain, so a
spec's own mock would silently drop the injected headers, or the reverse.

**Failures that explain themselves.** `withRejectedResponses` wraps a UI flow. When the flow stalls, the error
lists every 4xx/5xx the API returned during it, instead of a bare "timeout waiting for URL".

**Page and component objects, enforced.**

- A page object extends `BasePage`, owns `goto()`, and must implement `waitForLoad()` by asserting on
  content that appears last, never `networkidle`.
- A component object takes a root `Locator` and scopes every locator to it.
- Specs contain **zero** raw locators. ESLint fails the build if one appears, and also on `waitForTimeout`,
  `networkidle`, `force: true` and `test.only`.

**Scenario IDs and plans.**

- Every scenario `describe` ends in `SC-NNN`, unique across _all_ suites.
- Every spec file is named by exactly one `.spec.md` plan. The plan has one row per `test()`, with the title verbatim.
- Two scripts enforce this on pre-push:
  - `check-scenario-ids` catches two branches that took the same "next free" id, which git merges without a conflict.
  - `check-all-plans` catches plans that drifted from the tests they describe.

**Plans record what the system does.** Plan notes capture facts that cost time to rediscover. For this backend,
for example: list endpoints only return the caller's own articles, and the settings form never pre-fills.

## Hooks

`lefthook` runs Prettier and ESLint on staged files at pre-commit. At pre-push it runs the scenario-ID
guard, the plan checker and a full typecheck.

## CI

The `E2E` workflow runs only on demand, so it never creates accounts on the shared practice site unattended:
**Actions → E2E → Run workflow**, optionally with a `grep` such as `SC-012` or `@smoke`. It runs lint, types and
the guards first, then the API suite alongside the UI suite split across 2 shards. Each suite gets a merged HTML
report and a job summary.

## Writing a test

Follow `.claude/skills/e2e-test/SKILL.md`. The order is: reserve an id, write or extend the plan, explore
the real DOM, seed, add page or component objects, write the spec, then run it twice.
