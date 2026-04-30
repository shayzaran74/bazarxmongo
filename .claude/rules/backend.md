---
paths:
  - "apps/backend/**/*"
  - "packages/**/*"
---
# NestJS & DDD Guidelines

## Core Principles
- Follow **Domain-Driven Design (DDD)**.
- Use **NestJS CQRS** module for handling business operations.
- Ensure **strict type safety** for all services and repositories.

## Structure
- **Domain:** Entities, Value Objects, Domain Events.
- **Application:** Commands, Queries, Handlers, DTOs.
- **Infrastructure:** Prisma Repositories, External Services, Mappers.

## Persistence
- Use **Prisma** for PostgreSQL services.
- Repositories must abstract Prisma details from the domain layer.
- Use the **Unit of Work** pattern where transactions cross multiple aggregates.
