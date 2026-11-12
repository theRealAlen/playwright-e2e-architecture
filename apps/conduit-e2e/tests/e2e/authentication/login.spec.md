# Login Tests

**Spec:** `login.spec.ts`
**Feature:** Authentication > Login
**Tags:** `@auth`, `@smoke`

| SC     | Test                                                                            | Status    | Description                                                                                                           |
| ------ | ------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| SC-001 | Signing in with a registered account shows the username in the header           | Automated | An account registered over the API can sign in through the form, and the header switches to the signed-in navigation. |
| SC-002 | Signing in with a wrong password keeps the user on the login page with an error | Automated | A known email with the wrong password is refused with an inline error and no session.                                 |
| SC-002 | Signing in with an unknown email keeps the user on the login page with an error | Automated | An email with no account is refused the same way, without revealing whether the account exists.                       |
