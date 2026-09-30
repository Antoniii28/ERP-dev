# Phase 4 closeout and repository review

## Phase 4 status
Sales, purchases and finance are implemented and connected to inventory. The commercial UI now prevents repeated submissions while a request is in flight, shows success feedback, and clears transaction-specific fields after success. Sale stock deduction was changed to an atomic conditional inventory update to reduce overselling under concurrent requests.

## Review findings before production deployment

### High priority
- Multi-company isolation is not yet enforced from the authenticated user's company on all list/update endpoints. Several endpoints accept companyId from request/query or return unscoped records. This is acceptable for the current administrator prototype but must be hardened before exposing tenant accounts.
- Commercial writes span multiple MongoDB documents (sale/purchase, inventory and finance). They are not yet wrapped in MongoDB transactions. Partial failure can leave inventory, commercial documents and finance out of sync.
- Access-token refresh is only performed during initial AuthProvider restoration. Feature pages use independent fetch helpers and do not automatically refresh/retry a request after a 401.
- Refresh tokens are stored in localStorage. Before production, prefer Secure, HttpOnly, SameSite cookies and CSRF-aware handling.
- The custom HS256 token implementation should be replaced or hardened with a maintained JOSE/JWT library before production security sign-off.

### Medium priority
- No automated integration tests currently protect RBAC, tenant isolation, inventory changes, duplicate submissions or commercial/finance consistency.
- Audit logging is not yet implemented for security-sensitive and financial mutations.
- Phase 4 currently supports one product line per sale/purchase from the UI/API payload. Multi-line documents are a later ERP enhancement.
- Manual inventory setting can overwrite stock without recording an inventory movement/history.
- Production deploy still needs environment/CORS validation, health checks, logging policy and deployment configuration.
- Dashboard content still describes the early foundation and should be replaced with real KPIs in Phase 5.

## Recommended gate
Treat Phase 4 as functionally closed for continued development, but do not label the ERP production-ready yet. Phase 5 should add dashboard/reporting/CRM/analytics foundation. Before public deployment, complete a production-hardening pass for tenant isolation, transaction consistency, authentication refresh/storage, audit logs and automated tests.
