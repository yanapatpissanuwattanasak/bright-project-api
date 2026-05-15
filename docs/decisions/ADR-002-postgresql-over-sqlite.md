# ADR-002: PostgreSQL Over SQLite

**Status:** Accepted  
**Date:** 2026-05-05

## Context

SQLite would work for a single-admin CMS with low concurrency. It requires zero infrastructure setup.

## Decision

PostgreSQL on Railway.

## Rationale

- `text[]` (tech stack array) and `JSONB` (metrics, ADR content) require PostgreSQL — SQLite lacks native array and JSONB types
- `tsvector` generated column enables full-text search at zero query cost — a capability worth having even if unused in Phase 1
- Railway PostgreSQL is managed — zero operational overhead while demonstrating a production-appropriate choice
- SQLite cannot be shared across future services or accessed via a database GUI from a second machine

## Consequences

- Railway free tier has a 500MB limit — adequate for a portfolio
- Requires connection pooling awareness (Railway default pool is sufficient at low traffic)
- Migrations required (TypeORM migration CLI) — SQLite could skip this
