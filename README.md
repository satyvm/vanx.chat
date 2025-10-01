# VanX.Chat

> The world's most intelligent and collaborative AI interaction hub

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Quality & Standards](#code-quality--standards)
- [Testing](#testing)
- [Building & Deployment](#building--deployment)
- [Environment Management](#environment-management)
- [CI/CD Pipeline](#cicd-pipeline)
- [Production Considerations](#production-considerations)
- [Troubleshooting](#troubleshooting)

## 🔍 Overview

VanX.Chat is a modern full-stack application built as a monorepo using:
- **Turborepo** for build system orchestration
- **pnpm** for package management and workspaces
- **TypeScript** throughout the entire stack
- **Conventional commits** and **lint-staged** for code quality

## 🏗️ Architecture

### Applications

```
apps/
├── api/          # NestJS Backend API
├── web/          # Next.js Web Application
└── www/          # Astro Marketing Site
```

### Shared Packages

```
packages/
├── ui/                    # Shared React Components
├── eslint-config/         # Shared ESLint Configuration
└── typescript-config/     # Shared TypeScript Configuration
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **API** | NestJS + Express | Backend REST API |
| **Web App** | Next.js + React | Main application interface |
| **Marketing** | Astro | Static marketing site |
| **UI Library** | React + Tailwind CSS | Shared components |
| **Database** | *TBD* | Data persistence |
| **Auth** | *TBD* | Authentication & authorization |

## 📋 Prerequisites

- **Node.js** ≥18.0.0
- **pnpm** ≥9.0.0 (install with `npm install -g pnpm`)
- **Git** with conventional commit setup

### Verify Installation

```bash
node --version    # Should be ≥18
pnpm --version    # Should be ≥9
```

## 🚀 Development Setup

### 1. Clone & Install

```bash
git clone <repository-url>
cd vanx.chat
pnpm install
```

### 2. Environment Setup

Create environment files for each application:

```bash
# API environment
cp apps/api/.env.example apps/api/.env.local

# Web app environment  
cp apps/web/.env.example apps/web/.env.local

# Marketing site environment
cp apps/www/.env.example apps/www/.env.local
```

### 3. Start Development

```bash
# Start all applications
turbo dev

# Or start specific applications
turbo dev --filter=api     # Just the API
turbo dev --filter=web     # Just the web app
turbo dev --filter=www     # Just the marketing site
```

### 4. Access Applications

- **API**: http://localhost:3000
- **Web App**: http://localhost:3001  
- **Marketing Site**: http://localhost:4321

## 🔄 Development Workflow

### Branch Strategy

We follow **Git Flow** with these branch types:

```
main           # Production-ready code
develop        # Integration branch for features
feature/*      # New features
hotfix/*       # Production fixes
release/*      # Release preparation
```

### Daily Workflow

1. **Pull Latest Changes**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes & Commit**
   ```bash
   # Make your changes
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push & Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request to develop branch
   ```

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     New features
fix:      Bug fixes
docs:     Documentation changes
style:    Code style changes
refactor: Code refactoring
test:     Test additions/modifications
chore:    Build process or auxiliary tool changes
```

## ✅ Code Quality & Standards

### Automated Checks

Every commit triggers:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type checking
- **Commit message** validation

### Manual Quality Checks

```bash
# Lint all code
turbo lint

# Fix linting issues
turbo lint --fix

# Format all code
pnpm format

# Type check all applications
turbo check-types

# Run all quality checks
turbo lint && turbo check-types
```

### Code Standards

- **TypeScript**: Use strict mode, prefer explicit types
- **React**: Use functional components with hooks
- **NestJS**: Follow dependency injection patterns
- **File Organization**: Group by feature, not by file type
- **Naming**: Use descriptive names, prefer consistency

## 🧪 Testing

### Test Types & Commands

```bash
# Unit tests (API)
turbo test --filter=api

# E2E tests (API)
turbo test:e2e --filter=api

# Coverage report
turbo test:cov --filter=api

# Watch mode during development
pnpm test:watch --filter=api
```

### Testing Standards

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete user workflows
- **Minimum Coverage**: 80% for critical paths

### Test File Structure

```
src/
├── auth/
│   ├── auth.service.ts
│   ├── auth.service.spec.ts     # Unit tests
│   └── auth.controller.e2e-spec.ts  # E2E tests
```

## 🏗️ Building & Deployment

### Build Process

```bash
# Build all applications
turbo build

# Build specific application
turbo build --filter=web
turbo build --filter=api
turbo build --filter=www

# Production optimization
NODE_ENV=production turbo build
```

### Build Outputs

| App | Output Directory | Type |
|-----|------------------|------|
| API | `apps/api/dist/` | Node.js bundle |
| Web | `apps/web/.next/` | Next.js static/SSR |
| WWW | `apps/www/dist/` | Static HTML/CSS/JS |

### Deployment Strategies

#### Option 1: Vercel (Recommended for Web Apps)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy web app
cd apps/web && vercel --prod

# Deploy marketing site  
cd apps/www && vercel --prod
```

#### Option 2: Docker + Cloud Platform

```dockerfile
# Example API Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build --filter=api
EXPOSE 3000
CMD ["pnpm", "start", "--filter=api"]
```

#### Option 3: Static Hosting (WWW only)

```bash
# Build and deploy to any static host
pnpm build --filter=www
# Upload apps/www/dist/ to your hosting provider
```

## 🚀 Turborepo Remote Caching

### Setup Vercel Remote Cache (Recommended)

Turborepo can share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Authenticate with Vercel
turbo login

# Link your repository to Vercel Remote Cache
turbo link
```

### Benefits

- **Faster CI/CD**: Skip rebuilding unchanged packages
- **Team Collaboration**: Share build caches across developers
- **Cost Reduction**: Reduce build times and compute costs

Learn more about [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching).

---

## 📚 Additional Resources

- [Turborepo Documentation](https://turborepo.org/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [NestJS Documentation](https://nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Astro Documentation](https://astro.build/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Ensure all checks pass
6. Submit a pull request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

### Useful Commands Reference

| Command | Description |
|---------|-------------|
| `turbo dev` | Start all apps in development |
| `turbo build` | Build all apps for production |
| `turbo lint` | Lint all code |
| `pnpm format` | Format all code |
| `turbo check-types` | Type check all apps |
| `pnpm clean` | Clean all build artifacts |
| `turbo <command> --filter=<app>` | Run command in specific app |
