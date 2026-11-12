# Claude: playwright-e2e-architecture

For any test work, use the `e2e-test` skill (`.claude/skills/e2e-test/SKILL.md`).

- Use `npm` for installs and scripts (`npm ci`, `npm run`, `npx`).
- Import shared code from `@e2e/utils`, and `test`/`expect` from the suite's `src/fixtures/test.fixture`.
- Before finishing: `npm run lint && npm run typecheck && npm run e2e:check-ids && npm run e2e:check-plans`.
