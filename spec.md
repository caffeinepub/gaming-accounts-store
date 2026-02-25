# Specification

## Summary
**Goal:** Fix the end-to-end order placement flow so that every order placed by a user is immediately visible in the admin panel's Orders and Payments tabs.

**Planned changes:**
- Fix `backend/main.mo`: ensure `placeOrder` correctly assigns all required fields (including `approvalStatus: #pending`, `giftCardNumber`, `giftCardBalance`), inserts the order into the stable orders map with the correct key, and `getOrders()` returns all orders without filtering.
- Fix `frontend/src/hooks/useQueries.ts`: ensure the `placeOrder` mutation awaits the actor call, passes all required fields, properly unwraps `#ok`/`#err` results, and invalidates the `orders` query cache on success.
- Fix `frontend/src/pages/CheckoutPage.tsx`: ensure `placeOrder` is called with all required fields, gift card fields are collected and passed correctly, errors are shown to the user via toast/error message, and successful orders navigate to the confirmation page.
- Audit and fix `frontend/src/components/admin/OrderManager.tsx` and `PaymentsManager.tsx`: ensure both use the correct `orders` query key matching what `placeOrder` invalidates, and that neither component contains filtering logic that hides newly placed orders.

**User-visible outcome:** After a user completes checkout, the new order appears immediately in both the admin Orders and Payments tabs without requiring a manual page refresh.
