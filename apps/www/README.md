# VanX.Chat Marketing Site

> The world's most intelligent and collaborative AI interaction hub

## Overview

This is the marketing website for VanX.Chat, built with Astro for optimal performance and SEO. The site showcases our vision, features, and provides the entry point for potential users to learn about and sign up for VanX.Chat.

## 🚀 Vision & Mission

**Vision:** To create the world's most intelligent and collaborative AI interaction hub, transforming how individuals and teams access and leverage artificial intelligence.

**Mission:** To unify the fragmented AI landscape into a single, seamless platform that enhances productivity and creativity through intelligent model orchestration, collaborative workflows, and a superior, user-centric experience.

## 🎯 What We Solve

The current AI ecosystem is siloed and inefficient for serious users and teams:

- **Tool Fragmentation:** Users constantly switch between different AI apps
- **Lack of Collaboration:** AI chat is predominantly a single-player experience
- **Inefficient Exploration:** No easy way to explore different conversation paths
- **Information Overload:** Chat histories become cluttered and unsearchable
- **Manual Optimization:** Users guess which AI model is best for their task

## Technology Stack

- **Framework**: [Astro](https://astro.build/) - Static site generator with island architecture
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Language**: TypeScript for type safety
- **Components**: React components for interactive elements
- **Fonts**: Geist Sans and Geist Mono for modern typography
- **Internationalization**: Multi-language support (English, Spanish, Korean)
- **SEO**: Astro SEO component with sitemap generation

## Development

### Prerequisites

- Node.js ≥18.0.0
- pnpm ≥9.0.0

### Quick Start

From the **root of the monorepo**:

```bash
# Install dependencies
pnpm install

# Start marketing site in development
turbo dev --filter=www

# Or start all services
turbo dev
```

The site will be available at: http://localhost:4321

### Site-Specific Commands

From the **root of the monorepo**:

```bash
# Development
turbo dev --filter=www          # Start dev server with hot reload
turbo build --filter=www        # Build for production
pnpm preview --filter=www      # Preview production build locally

# Code Quality
turbo lint --filter=www         # Lint the code
turbo check-types --filter=www  # TypeScript type checking

# Astro CLI
pnpm --filter=www astro add @astrojs/tailwind    # Add integrations
pnpm --filter=www astro check                    # Check for errors
```

## Project Structure

```text
apps/www/
├── public/                    # Static assets
│   ├── favicon.svg
│   ├── fonts/                # Font files
│   └── images/               # Images and graphics
├── src/
│   ├── components/           # Reusable Astro/React components
│   │   └── LanguageSelector.astro
│   ├── i18n/                # Internationalization
│   │   ├── ui.ts            # Translation strings
│   │   └── utils.ts         # i18n utilities
│   ├── layouts/             # Page layouts
│   │   └── Layout.astro     # Base layout component
│   ├── pages/               # Page routes
│   │   ├── index.astro      # English homepage
│   │   ├── es/              # Spanish pages
│   │   │   └── index.astro
│   │   └── ko/              # Korean pages
│   │       └── index.astro
│   └── styles/
│       └── global.css       # Global styles
├── astro.config.mjs         # Astro configuration
├── tailwind.config.js       # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## Features

### 🌐 Multi-language Support

The site supports multiple languages:

- **English** (default): `/`
- **Spanish**: `/es/`
- **Korean**: `/ko/`

#### Adding New Languages

1. Add language to `src/i18n/ui.ts`:

```typescript
export const languages = {
  en: 'English',
  es: 'Español',
  ko: '한국어',
  fr: 'Français', // New language
};
```

2. Add translations to the `ui` object
3. Create page directory: `src/pages/fr/`
4. Add pages with proper language routing

### 🎨 Design System

#### Typography

- **Primary Font**: Geist Sans - Modern, clean typography
- **Monospace Font**: Geist Mono - For code and technical content
- **Font Loading**: Optimized with `@fontsource` packages

#### Colors

Using a semantic color system with CSS custom properties:

```css
:root {
  --color-primary: /* Brand primary */
  --color-secondary: /* Brand secondary */
  --color-text: /* Primary text */
  --color-background: /* Background */
}
```

#### Components

Reusable components follow Astro's component model:

```astro
---
// Component script (TypeScript)
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<!-- Component template -->
<div class="component">
  <h2>{title}</h2>
  {description && <p>{description}</p>}
</div>

<style>
  /* Scoped styles */
  .component {
    @apply bg-white rounded-lg shadow-md p-6;
  }
</style>
```

### 🔍 SEO & Performance

#### SEO Features

- **Meta Tags**: Comprehensive meta tag setup
- **Open Graph**: Social media sharing optimization
- **Sitemap**: Auto-generated XML sitemap
- **Robots.txt**: Search engine crawling instructions
- **Structured Data**: JSON-LD for rich snippets

#### Performance Optimizations

- **Static Generation**: Pre-built HTML for lightning-fast loading
- **Image Optimization**: Astro's built-in image optimization
- **Font Loading**: Optimized font loading with swap strategy
- **CSS Purging**: Unused CSS automatically removed
- **Bundle Splitting**: Optimal JavaScript bundling

## Content Management

### Page Content

Update content directly in Astro components:

```astro
---
const features = [
  {
    title: "Intelligent Model Orchestration",
    description: "Smart routing to the best AI model for each task"
  },
  // Add more features
];
---
```

### Internationalization

Add new translations in `src/i18n/ui.ts`:

```typescript
export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.features': 'Features',
    // Add more translations
  },
  es: {
    'nav.home': 'Inicio',
    'nav.features': 'Características',
    // Add Spanish translations
  },
} as const;
```

Use translations in components:

```astro
---
import { getLangFromUrl, useTranslations } from '../i18n/utils';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
---

