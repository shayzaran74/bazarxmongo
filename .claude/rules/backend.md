---
paths:
  - "apps/backend/**/*"
  - "packages/**/*"
---
# NestJS & DDD Guidelines

## Core Principles
- **Framework:** NestJS 10+ / Fastify adapter.
- Follow **Domain-Driven Design (DDD)**: Entity, AggregateRoot, ValueObject, UseCase, Repository pattern.
- Use **NestJS CQRS** module for handling business operations.
- **Outbox pattern:** Event güvenilirliği için zorunludur.
- Ensure **strict type safety** for all services and repositories.

## Infrastructure & Messaging
- **Databases:** PostgreSQL 16 (Core), MongoDB 7 (Delivery), Redis 7 (Cache).
- **Messaging:** RabbitMQ 3.13 (Event Bus).
- **Inter-service:** gRPC (senkron), RabbitMQ (asenkron).

## Structure
- **Domain:** Entities, Value Objects, Domain Events.
- **Application:** Commands, Queries, Handlers, DTOs.
- **Infrastructure:** Prisma/Mongoose Repositories, External Services, Mappers.

## Persistence
- Use **Prisma** (PostgreSQL) or **Mongoose** (MongoDB).
- Repositories must abstract persistence details from the domain layer.
- Use the **Unit of Work** pattern where transactions cross multiple aggregates.
