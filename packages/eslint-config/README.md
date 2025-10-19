# @vanx/eslint-config

> Shared ESLint configurations for the VanX.Chat monorepo

## Overview

This package provides standardized ESLint configurations used across all applications and packages in the VanX.Chat monorepo. It ensures consistent code quality, formatting, and style guidelines throughout the entire codebase.

## Configurations

### Available Configs

- **`base.js`** - Base configuration for all JavaScript/TypeScript projects
- **`next.js`** - Extended configuration for Next.js applications
- **`react-internal.js`** - Configuration for internal React components and packages
- **`node.js`** - Configuration for Node.js backend applications (planned)

### Configuration Hierarchy

```
base.js (foundation)
├── next.js (extends base + Next.js rules)
├── react-internal.js (extends base + React rules)
└── node.js (extends base + Node.js rules)
```

## Usage

### In Applications

#### Next.js Apps (`apps/web`)

```javascript
// eslint.config.js
const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@vanx/eslint-config/next.js"],
  parserOptions: {
    project,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
};
```

#### NestJS API (`apps/api`)

```javascript
// eslint.config.js
const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@vanx/eslint-config/base.js"],
  parserOptions: {
    project,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  rules: {
    // NestJS specific overrides
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
};
```

#### Astro Sites (`apps/www`)

```javascript
// eslint.config.js
const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@vanx/eslint-config/base.js"],
  parserOptions: {
    project,
  },
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
      rules: {
        // Astro specific rules
      },
    },
  ],
};
```

### In Packages

#### Shared UI Library (`packages/ui`)

```javascript
// eslint.config.js
const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@vanx/eslint-config/react-internal.js"],
  parserOptions: {
    project,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
};
```

## Rules Overview

### Base Configuration (`base.js`)

#### Core Rules
- **TypeScript**: Strict type checking and best practices
- **Import/Export**: Consistent import ordering and organization
- **Code Quality**: Enforces clean, readable code patterns
- **Performance**: Prevents common performance pitfalls

#### Key Rules
```javascript
{
  "@typescript-eslint/no-unused-vars": "error",
  "@typescript-eslint/prefer-const": "error",
  "@typescript-eslint/no-explicit-any": "warn",
  "prefer-const": "error",
  "no-var": "error",
  "import/order": ["error", { /* import ordering rules */ }],
}
```

### Next.js Configuration (`next.js`)

Extends base configuration with:
- Next.js specific rules via `@next/eslint-config-next`
- React hooks rules
- JSX accessibility rules
- Next.js performance optimizations

### React Internal Configuration (`react-internal.js`)

Optimized for React component libraries:
- React hooks rules
- JSX best practices
- Component naming conventions
- Props validation (when using PropTypes)

## Development

### Adding New Rules

1. **Identify the need**: Document why the rule is necessary
2. **Research the rule**: Understand its impact and configuration options
3. **Add to appropriate config**: Place in the most specific relevant configuration
4. **Test across projects**: Ensure the rule works well across all consuming projects
5. **Document the change**: Update this README and add to CHANGELOG

### Rule Categories

#### Error Level Rules (Fail CI)
- Type safety violations
- Potential runtime errors
- Security vulnerabilities

#### Warning Level Rules (Don't fail CI)
- Style preferences
- Performance suggestions
- Code quality improvements

#### Disabled Rules
- Rules that conflict with Prettier
- Rules that don't fit our coding style
- Rules with too many false positives

### Testing Configuration Changes

```bash
# From monorepo root, test linting across all apps
pnpm lint

# Test specific applications
pnpm --filter=web lint
pnpm --filter=api lint
pnpm --filter=www lint
pnpm --filter=ui lint
```

## Configuration Details

### Parser Configuration

```javascript
{
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
}
```

### Environment Setup

```javascript
{
  env: {
    browser: true,
    es2024: true,
    node: true,
  },
}
```

### Plugin Integration

- **@typescript-eslint**: TypeScript-specific linting
- **import**: Import/export statement linting
- **jsx-a11y**: Accessibility linting for JSX
- **react**: React-specific linting rules
- **react-hooks**: React hooks linting

## IDE Integration

### VS Code

Add to workspace settings (`.vscode/settings.json`):

```json
{
  "eslint.workingDirectories": [
    "apps/web",
    "apps/api", 
    "apps/www",
    "packages/ui",
    "packages/eslint-config"
  ],
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "astro"
  ]
}
```

### Auto-fix on Save

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": false
}
```

## Troubleshooting

### Common Issues

#### "Unable to resolve path to module"
- Ensure `tsconfig.json` paths are correctly configured
- Check that `@vanx/*` packages are properly linked with pnpm

#### "Parsing error: Cannot read file"
- Verify TypeScript configuration in `parserOptions.project`
- Ensure the specified tsconfig.json file exists

#### Rules conflicting with Prettier
- Check if Prettier is properly configured to override ESLint formatting rules
- Consider adding `eslint-config-prettier` if not already included

#### Performance Issues
- Consider excluding large directories in `.eslintignore`
- Use `--cache` flag for faster subsequent runs

### Debug Configuration

```bash
# Print effective configuration for a file
npx eslint --print-config src/index.ts

# Run ESLint with debug information
DEBUG=eslint:* npx eslint src/
```

## Contributing

1. Follow semantic versioning for breaking changes
2. Test configuration changes across all consuming packages
3. Update documentation for new rules or configurations
4. Consider backward compatibility when modifying existing configs

## Dependencies

### Peer Dependencies
- `eslint` - Core ESLint engine
- `typescript` - TypeScript support
- `@typescript-eslint/parser` - TypeScript parser
- `@typescript-eslint/eslint-plugin` - TypeScript rules

### Optional Dependencies
- `eslint-config-next` - Next.js specific rules (for next.js config)
- `eslint-plugin-react` - React rules (for React configs)
- `eslint-plugin-react-hooks` - React hooks rules
- `eslint-plugin-jsx-a11y` - Accessibility rules

## Changelog

### v1.0.0
- Initial release with base, next, and react-internal configurations
- TypeScript support with strict rules
- Import ordering and organization rules

## Resources

- [ESLint Documentation](https://eslint.org/docs/)
- [TypeScript ESLint Documentation](https://typescript-eslint.io/)
- [ESLint Shareable Configs](https://eslint.org/docs/developer-guide/shareable-configs)

## License

This package is part of the VanX.Chat monorepo and is licensed under the [MIT License](../../LICENSE).