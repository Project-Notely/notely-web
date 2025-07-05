# Development Setup Guide

This document outlines the development tools and configurations set up for this project.

## 🛠️ Tools Overview

### Code Quality Tools

- **ESLint**: Linting for JavaScript/TypeScript
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks for pre-commit/pre-push checks
- **lint-staged**: Run linters on staged files

## 📦 Available Scripts

### Development

```bash
bun dev                 # Start development server
bun build               # Build for production
bun preview             # Preview production build
```

### Code Quality

```bash
bun run lint            # Run ESLint
bun run lint:fix        # Run ESLint with auto-fix
bun run format          # Format all files with Prettier
bun run format:check    # Check if files are formatted
bun run type-check      # Run TypeScript type checking
```

## 🎯 Git Hooks

### Pre-commit Hook

Runs automatically before each commit:

- **lint-staged**: Runs ESLint --fix and Prettier on staged files
- Only processes files that are staged for commit

### Pre-push Hook

Runs automatically before pushing to remote:

- **Type checking**: Ensures no TypeScript errors
- **Linting**: Runs ESLint on entire codebase
- **Format checking**: Ensures all files are properly formatted

### Commit Message Hook

Enforces conventional commit format:

- **Format**: `type(scope): description`
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Examples**:
  - `feat: add user authentication`
  - `fix: resolve navbar responsive issue`
  - `docs: update installation guide`

## ⚙️ Configuration Files

### ESLint Configuration

- **File**: `eslint.config.js`
- **Features**:
  - TypeScript support
  - React hooks rules
  - Prettier integration
  - Custom rules for unused variables
  - Console warnings

### Prettier Configuration

- **File**: `.prettierrc`
- **Settings**:
  - Single quotes
  - 2 spaces indentation
  - Trailing commas (ES5)
  - Line width: 80 characters
  - Unix line endings

### TypeScript Configuration

- **Files**: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- **Features**:
  - Strict mode enabled
  - Modern ES target
  - Path mapping support

### VSCode Settings

- **File**: `.vscode/settings.json`
- **Features**:
  - Format on save
  - ESLint auto-fix
  - Organize imports
  - Proper TypeScript settings

## 🔧 Editor Setup

### Recommended VSCode Extensions

The project includes extension recommendations in `.vscode/extensions.json`:

- **Prettier**: Code formatting
- **ESLint**: Linting
- **TypeScript**: Enhanced TypeScript support
- **Tailwind CSS**: CSS utility classes (if needed)
- **Auto Rename Tag**: HTML/JSX tag renaming
- **Path Intellisense**: File path autocompletion

### EditorConfig

- **File**: `.editorconfig`
- **Ensures**: Consistent formatting across different editors
- **Settings**: 2-space indentation, LF line endings, UTF-8 encoding

## 📋 Workflow

### Daily Development

1. Work on your feature/fix
2. Stage your changes: `git add .`
3. Commit: `git commit -m "feat: add new feature"`
   - Pre-commit hook runs automatically
   - Fixes formatting and linting issues
4. Push: `git push`
   - Pre-push hook runs automatically
   - Ensures code quality before pushing

### Manual Quality Checks

```bash
# Run all quality checks manually
bun run type-check
bun run lint
bun run format:check

# Fix issues
bun run lint:fix
bun run format
```

## 🚨 Troubleshooting

### ESLint Issues

- Run `bun run lint:fix` to auto-fix many issues
- Check `.eslintignore` if certain files should be excluded
- Disable specific rules with `// eslint-disable-next-line rule-name`

### Prettier Issues

- Run `bun run format` to format all files
- Check `.prettierignore` for excluded files
- Ensure VSCode is using the project's Prettier settings

### TypeScript Issues

- Run `bun run type-check` to see all type errors
- Check `tsconfig.json` for configuration issues
- Ensure all dependencies have proper type definitions

### Git Hook Issues

- Check hook file permissions: `chmod +x .husky/*`
- Verify Husky installation: `bunx husky --version`
- Test hooks manually: `bunx husky run .husky/pre-commit`

## 📝 Best Practices

### Code Style

- Use single quotes for strings
- Use 2 spaces for indentation
- Add trailing commas where possible
- Keep line length under 80 characters

### TypeScript

- Use explicit types for function parameters
- Avoid `any` type (ESLint will warn)
- Use underscore prefix for unused variables: `_unusedParam`

### Git Commits

- Follow conventional commit format
- Keep descriptions concise but descriptive
- Use imperative mood: "add" not "added"

### Code Organization

- Use relative imports for local files
- Group imports: external libraries first, then local files
- Use descriptive variable and function names
- Add comments for complex logic

## 🔄 Updating Tools

To update all development dependencies:

```bash
bun update
```

To update specific tools:

```bash
bun update prettier eslint typescript husky lint-staged
```

---

This setup ensures consistent code quality, style, and helps catch issues early in the development process. The automated hooks make it easy to maintain standards without manual intervention.
