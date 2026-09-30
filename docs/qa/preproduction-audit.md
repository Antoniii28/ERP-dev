# Preproduction audit — JAFORA ERP

## Scope reviewed
Repository structure, authentication/RBAC, company scoping, organizations, customers/suppliers/products/inventory, sales/purchases/finance, dashboard/reports, CRM/insights, environment configuration, CI and web session handling.

## Fixed in this hardening branch
- Added authenticated company context to authorization middleware.
- Enforced company isolation in core operations, commercial/finance and Phase 5 analytics/CRM. A tenant-bound user cannot request or write another company by changing companyId.
- Fixed purchase inventory upsert to use MongoDB update operators consistently ($set + $inc) and validators.
- Preserved unrestricted cross-company behavior only for users that do not have a company assigned (current platform administrator model).

## Critical gate before public production
- Commercial operations still span multiple documents. Wrap sale/purchase + inventory + finance writes in MongoDB transactions before production financial use.
- Web feature screens use independent fetch helpers. Centralize API access and implement one refresh/retry path for expired access tokens.
- Refresh token remains in localStorage. Migrate browser refresh sessions to Secure + HttpOnly + SameSite cookies before security sign-off.
- Replace the custom JWT implementation with a maintained JOSE/JWT library or complete a dedicated security review.
- Apply tenant scoping to user/role/organization administration according to the final platform-admin vs company-admin policy.

## Important follow-up
- Add audit log records for authentication, user/role changes, inventory adjustments and financial/commercial writes.
- Add integration tests for RBAC, tenant isolation, stock concurrency, session expiry and commercial consistency.
- Add inventory movement history instead of relying only on absolute stock values.
- Define cancellation/reversal flows for sales and purchases instead of deleting or manually compensating data.
- Add pagination/date filters to growing report, finance and CRM collections.
- Production configuration must define strong secrets, exact CORS origins, HTTPS, production MongoDB access and service health monitoring.

## Status
Functional phases 1–5 are validated as a prototype. This branch begins the production-hardening gate. Public deployment should wait until the critical gate above is addressed and QA passes.
