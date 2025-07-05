# Notely Web

A modern React application built with TypeScript, Vite, and **Bun** as the JavaScript runtime.

## 🚀 Built With

- **[Bun](https://bun.sh/)** - Fast JavaScript runtime (instead of Node.js)
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Build tool
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[ESLint](https://eslint.org/)** & **[Prettier](https://prettier.io/)** - Code quality

## 📋 Prerequisites

**Important: This project uses Bun, not Node.js!**

Install Bun if you haven't already:

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```

Verify installation:

```bash
bun --version
# Should show: 1.2.18
```

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd notely-web

# Install dependencies
bun install

# Start development server
bun dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## 📝 Available Scripts

```bash
# Development
bun dev                 # Start development server
bun build               # Build for production
bun preview             # Preview production build

# Code Quality
bun run lint            # Run ESLint
bun run lint:fix        # Fix ESLint issues
bun run format          # Format with Prettier
bun run format:check    # Check Prettier formatting
bun run type-check      # TypeScript type checking

# Package Management
bun add <package>       # Add dependency
bun add -d <package>    # Add dev dependency
bun remove <package>    # Remove dependency
```

## 🛠️ Development

This project includes:

- **Pre-commit hooks** - Automatic linting and formatting
- **Conventional commits** - Standardized commit messages
- **GitHub Actions** - CI/CD pipeline
- **VS Code integration** - Recommended extensions and settings

### Git Workflow

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve navigation bug"
git commit -m "docs: update README"
```

### Code Quality

Code is automatically formatted and linted on commit. You can also run manually:

```bash
bun run lint:fix && bun run format
```

## 📁 Project Structure

```
notely-web/
├── .bun-version        # Pins Bun version
├── .github/            # GitHub Actions workflows
├── .husky/             # Git hooks
├── .vscode/            # VS Code settings
├── public/             # Static assets
├── src/                # Source code
│   ├── components/     # React components
│   ├── assets/         # Images, fonts, etc.
│   └── main.tsx        # App entry point
├── bun.lock           # Dependency lockfile
└── package.json       # Project configuration
```

## 🚀 Deployment

The project automatically deploys to GitHub Pages on pushes to the main branch.

- **Production**: Automatic deployment from `main` branch
- **Previews**: Automatic preview deployments for pull requests

## 📚 Documentation

For detailed development setup and guidelines, see [DEV_SETUP.md](./DEV_SETUP.md).

## 🐛 Troubleshooting

**"bun: command not found"**

- Make sure Bun is installed and in your PATH
- Restart your terminal after installation

**Wrong Bun version**

- The project uses Bun 1.2.18 (specified in `.bun-version`)
- Bun should automatically switch to the correct version

**Dependencies not installing**

```bash
rm -rf node_modules bun.lockb
bun install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
