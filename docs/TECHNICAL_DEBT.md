# BazarX Technical Debt & Future Improvements

This document tracks identified architectural issues, refactoring goals, and technical debts to be resolved in future development phases.

## 1. JWT Payload Optimization
- **Description:** Currently, user requests map `userId` -> `vendorId` via database lookup (`vendorRepo.findByUserId(userId)`). This results in an extra database query for every document-related request (and potentially other vendor-related requests).
- **Target Solution:** Add `vendorId` property to the JWT token payload inside the authentication service:
  ```typescript
  // JwtStrategy payload — future structure
  {
    id: userId,
    email,
    role,
    platform,
    vendorId   // ← Adding this avoids database lookup and decouples modules
  }
  ```
- **Benefits:**
  - Removes redundant MongoDB queries on every authenticated vendor request.
  - Eliminates the direct dependency of `DocumentsModule` on `VendorModule` for ID mapping, reducing circular dependency risks.
- **Dependencies:** Requires updates in `@barterborsa/shared-security` (JwtStrategy, token generation logic) and backend auth endpoints.
