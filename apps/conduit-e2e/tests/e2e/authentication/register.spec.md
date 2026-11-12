# Sign-up Tests

**Spec:** `register.spec.ts`
**Feature:** Authentication > Sign up
**Tags:** `@auth`, `@smoke`

| SC     | Test                                                                   | Status    | Description                                                                            |
| ------ | ---------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------- |
| SC-003 | Signing up with new details signs the user straight in                 | Automated | A new account lands on the app already signed in, with the username in the header.     |
| SC-004 | Signing up with a taken username shows an error and creates no session | Automated | Usernames are unique; a collision is reported inline and the visitor stays signed out. |
