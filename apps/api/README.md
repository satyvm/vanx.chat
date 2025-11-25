# VanX.Chat API

> Backend API for the world's most intelligent and collaborative AI interaction hub

## Overview

The VanX.Chat API is built with NestJS and provides the backend services for the VanX.Chat platform. It handles:

- **AI Model Integration**: Connect and orchestrate multiple AI providers
- **User Management**: Authentication, authorization, and user profiles
- **Chat & Conversations**: Real-time chat with AI models and conversation history
- **Team Collaboration**: Workspace management and shared AI interactions
- **Data Analytics**: Usage tracking and performance insights

## Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Language**: TypeScript with strict mode
- **Database**: _TBD_ - Likely PostgreSQL for primary data
- **Cache**: _TBD_ - Likely Redis for session management
- **Auth**: _TBD_ - JWT-based authentication
- **Validation**: Class-validator for request validation
- **Testing**: Jest for unit and integration tests

## Development

### Prerequisites

- Node.js ≥18.0.0
- pnpm ≥9.0.0
- Database setup (when implemented)

### Quick Start

From the **root of the monorepo**:

```bash
# Install dependencies
pnpm install

# Start API in development mode
turbo dev --filter=api

# Or start all services
turbo dev
```

The API will be available at: http://localhost:3001

### API-Specific Commands

From the **root of the monorepo**:

```bash
# Development
turbo dev --filter=api          # Start with hot reload
pnpm start --filter=api        # Start in production mode
turbo build --filter=api        # Build for production

# Testing
turbo test --filter=api         # Run unit tests
pnpm test:watch --filter=api   # Run tests in watch mode
turbo test:e2e --filter=api     # Run end-to-end tests
turbo test:cov --filter=api     # Run with coverage

# Code Quality
turbo lint --filter=api         # Lint the code
pnpm format --filter=api       # Format the code
```

### Environment Variables

Create `.env.local` in the `apps/api` directory:

```bash
# Database
# Option A: provide the full connection string
DATABASE_URL=postgresql://user:pass@localhost:5432/vanx_dev

# Option B: let the API build DATABASE_URL from individual values
POSTGRES_USER=vanx
POSTGRES_PASSWORD=vanx
POSTGRES_HOST=localhost
POSTGRES_DB=vanx
POSTGRES_PORT=5432

# Redis (optional, defaults shown)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
# REDIS_PASSWORD=super-secret

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REFRESH_COOKIE_MAX_AGE=604800000
WEB_APP_URL=http://localhost:3000

# AI Provider APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Application
NODE_ENV=development
PORT=3001
API_VERSION=v1
```

## Project Structure

```
apps/api/src/
├── auth/                 # Authentication & authorization
├── users/                # User management
├── conversations/        # Chat and conversation logic
├── ai-models/           # AI provider integrations
├── workspaces/          # Team collaboration features
├── analytics/           # Usage tracking and insights
├── common/              # Shared utilities and decorators
│   ├── guards/         # Auth guards
│   ├── interceptors/   # Request/response interceptors
│   ├── pipes/          # Validation pipes
│   └── filters/        # Exception filters
├── config/              # Configuration modules
└── database/            # Database schemas and migrations
```

## API Endpoints

### Authentication

- `POST /auth/login` - User login with email/password
- `POST /auth/sign-up` - User registration (returns tokens + profile)
- `POST /auth/refresh` - Issue a fresh access/refresh token pair
- `POST /auth/logout` - Revoke refresh token and clear cookies

### Users

- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/usage` - Get usage statistics

### Conversations

- `GET /conversations` - List user conversations
- `POST /conversations` - Create new conversation
- `GET /conversations/:id` - Get conversation details
- `POST /conversations/:id/messages` - Send message
- `DELETE /conversations/:id` - Delete conversation

### AI Models

- `GET /ai-models` - List available AI models
- `POST /ai-models/chat` - Send chat message to AI
- `GET /ai-models/usage` - Get model usage statistics

### Workspaces (Team Features)

- `GET /workspaces` - List user workspaces
- `POST /workspaces` - Create workspace
- `GET /workspaces/:id` - Get workspace details
- `POST /workspaces/:id/invite` - Invite team members

## Testing

### Unit Tests

```bash
# Run all unit tests
pnpm --filter=api test

# Run specific test file
pnpm --filter=api test auth.service.spec.ts

# Run with coverage
pnpm --filter=api test:cov
```

### E2E Tests

```bash
# Run all e2e tests
pnpm --filter=api test:e2e

# Run specific e2e test
pnpm --filter=api test:e2e auth.e2e-spec.ts
```

### Test Structure

```
test/
├── auth.e2e-spec.ts         # Auth endpoints
├── users.e2e-spec.ts        # User endpoints
├── conversations.e2e-spec.ts # Chat endpoints
└── jest-e2e.json           # E2E test configuration
```

## Deployment

### Build for Production

```bash
# From monorepo root
turbo build --filter=api
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy monorepo files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api ./apps/api
COPY packages ./packages

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build the application
RUN turbo build --filter=api

# Start the application
EXPOSE 3000
CMD ["pnpm", "start", "--filter=api"]
```

### Environment-Specific Deployment

Create environment-specific configuration files:

- `.env.staging` - Staging environment variables
- `.env.production` - Production environment variables

## Performance & Monitoring

### Logging

The API uses structured logging with different levels:

```typescript
import { Logger } from '@nestjs/common';

export class UserService {
  private readonly logger = new Logger(UserService.name);

  async createUser(userData: CreateUserDto) {
    this.logger.log('Creating new user', { email: userData.email });
    // ... business logic
    this.logger.log('User created successfully', { userId: newUser.id });
  }
}
```

### Health Checks

- `GET /health` - Application health status
- `GET /health/database` - Database connection status
- `GET /health/redis` - Redis connection status

### Metrics & Monitoring

Consider integrating:

- **APM**: DataDog, New Relic, or Sentry for application monitoring
- **Metrics**: Prometheus + Grafana for custom metrics
- **Logs**: ELK stack or similar for log aggregation

## Security

### Authentication Flow

1. User provides credentials via `/auth/login`
2. API validates credentials and returns JWT access token
3. Client includes token in `Authorization: Bearer <token>` header
4. API validates token on protected routes

### Security Headers

The API implements security headers via Helmet:

```typescript
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for API
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
```

### Rate Limiting

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // 1 minute
      limit: 100, // 100 requests per minute
    }),
  ],
})
```

## Contributing

1. Follow the [main project workflow](../../README.md#development-workflow)
2. Ensure all tests pass: `pnpm --filter=api test`
3. Run linting: `pnpm --filter=api lint`
4. Update documentation for API changes
5. Add/update tests for new features

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Class Validator](https://github.com/typestack/class-validator)
- [Swagger/OpenAPI](https://swagger.io/specification/)
