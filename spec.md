# Specification

## Summary
**Goal:** Add an order approval system with admin Payments tab, UK Gift Card checkout fields, and buyer-facing order status notifications.

**Planned changes:**
- Add `approvalStatus` (`#pending`/`#approved`/`#declined`), `giftCardNumber`, and `giftCardBalance` fields to the Order type in the backend, defaulting to `#pending` and empty strings respectively
- Add backend migration to upgrade existing orders with the new fields
- Expose admin-gated `approveOrder` and `declineOrder` backend functions that verify caller is a whitelisted admin
- Expose a `getOrdersByBuyer` query function returning all orders for a given principal including approval status
- Add `useApproveOrder`, `useDeclineOrder`, and `useOrdersByBuyer` React Query hooks in `useQueries.ts`; all mutations invalidate the orders cache on success
- Update `GiftCardPayment.tsx` to capture required 'Gift Card Number' and 'Gift Card Balance' input fields during checkout
- Update `placeOrder` mutation and `CheckoutPage.tsx` to pass `giftCardNumber` and `giftCardBalance` (empty strings for non-gift-card methods)
- Create `PaymentsManager.tsx` admin component listing all orders with buyer details, payment method badge, colour-coded approval status badge, gift card fields for relevant orders, and Approve/Decline buttons with toast feedback — styled with the sunset theme
- Add a 'Payments' tab to `AdminPanelPage.tsx` that renders `PaymentsManager`, without disrupting existing tabs
- Update `OrderConfirmationPage.tsx` to display the live `approvalStatus` with colour-coded indicator (amber/green/red), polling every 30 seconds

**User-visible outcome:** Admins can view all orders in a new Payments tab, approve or decline them, and see gift card details for relevant orders. Buyers see a live, colour-coded order approval status on their order confirmation page. Gift card checkout now captures and stores the card number and balance.
