# Specification

## Summary
**Goal:** Fix admin authorization so that authenticated admin users can create, update, and delete products in the admin panel without receiving unauthorized errors.

**Planned changes:**
- Fix the backend (`backend/main.mo`) admin identity check in `createProduct`, `updateProduct`, and `deleteProduct` to use `msg.caller` principal comparison against the stored admin list instead of any session token or username string match.
- Fix the frontend `ProductForm` and `ProductManager` components to use the authenticated actor (from `useActor`) instead of an anonymous actor when calling product create, update, and delete mutations.

**User-visible outcome:** An admin user who is logged in via Internet Identity and has passed the PIN gate can successfully create, edit, and delete products in the admin panel without receiving "Unauthorized: Only admins can update products" errors. Non-admin users continue to be blocked.