<h1>{t('hero.title')}</h1>
```

## Deployment

### Build for Production

```bash
# From monorepo root
turbo build --filter=www
```

Output will be in `apps/www/dist/` ready for static hosting.

### Deployment Options

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from the www directory
cd apps/www
vercel --prod
```

#### Netlify

```bash
# Build command: turbo build --filter=www
# Publish directory: apps/www/dist
```

#### Static Hosting

Upload the `apps/www/dist/` folder to any static hosting provider:

- AWS S3 + CloudFront
- GitHub Pages
- Cloudflare Pages
- Azure Static Web Apps

### Environment Variables

For build-time environment variables, add to `astro.config.mjs`:

```javascript
export default defineConfig({
  // ...
  vite: {
    define: {
      'process.env.APP_URL': JSON.stringify(process.env.APP_URL || 'http://localhost:3001'),
      'process.env.API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:3000'),
    }
  }
});
```

## Analytics & Tracking

### Google Analytics

Add GA tracking to `src/layouts/Layout.astro`:

```astro
---
const GA_ID = import.meta.env.PUBLIC_GA_ID;
---

{GA_ID && (
  <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_ID);
  </script>
)}
```

### Performance Monitoring

Consider integrating:

- **Core Web Vitals**: Lighthouse CI for performance monitoring
- **Error Tracking**: Sentry for error reporting
- **User Analytics**: Hotjar or similar for user behavior insights

## Contributing

1. Follow the [main project workflow](../../README.md#development-workflow)
2. Test changes across all supported languages
3. Ensure accessibility compliance (WCAG 2.1 AA)
4. Optimize images and assets before committing
5. Update translations when adding new content

## Browser Support

- **Modern Browsers**: Latest 2 versions of Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Performance**: Targets 90+ Lighthouse score across all metrics

## Resources

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)

## License

This project is part of VanX.Chat and is licensed under the [MIT License](../../LICENSE).

---

## 🌟 Live Site

Visit the live marketing site: [vanx.chat](https://vanx.chat)

Built with ❤️ using Astro, Tailwind CSS, and modern web technologies.