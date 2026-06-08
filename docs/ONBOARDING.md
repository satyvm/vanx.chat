# Developer Onboarding Guide

Welcome to vanx.chat! This guide will help you understand the project structure, get your development environment set up, and start contributing.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Architecture Deep Dive](#architecture-deep-dive)
7. [Database & Prisma](#database--prisma)
8. [Common Tasks](#common-tasks)
9. [Coding Standards](#coding-standards)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

Vanx.chat is an AI interaction hub that allows users to chat with various LLM providers (OpenAI, Google Gemini, Groq, Anthropic, xAI). The project is built as a monorepo using:

- **pnpm workspaces** for package management
- **Turborepo** for build orchestration and caching
- **NestJS** for the backend API
- **Next.js 15** for the web dashboard
- **Astro** for the marketing site
- **PostgreSQL** with Prisma ORM for data persistence
- **Redis** for caching and job queues

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | >= 22 | [nodejs.org](https://nodejs.org) or use nvm |
| pnpm | 10.18.3 | `npm install -g pnpm@10.18.3` |
| Docker | Latest | [docker.com](https://docker.com) |
| Docker Compose | Latest | Included with Docker Desktop |
| Git | Latest | [git-scm.com](https://git-scm.com) |

**Recommended VS Code Extensions:**
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript + JavaScript

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vanx.chat
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all dependencies across all workspaces.

### 3. Set Up Environment Variables

```bash
# Copy example env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Edit the `.env` files with your local configuration:

**apps/api/.env**
```env
# Database (Docker will use these)
POSTGRES_USER=vanx
POSTGRES_PASSWORD=vanx
POSTGRES_HOST=localhost
POSTGRES_DB=vanx
POSTGRES_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# LLM API Keys (add as needed)
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
ANTHROPIC_API_KEY=...

# App URLs
WEB_APP_URL=http://localhost:3000
PORT=3001
```

**apps/web/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Start Infrastructure (Database & Redis)

```bash
# Start PostgreSQL and Redis containers
pnpm docker:up
```

Wait for the containers to be healthy (check with `docker ps`).

### 5. Set Up the Database

```bash
# Generate Prisma client
pnpm --filter @vanx/database db:generate

# Run migrations
pnpm --filter @vanx/database db:migrate

# (Optional) Seed with test data
pnpm --filter @vanx/database db:seed
```

### 6. Start Development Servers

```bash
# Start all apps in development mode
pnpm dev
```

This starts:
- **API**: http://localhost:3001
- **Web**: http://localhost:3000
- **WWW**: http://localhost:4321

---

## Project Structure

```
vanx.chat/
├── apps/
│   ├── api/                 # NestJS Backend API
│   │   ├── src/
│   │   │   ├── auth/        # Authentication module
│   │   │   ├── chat/        # Chat & LLM module
│   │   │   ├── users/       # User management
│   │   │   ├── mail/        # Email service
│   │   │   ├── prisma/      # Database service
│   │   │   └── config/      # Configuration
│   │   ├── test/            # E2E tests
│   │   └── prisma/          # (Legacy - use packages/database)
│   │
│   ├── web/                 # Next.js Dashboard
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utilities & API clients
│   │
│   └── www/                 # Astro Marketing Site
│       └── src/
│           ├── pages/       # Astro pages
│           ├── layouts/     # Page layouts
│           └── i18n/        # Internationalization
│
├── packages/
│   ├── database/            # Prisma schema & client
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── generated/   # Generated Prisma client
│   │   └── src/             # Database utilities
│   │
│   ├── ui/                  # Shared React components
│   │   └── src/
│   │       ├── components/  # Radix UI + Tailwind
│   │       ├── hooks/       # Shared hooks
│   │       └── styles/      # Global CSS
│   │
│   ├── eslint-config/       # Shared ESLint configs
│   └── typescript-config/   # Shared TypeScript configs
│
├── docs/                    # Documentation
├── docker-compose.yml       # Local development
└── turbo.json               # Turborepo configuration
```

---

## Development Workflow

### Running Individual Apps

```bash
# API only
pnpm --filter @vanx/api dev

# Web only
pnpm --filter @vanx/web dev

# Marketing site only
pnpm --filter @vanx/www dev
```

### Building

```bash
# Build all packages and apps
pnpm build

# Build specific app
pnpm --filter @vanx/api build
```

### Type Checking

```bash
# Check all workspaces
pnpm check-types

# Check specific app
pnpm --filter @vanx/web check-types
```

### Linting

```bash
# Lint all workspaces
pnpm lint

# Lint with auto-fix
pnpm --filter @vanx/api lint -- --fix
```

### Testing

```bash
# Run API unit tests
pnpm --filter @vanx/api test

# Run with watch mode
pnpm --filter @vanx/api test:watch

# Run E2E tests
pnpm --filter @vanx/api test:e2e

# Run with coverage
pnpm --filter @vanx/api test:cov
```

---

## Architecture Deep Dive

### Backend (NestJS)

The API follows a modular architecture:

```
Module/
├── module.ts         # Module definition
├── controller.ts     # HTTP endpoints
├── service.ts        # Business logic
├── dto/              # Data Transfer Objects (validation)
│   ├── create-x.dto.ts
│   └── update-x.dto.ts
└── entities/         # Entity definitions
    └── x.entity.ts
```

**Key Modules:**

| Module | Purpose |
|--------|---------|
| `ChatModule` | LLM interactions, message streaming |
| `AuthModule` | JWT authentication, login/signup |
| `UsersModule` | User CRUD operations |
| `MailModule` | Email sending with Bull queues |
| `PrismaModule` | Database connection |

**Authentication Flow:**
1. User signs up → Email verification sent
2. User verifies email → Account activated
3. User logs in → Access + Refresh tokens issued
4. Access token expires → Use refresh token to get new pair
5. Refresh token expires → User must log in again

### Frontend (Next.js)

Uses App Router with Server Components by default:

```
app/
├── page.tsx              # Home page (Server Component)
├── layout.tsx            # Root layout
├── chat/
│   ├── page.tsx          # Chat list (Server Component)
│   └── [chatId]/
│       └── page.tsx      # Individual chat page
└── login/
    └── page.tsx          # Login page
```

**Key Patterns:**
- Server Components for data fetching
- Client Components only when needed (`'use client'`)
- API calls in `lib/api/` directory
- Shared UI from `@vanx/ui` package

### LLM Provider Architecture

The chat module uses an adapter pattern for LLM providers:

```typescript
// Factory creates appropriate adapter
const model = llmFactory.getModel('google', 'gemini-2.5-flash');

// All adapters implement same interface
interface LLMAdapter {
  getModel(modelId: string): LanguageModel;
}
```

Supported providers: OpenAI, Google, Groq, Anthropic, xAI

---

## Database & Prisma

### Schema Location

The Prisma schema is in `packages/database/prisma/schema.prisma`.

### Current Models

```
User
├── id (UUID)
├── name
├── email (unique)
├── password (hashed)
├── refreshToken
├── emailVerifiedAt
├── chats[] (1-to-many)
└── verificationCodes[] (1-to-many)

Chat
├── id (UUID)
├── title
├── description
├── body (JSON string - messages)
├── user (belongs to User)
└── userId

VerificationCode
├── id (UUID)
├── email
├── codeHash
├── type (SIGNUP | PASSWORD_RESET)
├── expiresAt
├── attempts
└── user? (optional User relation)
```

### Common Database Commands

```bash
# Generate Prisma client after schema changes
pnpm --filter @vanx/database db:generate

# Create a new migration
pnpm --filter @vanx/database db:migrate

# Push schema without migration (dev only)
pnpm --filter @vanx/database db:push

# Open Prisma Studio (GUI)
pnpm --filter @vanx/database db:studio

# Reset database (deletes all data!)
pnpm --filter @vanx/database db:migrate:reset
```

### Making Schema Changes

1. Edit `packages/database/prisma/schema.prisma`
2. Run `pnpm --filter @vanx/database db:generate`
3. Create migration: `pnpm --filter @vanx/database db:migrate`
4. Enter a descriptive migration name when prompted

### Using Prisma in Services

```typescript
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.user.findMany();
  }
}
```

---

## Common Tasks

### Adding a New API Endpoint

1. **Create or update module**:
```bash
# Generate new module
cd apps/api
nest generate module features/my-feature
nest generate controller features/my-feature
nest generate service features/my-feature
```

2. **Create DTOs** in `dto/` folder with class-validator decorators:
```typescript
import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
```

3. **Implement service** with business logic

4. **Add routes** in controller with proper decorators

### Adding a New UI Component

1. **Create component** in `packages/ui/src/components/`:
```typescript
// packages/ui/src/components/my-component.tsx
export function MyComponent() {
  return <div>Hello</div>;
}
```

2. **Use in apps**:
```typescript
import { MyComponent } from '@vanx/ui/components/my-component';
```

### Adding a New Page

1. **Create page file** in `apps/web/app/`:
```typescript
// apps/web/app/my-page/page.tsx
export default function MyPage() {
  return <div>My Page</div>;
}
```

2. **Add to navigation** if needed

---

## Coding Standards

### TypeScript

- Always declare types for function parameters and returns
- Avoid `any` - create proper types
- Use interfaces for object shapes
- One export per file (named, not default for most cases)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `ChatService` |
| Functions | camelCase | `getChatById` |
| Variables | camelCase | `chatList` |
| Files | kebab-case | `chat-service.ts` |
| Environment | UPPERCASE | `DATABASE_URL` |

### NestJS Specific

- One module per feature/domain
- Controllers handle HTTP only
- Business logic in services
- Validate all DTOs with class-validator
- Use dependency injection

### React Specific

- Server Components by default
- Minimize `'use client'`, `useEffect`, `useState`
- Functional components only (no classes)
- Props interface for each component

---

## Troubleshooting

### "Cannot find module '@vanx/database'"

```bash
# Rebuild the database package
pnpm --filter @vanx/database build
pnpm --filter @vanx/database db:generate
```

### Prisma client out of sync

```bash
pnpm --filter @vanx/database db:generate
```

### Docker containers not starting

```bash
# Check container status
docker ps -a

# View logs
docker-compose logs postgres
docker-compose logs redis

# Restart containers
pnpm docker:down
pnpm docker:up
```

### Port already in use

```bash
# Find process using port
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Type errors after pulling changes

```bash
# Clean and rebuild
pnpm install
pnpm build
```

### Database connection issues

1. Ensure Docker containers are running: `docker ps`
2. Check env variables match Docker config
3. Try connecting manually: `psql -h localhost -U vanx -d vanx`

---

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)

---

## Getting Help

- Check existing documentation in `/docs`
- Review `CLAUDE.md` for AI-assisted development guidelines
- Check the `IMPROVEMENT-PLAN.md` for known issues and roadmap
- Ask team members in the project chat

Welcome aboard!
