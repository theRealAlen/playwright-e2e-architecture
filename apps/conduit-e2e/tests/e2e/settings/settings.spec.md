# Profile Settings Tests

**Spec:** `settings.spec.ts`
**Feature:** Settings > Profile settings
**Tags:** `@settings`, `@auth`

| SC     | Test                                                                 | Status    | Description                                                                     |
| ------ | -------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------- |
| SC-015 | Saving a new bio shows it on the public profile                      | Automated | Settings saves the bio and redirects to the profile, which renders it.          |
| SC-016 | Logging out from settings returns the header to its signed-out state | Automated | Logout drops the session and the navigation switches back to Sign in / Sign up. |

## Notes

- The settings form never pre-fills on this deployment, and it submits every field. Saving with only the bio typed would blank the username and email, so the page object fills all three.
