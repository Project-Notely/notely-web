# Development Setup Guide

This document outlines the development tools and configurations set up for this project.

## 🚀 Runtime: Bun

**This project uses Bun as its JavaScript runtime, not Node.js!**

### Prerequisites

1. **Install Bun** (if not already installed):

   ```bash
   # macOS/Linux
   curl -fsSL https://bun.sh/install | bash

   # Windows
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

2. **Verify installation**:
   ```bash
   bun --version
   # Should show: 1.2.18
   ```

### Version Management

This project uses **Bun 1.2.18** (pinned in `.bun-version` file).

**For automatic version switching:**

- If you have multiple Bun versions, Bun will automatically use the version specified in `.bun-version`
- To manually switch: `bun use 1.2.18`

### Initial Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd notely-web

# Install dependencies (uses bun.lock for exact versions)
bun install

# Start development server
bun dev
```

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

### Package Management

```bash
bun install             # Install dependencies
bun add <package>       # Add a package
bun remove <package>    # Remove a package
bun update             # Update dependencies
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

### Core Configuration

- `.bun-version` - Pins Bun version for consistency
- `bun.lock` - Lockfile for exact dependency versions
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration

### Code Quality

- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to exclude from formatting
- `eslint.config.js` - ESLint linting rules
- `.commitlintrc.json` - Commit message format rules

### Editor Setup

- `.vscode/settings.json` - VS Code workspace settings
- `.vscode/extensions.json` - Recommended extensions
- `.editorconfig` - Editor consistency settings

### Git Hooks

- `.husky/pre-commit` - Run lint-staged before commits
- `.husky/commit-msg` - Validate commit message format
- `.husky/pre-push` - Run type checking and linting before push

## 🎯 Git Workflow

### Pre-commit Hooks

When you commit, the following will run automatically:

- **lint-staged**: Runs ESLint and Prettier on staged files
- **commit-msg**: Validates commit message format

### Pre-push Hooks

When you push, the following will run:

- **type-check**: TypeScript type checking
- **lint**: ESLint on all files
- **format:check**: Prettier format validation

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore, ci, build
Examples:
  feat: add user authentication
  fix: resolve navbar responsive issue
  docs: update installation guide
```

## 📱 VS Code Setup

### Required Extensions

Install these extensions for the best development experience:

- **Prettier - Code formatter**
- **ESLint**
- **TypeScript and JavaScript Language Features**
- **Tailwind CSS IntelliSense**

### Auto-setup

If you open this project in VS Code, it will prompt you to install recommended extensions automatically.

## 🐛 Troubleshooting

### Common Issues

**"bun: command not found"**

```bash
# Restart your terminal after installing Bun
# Or manually add to your shell profile:
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc  # or ~/.zshrc
source ~/.bashrc  # or ~/.zshrc
```

**Wrong Bun version**

```bash
# Check current version
bun --version

# Should show 1.2.18
# If not, the .bun-version file should auto-switch
# Or manually: bun use 1.2.18
```

**Dependencies not installing**

```bash
# Clear cache and reinstall
rm -rf node_modules
rm bun.lockb
bun install
```

**Linting errors**

```bash
# Fix auto-fixable issues
bun run lint:fix

# Format code
bun run format
```

## 🚀 CI/CD

The project uses GitHub Actions for continuous integration:

- **Code Quality**: ESLint, Prettier, TypeScript checks
- **Security**: Dependency vulnerability scanning
- **Deployment**: Automatic deployment to GitHub Pages
- **Previews**: PR preview deployments

All CI/CD processes use **Bun 1.2.18** to match the development environment.

## 📚 Additional Resources

- [Bun Documentation](https://bun.sh/docs)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

This setup ensures consistent code quality, style, and helps catch issues early in the development process. The automated hooks make it easy to maintain standards without manual intervention.
