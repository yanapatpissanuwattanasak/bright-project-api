# Skill: clean-architecture

Guide for implementing Clean Architecture in the NestJS backend of the bright-portfolio API.

## When to use

Invoke with `/clean-architecture` when adding a new domain entity, use case, or module to the NestJS API.

## Layer Structure

```
src/
  <module>/
    domain/
      entities/          # Pure domain objects — no framework deps
      repositories/      # Interfaces only (IProjectRepository)
      value-objects/     # Immutable, self-validating values
    application/
      use-cases/         # One class per use case (GetPublishedProjectsUseCase)
      dtos/              # Input / output shapes for use cases
    infrastructure/
      persistence/       # TypeORM entities + repository implementations
      http/
        controllers/     # NestJS controllers — thin, delegate to use cases
        presenters/      # Map domain → HTTP response shape
    <module>.module.ts   # NestJS DI wiring
```

## Dependency Rule

Dependencies point **inward only**:

```
HTTP Controllers → Application (Use Cases) → Domain
Infrastructure (DB) → Domain (implements repository interfaces)
```

Domain knows nothing about NestJS, TypeORM, or HTTP.

## Adding a New Feature — Step-by-step

1. **Domain entity** in `domain/entities/<Entity>.ts`
   - Plain TypeScript class; no decorators
   - Validates its own invariants in the constructor or factory method

2. **Repository interface** in `domain/repositories/I<Entity>Repository.ts`
   - Define only the methods the domain needs
   - No TypeORM types in the interface

3. **Use case** in `application/use-cases/<Action><Entity>UseCase.ts`
   - Constructor-inject the repository interface
   - One `execute(dto)` method; returns domain objects or output DTOs
   - No HTTP types, no TypeORM types

4. **Persistence** in `infrastructure/persistence/`
   - TypeORM entity class (separate from domain entity)
   - Repository implementation that maps ORM entity ↔ domain entity

5. **Controller** in `infrastructure/http/controllers/<Entity>Controller.ts`
   - `@Controller`, `@Get`, etc.
   - Calls use case; maps result through presenter
   - No business logic here

6. **Wire DI** in `<module>.module.ts`
   - Bind `I<Entity>Repository` token to the TypeORM implementation
   - Register use case as provider

## Naming Conventions

| Layer | Suffix | Example |
|---|---|---|
| Domain entity | (none) | `Project` |
| Repository interface | `IRepository` | `IProjectRepository` |
| Use case | `UseCase` | `GetPublishedProjectsUseCase` |
| DTO | `Dto` | `CreateProjectDto` |
| ORM entity | `OrmEntity` | `ProjectOrmEntity` |
| Controller | `Controller` | `ProjectController` |
| Presenter | `Presenter` | `ProjectPresenter` |

## Injection Tokens

Use string constants for repository tokens to avoid circular deps:

```ts
export const PROJECT_REPOSITORY = 'PROJECT_REPOSITORY'
```

## Rules

- Domain layer has **zero** NestJS / TypeORM imports
- Use cases return domain objects or plain DTOs — never ORM entities
- Controllers are thin: validate input → call use case → return presenter output
- One use case per file; one responsibility per use case
