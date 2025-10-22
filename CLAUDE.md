# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for vanx.chat, an AI interaction hub, built with pnpm workspaces and Turborepo. The project consists of three main applications and shared packages:

- **apps/api**: NestJS backend API with Prisma ORM and PostgreSQL
- **apps/web**: Next.js 15 application (main dashboard/chat UI)
- **apps/www**: Astro-based marketing/landing site
- **packages/ui**: Shared React component library (Radix UI + Tailwind CSS)
- **packages/eslint-config**: Shared ESLint configuration
- **packages/typescript-config**: Shared TypeScript configurations

## Development Commands

### Root Level Commands
- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Run linting across all workspaces
- `pnpm check-types` - Type-check all workspaces
- `pnpm format` - Format code with Prettier
- `pnpm commit` - Use commitlint prompt for conventional commits

### API (apps/api)
- `pnpm dev` - Start NestJS with watch mode and SWC compiler
- `pnpm build` - Build the API
- `pnpm start:prod` - Run production build
- `pnpm test` - Run unit tests with Jest
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm test:cov` - Run tests with coverage

### Web App (apps/web)
- `pnpm dev` - Start Next.js dev server with Turbopack
- `pnpm build` - Build Next.js production bundle
- `pnpm start` - Start production server
- `pnpm check-types` - Type-check without emitting files
- `pnpm lint` - Run ESLint

### Marketing Site (apps/www)
- `pnpm dev` - Start Astro dev server
- `pnpm build` - Build Astro site
- `pnpm preview` - Preview production build
- `pnpm check-types` - Run Astro type checking

## Architecture & Key Conventions

### Monorepo Structure
- Uses **Turborepo** for orchestration with task caching
- **pnpm workspaces** for dependency management (requires Node.js >= 22)
- Workspace packages referenced with `workspace:*` protocol
- Turbo tasks have proper dependencies: `build` depends on `^build`, `lint` and `check-types` depend on `^build`

### Backend Architecture (NestJS)
- **Modular architecture**: One module per main domain/route
- **Prisma ORM** with custom output directory: `apps/api/generated/prisma`
- Database: PostgreSQL
- **Module structure**:
  - One controller per route
  - Services for business logic and persistence
  - Models folder with DTOs (validated with class-validator) and output types
  - Entities with Prisma for data persistence
- **Common module pattern**: Create `@app/common` for shared code (configs, decorators, DTOs, guards, interceptors, notifications, services, types, utils, validators)
- **Testing**: Add an `admin/test` method to each controller as a smoke test

### Frontend Architecture (Next.js)
- **Next.js 15** with App Router and React 19
- **Turbopack** for development
- **Server Components by default**: Minimize `'use client'`, `useEffect`, and `setState`
- **Shared UI package** (`@vanx/ui`): Radix UI components with Tailwind CSS
- Component imports: `@vanx/ui/components/*`, `@vanx/ui/hooks/*`, `@vanx/ui/lib/*`
- Global styles: `@vanx/ui/globals.css`
- State management: Use Zustand or TanStack React Query
- Validation: Use Zod for schema validation

### Coding Standards

#### TypeScript (All Apps)
- **Always declare types** for variables and functions (parameters and return values)
- **Avoid `any`**; create necessary types
- Use **JSDoc** for public classes and methods
- **One export per file**
- No blank lines within functions

#### Naming Conventions
- **PascalCase**: Classes
- **camelCase**: Variables, functions, methods
- **kebab-case**: Files and directories
- **UPPERCASE**: Environment variables
- Start functions with verbs
- Use verbs for booleans: `isLoading`, `hasError`, `canDelete`
- Standard abbreviations allowed: `i`, `j` (loops), `err` (errors), `ctx` (contexts), `req`, `res`, `next` (middleware)

#### Functions
- **Short functions** with single purpose (< 20 instructions)
- Use early returns to avoid nesting
- Higher-order functions preferred (map, filter, reduce)
- **RO-RO pattern** for multiple parameters (use objects for input/output)
- Default parameter values instead of null/undefined checks

#### Classes
- Follow **SOLID principles**
- Prefer **composition over inheritance**
- Declare interfaces for contracts
- Small classes: < 200 instructions, < 10 public methods, < 10 properties

#### Data Management
- Avoid primitive type abuse; use composite types
- Validate in classes, not functions
- Prefer **immutability** (`readonly`, `as const`)

#### Error Handling
- Use exceptions for unexpected errors
- Catch only to fix expected problems or add context
- Use global exception handlers otherwise

#### Testing
- **Arrange-Act-Assert** for unit tests
- **Given-When-Then** for acceptance tests
- Test variable naming: `inputX`, `mockX`, `actualX`, `expectedX`
- Write unit tests for all public functions
- Use test doubles for dependencies (except inexpensive third-party libs)
- Write acceptance tests for each module

### Frontend-Specific Guidelines
- **Functional and declarative** patterns (no classes)
- Directory structure: exported components, subcomponents, helpers, static content, types
- Minimize client-side logic; favor RSC and SSR
- Dynamic imports for code splitting
- **Mobile-first responsive design**
- Image optimization: WebP format, size data, lazy loading
- Early returns and guard clauses for error handling
- Custom error types for consistency
- Test components with Jest and React Testing Library

### Git Workflow
- Uses **Husky** for git hooks
- **Commitlint** enforces conventional commits
- **lint-staged** runs type-checking and linting on staged files
- Turbo filters with `--filter=...[HEAD]` for changed workspaces only

### Package Manager
- **pnpm 10.18.3** (specified in `packageManager` field)
- Special config: `onlyBuiltDependencies: ["@nestjs/core"]`

## Database

- Prisma schema: `apps/api/prisma/schema.prisma`
- Generated client: `apps/api/generated/prisma`
- Migrations: `apps/api/prisma/migrations/`
- Current models: `chat` (with User model commented out)

## Important Notes

- **Do not** leave blank lines within functions
- **Do not** use abbreviations except standard ones
- **Always** validate DTOs in NestJS with class-validator
- **Always** provide both content and active forms for tasks
- **Prefer** editing existing files over creating new ones
- **Minimize** use of client-side React hooks; prefer Server Components
