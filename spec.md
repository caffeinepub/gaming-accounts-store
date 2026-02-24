# Specification

## Summary
**Goal:** Replace the existing auto-resolved admin gate in `AdminAccessControl.tsx` with a manual username-entry form that checks the typed username against the backend whitelist.

**Planned changes:**
- Rewrite `frontend/src/components/AdminAccessControl.tsx` to always render a username-entry form when the admin panel is accessed, regardless of authentication state.
- The form includes a heading ("Admin Access"), a text input labelled "Enter your username", and a "Submit" button.
- On submit, pass the typed username directly to the backend `isAdminUsername` function.
- If the backend returns `true`, render the admin panel children; if `false`, render `AccessDeniedScreen` with an access-denied message.
- Show a loading/spinner state only while the `isAdminUsername` call is in-flight.
- Remove all auto-resolution logic, silent `getUsername` calls, and React Query username hooks from the gate decision.
- Style the form with the sunset theme (dusk-bg/dusk-mid backgrounds, sunset-gold/sunset-orange accents, Orbitron/Rajdhani fonts, sunset glow effects).

**User-visible outcome:** When navigating to the admin panel, users always see a username input form. They must manually type their username and submit to gain access; only whitelisted usernames are granted entry.
