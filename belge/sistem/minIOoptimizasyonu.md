# Walkthrough — MinIO Bucket Splitting & Document Service

We have successfully divided the MinIO bucket configuration into two separate buckets and implemented the **Vendor Document Service** to securely upload, list, download, and delete vendor documents.

---

## 🖼️ Part 1: MinIO Bucket Splitting

### 1. Created `MinioConfigService`
- **Path:** [minio-config.service.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/media/infrastructure/minio-config.service.ts)
- Automates initialization of `bazarx-media` (public-read) and `bazarx-documents` (private) buckets on startup.

### 2. Upgraded `MinioStorageAdapter`
- **Path:** [minio-storage.adapter.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/media/infrastructure/minio-storage.adapter.ts)
- Dynamically selects the bucket based on the `subPath` or `mediaId` prefix (e.g. `documents/...` goes to the private bucket).
- Skips Sharp image resizing for documents or non-image files, uploading them directly.
- Resolves private document access requests automatically into S3 presigned URLs.

---

## 📂 Part 2: Vendor Document Service (DDD / CQRS)

We created a fully self-contained `documents` module to manage vendor-specific accounting and tax documents.

### 1. Domain Layer
- **Document Type Enum:** [document-type.enum.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/documents/domain/enums/document-type.enum.ts)  
  Defines `INVOICE`, `STATEMENT`, `TAX_DOCUMENT`, `ACCOUNTING`, and `OTHER` types.
- **DDD Entity:** [vendor-document.entity.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/documents/domain/entities/vendor-document.entity.ts)  
  Carries all attributes of a vendor document and encapsulates the ownership logic rule (`isOwnedBy`).
- **Repository Interface:** [vendor-document.repository.interface.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/documents/domain/repositories/vendor-document.repository.interface.ts)  
  Defines ports for find, save, and delete.

### 2. Infrastructure & Persistence Layer
- **Mongoose Schema:** [vendor-document.schema.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/documents/infrastructure/persistence/schemas/vendor-document.schema.ts)  
  Local Mongoose schema schema definition.
- **Mongoose Repository:** [mongo-vendor-document.repository.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/documents/infrastructure/persistence/mongo-vendor-document.repository.ts)  
  Adapter implementation mapping Mongoose documents to DDD entities.

### 3. Application & Service Layer
- **Document Service:** [document.service.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/documents/application/services/document.service.ts)  
  Implements the use-cases:
  - `uploadDocument`: Saves to private bucket first. Saves to DB. Cleans up S3 on DB save failure.
  - `getSignedUrl`: Enforces ownership before generating a 60-minute S3 presigned URL.
  - `listDocuments`: Lists documents for a vendor.
  - `deleteDocument`: Enforces ownership before removing from DB and S3.

### 4. Presentation & REST Layer
- **Vendor REST Controller:** [vendor-document.controller.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/documents/presentation/vendor-document.controller.ts)  
  Registers endpoints under `/api/v1/vendors/me/documents` secured with `JwtAuthGuard` and Swagger decorators.
  - `POST /` (Upload file)
  - `GET /` (List vendor documents)
  - `GET /:id/url` (Get signed URL)
  - `DELETE /:id` (Delete file)
- **Admin REST Controller:** [vendor-document-admin.controller.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/documents/presentation/vendor-document-admin.controller.ts)  
  Registers admin endpoints under `/api/v1/admin/vendors` secured with `JwtAuthGuard`, `RolesGuard`, and `@Roles('ADMIN', 'SUPER_ADMIN')`.
  - `GET /:vendorId/documents` (List all documents of a vendor)
  - `GET /documents/:id/url` (Get 15-minute signed URL, bypassing ownership checks)
  - `DELETE /documents/:id` (Delete vendor document, bypassing ownership checks)

### 5. NestJS Integration
- **Module Registration:** [documents.module.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/documents/documents.module.ts)  
  Integrates CQRS, Mongoose models, and exports services. Registers both `VendorDocumentController` and `VendorDocumentAdminController`.
- **Global App Integration:** Registered inside [app.module.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/app.module.ts).

---

## 💻 Part 3: Frontend Refactoring & Composable Optimization

We refactored how public and private images/documents are resolved in Nuxt 3 to eliminate fragile URL substring scanning and improve security.

