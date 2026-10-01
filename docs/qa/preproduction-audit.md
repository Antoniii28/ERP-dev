# Preproduction audit — JAFORA ERP

## Scope reviewed
Repository structure, authentication/RBAC, company scoping, organizations, customers/suppliers/products/inventory, sales/purchases/finance, dashboard/reports, CRM/insights, environment configuration, CI and web session handling.

## Fixed in this hardening branch
- Added MongoDB transactions for sale/purchase + inventory + finance consistency.
- Added centralized web API access with automatic access-token refresh/retry across the main ERP screens.
- Added health liveness and database readiness endpoints for deployment monitoring.
- Added production environment fail-fast checks, proxy awareness and safer production error responses.
- Added audit logging foundation and coverage for users, roles, organization, master data, inventory, CRM and commercial/financial writes.
- Fixed dashboard/insights low-stock calculation across multiple branches.
- Improved CRM permission independence and added CRM completion/update flow.
- Added authenticated company context to authorization middleware.
- Enforced company isolation in core operations, commercial/finance and Phase 5 analytics/CRM. A tenant-bound user cannot request or write another company by changing companyId.
- Fixed purchase inventory upsert to use MongoDB update operators consistently ($set + $inc) and validators.
- Preserved unrestricted cross-company behavior only for users that do not have a company assigned (current platform administrator model).

## Critical gate before public production

## Remaining security gate
- Refresh token remains in localStorage. Migrate browser refresh sessions to Secure + HttpOnly + SameSite cookies before security sign-off.
- Replace the custom JWT implementation with a maintained JOSE/JWT library or complete a dedicated security review.

## Important follow-up
- Add integration tests for RBAC, tenant isolation, stock concurrency, session expiry and commercial consistency.
- Add inventory movement history instead of relying only on absolute stock values.
- Define cancellation/reversal flows for sales and purchases instead of deleting or manually compensating data.
- Add pagination/date filters to growing report, finance and CRM collections.
- Production configuration must define strong secrets, exact CORS origins, HTTPS, production MongoDB access and service health monitoring.

## Status
Functional phases 1–5 are validated as a prototype. Production hardening is substantially advanced. Tenant-aware user/role administration is now enforced. Public deployment should wait for the remaining authentication/session security decision and the preproduction QA pass.
