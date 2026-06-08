# Prisma Help
This doc is only to help use Prisma and commands around it.

## Overview

Prisma is an ORM (Object-Relational Mapping) tool that provides type-safe database access with automatic migrations and seed management. This guide covers setup, migrations, seeding, and best practices for development and production environments.

## Installation

```bash
# Install Prisma CLI and Client
pnpm add -D prisma
pnpm add @prisma/client

# Initialize Prisma
npx prisma init
```

## Initial Setup

### 1. Configure Database Connection

**`.env.local` (Development)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/myapp_dev"
NODE_ENV="development"
```

**`.env.production` (Production)**
```env
DATABASE_URL="postgresql://prod_user:secure_password@prod-db.example.com:5432/myapp_prod"
NODE_ENV="production"
```

### 2. Define Schema

**`prisma/schema.prisma`**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id      Int     @id @default(autoincrement())
  title   String
  content String?
  author  User    @relation(fields: [authorId], references: [id])
  authorId Int
}
```

## NPM Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:migrate:reset": "prisma migrate reset",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:seed:reset": "prisma migrate reset --force && pnpm db:seed",
    "db:dev:setup": "pnpm db:migrate:reset && pnpm db:seed",
    "db:prod:deploy": "pnpm db:migrate:deploy"
  }
}
```

## Command Reference

### Development Workflow

| Command | Purpose | Use Case |
|---------|---------|----------|
| `db:migrate` | Create + apply migration | After schema changes |
| `db:seed:reset` | Reset DB + seed | Fresh local environment |
| `db:studio` | Open Prisma UI | Browse/edit data visually |
| `db:generate` | Generate Prisma Client | After schema changes (auto-run) |

```bash
# 1. Modify schema
# 2. Create migration
pnpm db:migrate --name add_posts_table

# 3. Reset local environment
pnpm db:seed:reset

# 4. Browse data
pnpm db:studio
```

### Production Deployment

| Command | Purpose | ⚠️ WARNING |
|---------|---------|-----------|
| `db:migrate:deploy` | Apply existing migrations | Use ONLY in production |
| `db:push` | Sync schema directly | ❌ Never use in production |
| `db:migrate:reset` | Drop + recreate DB | ❌ Never use in production |

```bash
# Production flow (migrations already exist)
git pull
pnpm install
pnpm db:migrate:deploy
pnpm start
```

## Seeding Data

### Create Seed File

**`prisma/seed.ts`**
```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete existing data
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob",
    },
  });

  // Create posts
  await prisma.post.create({
    data: {
      title: "First Post",
      content: "Hello world",
      authorId: user1.id,
    },
  });

  console.log("✅ Seeding completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Register Seed Script

**`package.json`**
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## Understanding Migrations

### What is a Migration?

A migration is a version-controlled SQL file tracking schema changes.

```
prisma/migrations/
├── 20250101120000_initial_schema/
│   └── migration.sql
├── 20250101130000_add_posts_table/
│   └── migration.sql
└── migration_lock.toml
```

### Common Migration Commands

```bash
# View migration status
pnpm prisma migrate status

# Create new migration
pnpm prisma migrate dev --name add_users_table

# Deploy existing migrations
pnpm prisma migrate deploy

# Resolve failed migration
pnpm prisma migrate resolve --applied <migration_name>

# Reset to start (local only)
pnpm prisma migrate reset
```

## Development Workflow

### 1. Initial Setup

```bash
# Clone repository
git clone <repo>

# Install dependencies
pnpm install

# Setup local database
pnpm db:dev:setup
```

### 2. Make Schema Changes

Edit `prisma/schema.prisma`:
```prisma
model Comment {
  id      Int     @id @default(autoincrement())
  text    String
  post    Post    @relation(fields: [postId], references: [id])
  postId  Int
}
```

### 3. Create Migration

```bash
pnpm db:migrate --name add_comments_table
```

This:
- Detects schema changes
- Generates SQL migration file
- Applies to local database
- Generates Prisma Client

### 4. Test with Seeds

```bash
pnpm db:seed:reset
pnpm db:studio
```

### 5. Commit to Git

```bash
git add prisma/migrations/
git add prisma/schema.prisma
git commit -m "feat: add comments table"
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] All migrations committed to git
- [ ] Schema matches production requirements
- [ ] Seed script updated (if needed)
- [ ] Tested locally with `db:seed:reset`

### Deploy Steps

```bash
# In CI/CD or production environment
git pull origin main

pnpm install

# ✅ Apply existing migrations only
pnpm db:migrate:deploy

# Start application
pnpm start
```

### Rollback (Emergency Only)

```bash
# View current status
pnpm prisma migrate status

# Resolve a deployment issue
pnpm prisma migrate resolve --rolled-back <migration_name>
```

## Using Prisma Client

### Basic Usage

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create
const user = await prisma.user.create({
  data: {
    email: "test@example.com",
    name: "Test User",
  },
});

// Read
const allUsers = await prisma.user.findMany();
const user = await prisma.user.findUnique({
  where: { email: "test@example.com" },
});

// Update
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: "New Name" },
});

// Delete
await prisma.user.delete({
  where: { id: 1 },
});
```

### Transactions

```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: "test@example.com" },
  });
  await tx.post.create({
    data: {
      title: "First Post",
      authorId: user.id,
    },
  });
});
```

## Best Practices

### ✅ Do

- Commit all migrations to git
- Use `db:migrate` in development
- Use `db:migrate:deploy` in production
- Write comprehensive seed scripts
- Test migrations locally first
- Use type-safe Prisma queries

### ❌ Don't

- Use `db:push` in production
- Use `db:migrate:reset` in production
- Skip schema reviews before deployment
- Hardcode database URLs
- Commit `.env` files
- Mix raw SQL with Prisma ORM

## Troubleshooting

### Schema Out of Sync

```bash
# Regenerate Prisma Client
pnpm db:generate

# Re-apply migrations
pnpm prisma migrate resolve --applied <migration_name>
```

### Reset Corrupted Local Database

```bash
pnpm db:seed:reset
```

### View Database

```bash
pnpm db:studio
```

### Check Migration Status

```bash
pnpm prisma migrate status
```

## Resources

- [Prisma Docs](https://www.prisma.io/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Database Optimization](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**Last Updated:** October 2025