# Specification

## Summary
**Goal:** Fix the admin panel username entry form in `AdminAccessControl.tsx` so that it no longer silently does nothing on Enter key press or Submit button click, and provides proper feedback for all submission outcomes.

**Planned changes:**
- Wrap the form in a `<form>` element with an `onSubmit` handler; change the Submit button to `type="submit"` so both Enter key and button click trigger submission
- Call `event.preventDefault()` in the handler to prevent page reload, then invoke `isAdminUsername` with the typed username
- Add a local loading/spinner state that is active while the backend call is in-flight
- On backend returning `true`, transition status to `'granted'` and render children
- On backend returning `false`, transition status to `'denied'` and render `AccessDeniedScreen`
- Catch any thrown errors in a try/catch and display an inline error message beneath the input field
- Ensure the retry/back option on `AccessDeniedScreen` resets status back to the initial form state
- Preserve the existing sunset theme styling (dusk-bg/dusk-mid backgrounds, sunset-gold/sunset-orange accents, Orbitron/Rajdhani fonts)

**User-visible outcome:** Pressing Enter or clicking Submit in the admin username form always produces visible feedback — a loading indicator while checking, access granted or denied screens on result, and an inline error message if something goes wrong — with no more silent failures.
