# ADR-005: JWT Stateless Auth for Single-Admin CMS

**Status:** Accepted  
**Date:** 2026-05-05

## Context

The admin panel has exactly one user. Auth options:
1. Session-based (cookie + server-side session store)
2. JWT stateless (access token + refresh token in HttpOnly cookie)

## Decision

JWT with short-lived access token (15 min) + refresh token in HttpOnly cookie (7 days).

## Rationale

Session-based auth requires a session store (Redis or DB table) — adding infrastructure for one user is unnecessary.

JWT is stateless: the API pod doesn't need shared state to validate tokens. This matters if Railway scales to multiple instances, but is also simply cleaner for a single-admin use case.

The refresh token in an HttpOnly cookie (not accessible via JavaScript) prevents token theft via XSS — the primary threat for admin credentials in a browser.

## Consequences

- Token revocation requires the short expiry to expire (15 min) — acceptable for a portfolio admin
- If the access token is leaked, the attacker has at most 15 minutes before it expires
- Refresh endpoint is rate-limited (10 attempts/IP/15 min) to prevent brute force
- `cookie-parser` is required in the NestJS bootstrap
