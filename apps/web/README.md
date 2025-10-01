# VanX.Chat Web App

> Next.js web application for the world's most intelligent and collaborative AI interaction hub

## Overview

This is the main web application for VanX.Chat, built with Next.js, React, and Tailwind CSS. It provides the core user interface for interacting with AI models, managing conversations, and collaborating with teams.

## Features

- **Modern Stack**: Built with Next.js 15, React 19, and Tailwind CSS
- **Component Library**: Uses shared UI components from `@workspace/ui` package
- **Type Safety**: 100% TypeScript with strict type checking
- **Dark Mode**: Built-in dark mode support via `next-themes`
- **Performance**: Fast development with Turbopack

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) - React framework with App Router
- **UI**: [React](https://react.dev/) - UI library
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **Components**: Shared component library from `@workspace/ui`
- **Icons**: [Lucide React](https://lucide.dev/docs/lucide-react) - Beautiful icons
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes) - Dark/light mode

## Development

### Prerequisites

- Node.js ≥18.0.0
- pnpm ≥9.0.0
- Git

### Quick Start

From the **root of the monorepo**:

```bash
# Install dependencies
pnpm install

# Option 1: Using Turborepo directly (recommended)
turbo dev --filter=web        # Start only the web app
turbo dev                     # Start all applications

# Option 2: Using pnpm scripts
pnpm dev --filter=web         # Start only the web app
pnpm dev                      # Start all applications
```

The web app will be available at: http://localhost:3001

### App-Specific Commands

```bash
# Development
turbo dev --filter=web           # Start development server with turbopack
turbo lint --filter=web          # Lint the code
turbo lint:fix --filter=web      # Fix linting issues

# Type checking
turbo typecheck --filter=web     # Run TypeScript type checking

# Production
turbo build --filter=web         # Build for production
turbo start --filter=web         # Start production server
```

## Project Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page component
├── components/            # Local components
│   └── providers.tsx      # Theme provider
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── public/                # Static files
├── components.json        # UI components configuration
├── next.config.mjs        # Next.js configuration
├── package.json           # Package manifest
└── tsconfig.json         # TypeScript configuration
```

## Key Files

### `app/layout.tsx`

The root layout that wraps all pages, includes:
- Font configuration (Geist Sans & Geist Mono)
- Global styles import
- Theme provider setup

### `app/page.tsx`

The home page component, demonstrates:
- Basic layout structure
- Usage of shared UI components

### `components/providers.tsx`

Theme provider setup using `next-themes`:
- Dark/light mode switching
- System preference detection
- Transition control

### `next.config.mjs`

Next.js configuration including:
- Transpilation of workspace packages
- Other Next.js settings

## Environment Variables

Create `.env.local` in the `apps/web` directory for local development:

```bash
# API Connection
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Analytics (if needed)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_HOTJAR_ID=
```

## Using Shared UI Components

Import components from the shared UI package:

```tsx
import { Button } from "@workspace/ui/components/button"

export default function MyComponent() {
  return (
    <div>
      <Button variant="default">Click me</Button>
    </div>
  )
}
```

## Building & Deployment

### Build for Production

```bash
# From monorepo root
turbo build --filter=web
```

Output will be in `.next/` ready for deployment.

### Deployment Options

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from the web directory
cd apps/web
vercel --prod
```

#### Other Deployment Options

The app can be deployed to any platform supporting Next.js:
- AWS Amplify
- Netlify
- Google Cloud Run
- Docker container

## Performance Optimization

- Use React Server Components where possible
- Implement proper image optimization with Next.js Image component
- Leverage Next.js caching mechanisms
- Analyze bundle sizes with `next/bundle-analyzer`

## Browser Support

- **Modern Browsers**: Latest 2 versions of Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

## Contributing

1. Follow the [main project workflow](../../README.md#development-workflow)
2. Make sure to run tests and linting before commits
3. Use conventional commit messages
4. Open pull requests for review

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)

## License

This project is part of VanX.Chat and is licensed under the [MIT License](../../LICENSE).
