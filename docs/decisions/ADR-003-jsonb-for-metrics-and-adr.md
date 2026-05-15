# ADR-003: JSONB for Metrics and Architecture Decisions

**Status:** Accepted  
**Date:** 2026-05-05

## Context

Two fields — `metrics` and `architecture_decisions` — could be modelled as separate normalised tables or as JSONB columns.

## Decision

JSONB for both.

## Rationale

**`metrics`:** Shape is `{ label: string, value: string }[]`. This is display data, not queryable taxonomy. A separate `project_metrics` table would require a join on every project query for a feature that will never be filtered or aggregated. The structure is defined by the application, not the database.

**`architecture_decisions`:** Shape is `{ context, decision, rationale, consequences }[]` per project. Adding a new field (e.g., `status: "superseded"`) would require a migration on a normalised table. With JSONB, the application schema evolves without a database migration.

**Contrast with `tags`:** Tags ARE normalised — they are filterable, reusable across projects, and have their own identity. JSONB would make tag filtering O(N) table scans. This distinction is documented explicitly.

## Consequences

- No SQL queries can filter/aggregate metrics or ADR fields (acceptable — neither has a filtering requirement)
- Application is responsible for validating JSONB shape (handled by class-validator DTOs at the presentation layer)
- JSONB is indexed via GIN if full-text search on ADR content becomes a requirement
