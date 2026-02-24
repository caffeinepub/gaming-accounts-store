# Specification

## Summary
**Goal:** Wire up the UK Gift Card submission flow end-to-end so that gift card number and balance are captured in the checkout UI and sent to the backend when placing an order.

**Planned changes:**
- Update `GiftCardPayment.tsx` to add "Gift Card Number" and "Gift Card Balance" text input fields, both required, with sunset theme styling, and expose their values to the parent via callback props or shared state
- Update `CheckoutPage.tsx` to capture `giftCardNumber` and `giftCardBalance` from `GiftCardPayment`, pass them to the `placeOrder` mutation when payment method is "Gift Card", and block order placement if either field is empty; pass empty strings for all other payment methods
- Update the `placeOrder` mutation in `useQueries.ts` to include `giftCardNumber` and `giftCardBalance` in the order payload, correctly handling `#ok`/`#err` result variants and invalidating query caches on success

**User-visible outcome:** Users selecting Gift Card as their payment method must now enter a gift card number and balance before they can confirm their order; these values are saved with the order record.
