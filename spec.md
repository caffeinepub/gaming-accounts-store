# Specification

## Summary
**Goal:** Fix subscription tiers auto-seeding and ensure orders placed by users appear correctly in the admin panel Orders and Payments tabs.

**Planned changes:**
- Auto-seed the four default subscription tiers (Starter £2.99/mo, Basic £5.99/mo, Premium £9.99/mo, Pro £14.99/mo) at actor construction/upgrade time in `backend/main.mo` using a stable boolean flag, removing the admin-whitelist guard from the seeding path so it never throws "Unauthorized"
- Remove the "Initialize Default Tiers" button and related UI from `frontend/src/components/admin/SubscriptionManager.tsx`; replace the empty state with a neutral message (no initialization button)
- Trace and fix the end-to-end order placement flow in `backend/main.mo`, `frontend/src/pages/CheckoutPage.tsx`, and `frontend/src/hooks/useQueries.ts` so that completed orders are persisted to stable storage and appear in the admin Orders and Payments tabs immediately after checkout
- Ensure the `placeOrder` mutation correctly awaits the actor call, unwraps `#ok`/`#err`, and surfaces errors as toast notifications instead of failing silently
- Update `backend/migration.mo` to handle any new stable variables (e.g. `subscriptionTiersInitialized` flag) introduced by the seeding fix without losing existing data

**User-visible outcome:** Subscription tiers load automatically in the admin Subscriptions tab without any manual initialization or "Unauthorized" errors, and orders placed by users immediately appear in the admin Orders and Payments tabs.
