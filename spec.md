# Specification

## Summary
**Goal:** Rewrite the admin access gate in `AdminAccessControl.tsx` to use a single `useEffect` with an imperative async flow and run-once guard, eliminating infinite loops and perpetual loading states, and strip `AdminPanelPage.tsx` of all internal async gating logic.

**Planned changes:**
- Rewrite `AdminAccessControl.tsx` with a `useEffect` + `hasRun` ref guard that imperatively calls `getUsername` then `isAdminUsername` directly on the backend actor (no React Query hooks for gating)
- Use a local `status` state typed `'loading' | 'granted' | 'denied' | 'unauthenticated' | 'no-username'` to drive rendering: login prompt when unauthenticated, spinner only while loading, `ProfileSetupModal` if no username, children if granted, `AccessDeniedScreen` if denied
- Apply sunset theme (dusk backgrounds, sunset-gold/orange accents, Orbitron/Rajdhani fonts, glow effects) to the loading spinner and login prompt
- Rewrite `AdminPanelPage.tsx` to remove all internal async gates, `isAdminUsername` calls, loading/verifying states, and `useEffect` access checks — tabs render unconditionally when children are rendered
- Audit `useQueries.ts` to set `staleTime ≥ 60000` and `retry = 1` on any remaining `useUsername`/`useIsAdminUsername` hooks, and confirm neither is imported into `AdminAccessControl.tsx` for gate decisions

**User-visible outcome:** Navigating to `/admin` immediately shows a login prompt if unauthenticated, a brief spinner while resolving, and then instantly grants or denies access with no perpetual spinning or looping states.
