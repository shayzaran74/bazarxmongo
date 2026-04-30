---
paths:
  - "apps/backend/src/modules/commerce/**/*"
  - "apps/backend/src/modules/inventory/**/*"
---
# Commerce & Order Safety Guidelines

## 🛡️ Critical Safety Rules
- **Price Integrity:** NEVER trust the price sent from the frontend/cart. Always re-calculate or fetch from the Product/Catalog service during order creation.
- **Stock Lock (Reservation):** Stock must be reserved *before* payment or final order confirmation to prevent overselling.
- **Atomic Transactions:** Order creation and stock decrement MUST happen within a single database transaction. Use the `IUnitOfWork` or Prisma `$transaction`.
- **Idempotency:** Every order creation request must include a unique `clientMutationId` or `idempotencyKey` to prevent duplicate orders on network retries.

## 📦 Flow Validation
- **Cart to Order:** Validate that the user still has access to all items in the cart (e.g., items aren't deleted or disabled).
- **Status Machine:** Use strict state transitions for Orders (e.g., PENDING -> PAID -> SHIPPED). NEVER skip states.

## 🧪 Audit Checklist
- Check for "Race Conditions" in stock updates.
- Verify that `InventoryService.decrementStock` is called within the order transaction.
- Ensure `StructuredLogger` tracks every step of the checkout flow with `orderId`.
