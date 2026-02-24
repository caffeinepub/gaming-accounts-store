# Specification

## Summary
**Goal:** Replace the existing admin panel gate with a 4-digit PIN system (PIN: 2006) backed by a per-principal lockout mechanism in the backend.

**Planned changes:**
- Add `verifyAdminPin` and `getAdminPinLockoutStatus` functions to `backend/main.mo` with stable maps tracking failed attempts and lockout expiry per principal; lockout triggers after 4 failed attempts and lasts 1 hour
- Update `backend/migration.mo` to initialise the new stable maps without affecting existing data
- Add `useVerifyAdminPin` mutation and `useAdminPinLockoutStatus` query hooks to `frontend/src/hooks/useQueries.ts`
- Rewrite `frontend/src/components/AdminAccessControl.tsx` to show a login prompt for unauthenticated users, then a sunset-themed 4-digit PIN entry form for authenticated users, with inline error messages for wrong PIN or lockout, and no remaining username-based logic
- Audit `frontend/src/pages/AdminPanelPage.tsx` to remove all internal gate logic so it renders its tabbed content immediately once access is granted by `AdminAccessControl`

**User-visible outcome:** Admins must first log in via Internet Identity, then enter the PIN "2006" to access the admin panel. After 4 wrong attempts the form is locked for 1 hour with a countdown message. Correct PIN grants immediate access to all admin tabs.
