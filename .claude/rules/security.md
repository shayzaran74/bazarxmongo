---
paths:
  - "apps/backend/**/*"
  - "apps/frontend/**/*"
---
# Security & Access Control Guidelines

## 🔐 Authentication & RBAC
- **Strict Guarding:** Every admin-only endpoint must be guarded with `@AdminOnly()` or equivalent decorator.
- **Role Hierarchy:** Ensure roles cannot escalate. An admin can manage vendors, but a vendor should NEVER have access to admin modules.
- **JWT Integrity:** Do not store sensitive info in JWT beyond `userId`, `vendorId`, and `role`.

## 🛡️ Data Isolation (Multi-Tenancy)
- **Vendor Context:** In vendor-specific controllers, always extract `vendorId` from the request context (token), never from the request body or query string.
- **Resource Ownership:** Before updating or deleting any resource (Product, Order, Inventory), verify that `resource.vendorId === currentUser.vendorId`.

## 📝 Auditing
- **Audit Logs:** Use the `AuditLogService` for:
  - Any balance changes (Financial).
  - Any system setting changes (Admin).
  - Any user/vendor status changes (Admin).
- **Log Format:** Always include `actorId`, `action`, `resourceId`, `oldValue`, and `newValue`.
