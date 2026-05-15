# bright-portfolio-api

> NestJS + PostgreSQL backend for bright.dev — Clean Architecture CMS for portfolio project management.
> [API docs](https://api.bright.dev/docs) · [Frontend repo](https://github.com/ynpbright/bright-portfolio)

## What This Is

A NestJS REST API with four Clean Architecture layers (Domain → Application → Infrastructure → Presentation) serving a portfolio CMS. Single-admin with JWT auth, PostgreSQL with JSONB case study content, full-text search via `tsvector`.

## Why I Built It This Way

5 backend ADRs document every key decision:
- [ADR-001](./docs/decisions/ADR-001-clean-architecture-for-cms.md) — Why 4 layers for a CMS that could be 3 routes
- [ADR-002](./docs/decisions/ADR-002-postgresql-over-sqlite.md) — Why managed PostgreSQL over SQLite
- [ADR-003](./docs/decisions/ADR-003-jsonb-for-metrics-and-adr.md) — Why JSONB for semi-structured content
- [ADR-004](./docs/decisions/ADR-004-soft-delete-via-status.md) — Why status enum over `deleted_at`
- [ADR-005](./docs/decisions/ADR-005-jwt-stateless-auth.md) — Why stateless JWT for single-admin CMS

## Tech Stack

| Technology | Version | Why |
|---|---|---|
| NestJS | 10 | DI container maps to Clean Architecture layers |
| TypeORM | 0.3 | Explicit migrations, repository pattern |
| PostgreSQL | 16 | `text[]`, JSONB, `tsvector` |
| JWT + Passport | — | Stateless auth, refresh token in HttpOnly cookie |

## Local Development

```bash
npm install
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, etc.
npm run migration:run
npm run start:dev
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Access token signing secret |
| `JWT_EXPIRES_IN` | Yes | e.g. `15m` |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret |
| `JWT_REFRESH_EXPIRES_IN` | Yes | e.g. `7d` |
| `RESEND_API_KEY` | Yes | Email notifications on contact submission |
| `NOTIFICATION_EMAIL` | Yes | Where contact notifications are sent |
| `FRONTEND_URL` | Yes | CORS allowed origin |

## Database

```bash
# Run all migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate migration from entity changes
npm run migration:generate -- src/infrastructure/database/migrations/MigrationName
```

## Architecture Diagram

```
Request → Controller (Presentation)
       → Use Case (Application)
       → Repository Interface (Domain)
       → TypeORM Repository (Infrastructure)
       → PostgreSQL
```

Domain entities are pure TypeScript with zero framework imports — testable without starting the server.

## Project Status

**Phase 2 (current target):** Wire TypeORM repository implementations, run migrations on Railway.  
**Phase 3:** Admin CRUD + JWT auth endpoints.
