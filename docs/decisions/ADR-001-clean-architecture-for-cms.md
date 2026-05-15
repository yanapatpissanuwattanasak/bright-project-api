# ADR-001: Clean Architecture for a Portfolio CMS

**Status:** Accepted  
**Date:** 2026-05-05

## Context

A portfolio CMS could be implemented as 3–4 Express routes with direct database queries. That is the simpler option. The technical overhead of Clean Architecture (domain / application / infrastructure / presentation layers, repository interfaces, use cases) is real.

## Decision

Four-layer Clean Architecture: Domain → Application → Infrastructure → Presentation.

## Rationale

The portfolio backend **is** the portfolio piece. Every EM evaluating this site is implicitly evaluating the architecture of the system serving it. A flat Express implementation would fail the implicit audit.

Specifically:
1. Domain entities (`Project.canPublish()`) enforce business rules independent of the HTTP layer — testable without starting the server
2. Repository interfaces allow TypeORM to be replaced (or mocked in tests) without touching use cases
3. Use cases are single-responsibility: `PublishProjectUseCase` can be unit-tested with a mock repository in under 5 lines

## Consequences

**Negative:**
- 4× more files than a flat implementation
- More DI configuration
- Onboarding a new developer takes longer

**Positive:**
- Each layer is independently testable
- TypeORM is confined to the infrastructure layer — no ORM decorators leak into domain entities
- Adding a new feature follows a clear path: entity → repository interface → use case → controller
- The architecture is self-documenting and legible to any senior engineer
