# ADR-004: Soft Delete via Status Enum

**Status:** Accepted  
**Date:** 2026-05-05

## Context

Two approaches to "deleting" a project:
1. `deleted_at TIMESTAMPTZ` column — common soft-delete pattern
2. `status: 'archived'` — treating archived as a terminal state

## Decision

`status: 'archived'` as the delete mechanism.

## Rationale

The slug `UNIQUE` constraint must be preserved. If a project is hard-deleted, its slug cannot be reused (a new project with the same slug would confuse external links). If `deleted_at` is used, enforcing slug uniqueness among non-deleted rows requires a partial index — which is less legible than a simple enum check.

`ProjectStatus.ARCHIVED` is semantically accurate: the project still exists for historical reference, it is simply not shown publicly. The domain entity's `archive()` method is named for intent, not for the database operation.

## Consequences

- "Deleted" projects remain in the database — storage cost is negligible at portfolio scale
- Admin dashboard must filter out archived projects by default
- Slug of an archived project cannot be reused by a new project without explicitly changing the archived project's slug first