### 1. Refactored `useAppImage` Composable
- **Path:** [useAppImage.ts](file:///Users/macbook/Desktop/bazarx/apps/frontend/composables/useAppImage.ts)
- Removed `NUXT_PUBLIC_MINIO_BASE` scanning logic completely.
- Added `getPublicImageUrl` and `getImageUrl` which output `/api/v1/media/{objectKey}` mapped via the proxy, ensuring a single unified pathway.
- Maintained strict backward compatibility for older templates using `resolveImageUrl` (with inline extraction logic for deprecated `/bazarx-media/` strings if they reside in legacy DB records).

### 2. Created `useDocumentUrl` Composable
- **Path:** [useDocumentUrl.ts](file:///Users/macbook/Desktop/bazarx/apps/frontend/composables/useDocumentUrl.ts)
- Exposes `fetchSignedUrl(vendorId, documentId)`, `loading`, `error`, and `url` variables.
- Dynamically resolves paths: normal vendors route through `/api/v1/vendors/me/documents/...` while admins route through `/api/v1/admin/vendors/documents/...` using `authStore.isAdmin`.
- Auto-renews S3 presigned URLs automatically by setting up a background timer `5 minutes` before the 15-minute (admin) or 60-minute (vendor) TTL expiration.

### 3. Cleanup of `useAdminBrands` Composable
- **Path:** [useAdminBrands.ts](file:///Users/macbook/Desktop/bazarx/apps/frontend/composables/useAdminBrands.ts)
- Updated brand image resolution logic to route through `/api/v1/media/...` rather than referencing `config.public.minioBase`.

### 4. Environment Variables Refactoring
- **Active `.env`:** Removed `NUXT_PUBLIC_MINIO_BASE` from [active .env](file:///Users/macbook/Desktop/bazarx/apps/frontend/.env).
- **Template `.env.example`:** Removed variable and added Turkish explanatory comments to [env example](file:///Users/macbook/Desktop/bazarx/apps/frontend/.env.example).
- **Nuxt Configuration:** Removed `minioBase` from public runtime config in [nuxt.config.ts](file:///Users/macbook/Desktop/bazarx/apps/frontend/nuxt.config.ts).

---

## 📹 Part 4: Backend Media Stream Endpoint

We implemented a secure public stream proxy endpoint on the backend to allow fetching media assets from MinIO (or local storage dev fallback) via a unified URL structure `/api/v1/media/...` without exposing MinIO publicly.

### 1. Created `MediaStreamService`
- **Path:** [media-stream.service.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/media/application/services/media-stream.service.ts)
- Exposes `streamObject(objectKey)` and `objectExists(objectKey)`.
- Restricts access to private document resources (rejects requests where first path segment is `documents`).
- Implements path traversal validation (rejects `..` or absolute paths).
- Determines correct MIME-Type based on file extension and reads ETag.
- Streams files directly from S3 (`bazarx-media` public bucket) or fallback local folder using Node streams (avoiding loading files entirely in memory).

### 2. Updated `MediaController`
- **Path:** [media.controller.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/media/presentation/media.controller.ts)
- Exposes `GET /media/:objectKey(*)` using wildcard parameter pattern.
- Removed class-level `JwtAuthGuard` and `ApiBearerAuth` so this GET stream route is public (accessible by guest users), and applied the guards individually to the POST upload route.
- Pipes the retrieved stream directly to the Express response object with appropriate HTTP headers:
  - `Content-Type`: resolved mime-type
  - `Content-Length`: resource size
  - `Cache-Control`: `public, max-age=86400` (1-day caching)
  - `ETag`: MinIO object ETag or local fallback mtime weak-etag.

### 3. Integrated Service in Module
- **Path:** [media.module.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/media/media.module.ts)
- Provided and exported `MediaStreamService` inside `MediaModule`.

---

## 🧪 Verification Results
- **Backend Build:** `pnpm --filter @bazarx/backend build` -> **SUCCESS** (Compiled without any errors).
- **Frontend Type Check:** `pnpm --filter ecommerce-frontend type-check` -> **SUCCESS**
- **Frontend Build:** `pnpm --filter ecommerce-frontend build` -> **SUCCESS**
- **Technical Debt Logging:** Logged the long-term JWT payload optimization in [TECHNICAL_DEBT.md](file:///Users/macbook/Desktop/bazarx/docs/TECHNICAL_DEBT.md).
