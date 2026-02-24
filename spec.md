# Specification

## Summary
**Goal:** Fix the permanent "connecting" spinner on the Admin panel by rewriting the admin access control flow, stripping redundant loading states from the admin page, and ensuring the backend actor initialises correctly in production.

**Planned changes:**
- Rewrite `AdminAccessControl.tsx` with a self-contained local `status` state (`'connecting' | 'form' | 'checking' | 'granted' | 'denied' | 'timeout'`) that polls actor availability on mount, transitions to the username entry form as soon as the actor is ready, and shows a timeout error message after 10 seconds instead of spinning indefinitely
- The username entry form renders with a heading, labelled text input, and submit button; both Enter key and button click trigger submission; backend errors are displayed inline; `AccessDeniedScreen` retry resets to `'form'`; sunset theme applied throughout
- Audit and strip `AdminPanelPage.tsx` of any internal `isAdminUsername` calls, `useEffect` gates, loading/verifying states, or spinner logic — the page renders all tabs (Products, Orders, Payments, Admins, Subscriptions, Settings) immediately and unconditionally once `AdminAccessControl` grants access, with "Products" as the default tab
- Audit `useActor.ts` to ensure the agent host is `https://ic0.app` in production, the canister ID resolves from the correct source, initialisation errors are surfaced to consumers, and the actor re-creates correctly on login/logout

**User-visible outcome:** Navigating to `/admin` will either show the username entry form within seconds (when the actor is available) or display a clear error message after 10 seconds — the permanent spinning loader will no longer occur.
