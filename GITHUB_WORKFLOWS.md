# GitHub Workflows & Automation

This document explains all the GitHub Actions workflows and automation set up for this project.

## 🔄 Workflows Overview

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

**Triggers:**

- Push to `main`, `master`, or `develop` branches
- Pull requests to `main`, `master`, or `develop` branches

**Jobs:**

#### Quality Checks

- **Matrix Strategy**: Tests on Node.js 20 and 22
- **Steps**:
  - Code formatting check with Prettier
  - ESLint linting
  - TypeScript type checking
  - Project build
  - Upload build artifacts

#### Dependency Security

- Security audit with `bun audit`
- OSSF Scorecard vulnerability assessment
- Runs in parallel with quality checks

#### Commit Message Linting

- Validates commit messages follow conventional format
- Only runs on pull requests
- Uses `commitlint` with configuration in `.commitlintrc.js`

#### Build Preview (PR only)

- Deploys PR previews to GitHub Pages
- Comments on PR with preview link
- Updates on every commit to the PR

#### Production Deploy

- Deploys to production on pushes to main/master
- Only runs after quality checks and security scans pass
- Uses GitHub Pages for deployment

### 2. CodeQL Security Analysis (`.github/workflows/codeql.yml`)

**Triggers:**

- Push to `main` or `master`
- Pull requests to `main` or `master`
- Weekly schedule (Mondays at 2 AM UTC)

**Features:**

- Automated security vulnerability scanning
- Analyzes JavaScript/TypeScript code
- Integrates with GitHub Security tab
- Uses security-and-quality query suite

### 3. Dependabot (`.github/dependabot.yml`)

**Features:**

- **Package Updates**: Weekly dependency updates
- **GitHub Actions Updates**: Weekly action version updates
- **Grouping**: Related packages grouped together
- **Auto-labeling**: Applies appropriate labels
- **Smart Scheduling**: Monday mornings to avoid disrupting development

**Dependency Groups:**

- Minor and patch updates (grouped together)
- Major updates (separate PRs)
- ESLint packages
- TypeScript packages
- React packages
- Build tools (Vite, Rollup, etc.)

## 📝 Templates

### Pull Request Template (`.github/pull_request_template.md`)

- Structured PR descriptions
- Type of change categorization
- Testing checklist
- Review guidelines
- Deployment notes

### Issue Templates

- **Bug Report** (`.github/ISSUE_TEMPLATE/bug_report.md`)
  - Environment details
  - Reproduction steps
  - Expected vs actual behavior
- **Feature Request** (`.github/ISSUE_TEMPLATE/feature_request.md`)
  - Problem statement
  - Proposed solution
  - Impact assessment

## ⚙️ Configuration

### Commit Message Format (`.commitlintrc.js`)

Uses conventional commits with these types:

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/changes
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commits
- `deps`/`deps-dev`: Dependency updates

## 🚀 Getting Started

### Initial Setup

1. **Enable GitHub Pages** (if you want automatic deployments):

   ```
   Repository Settings → Pages → Source: GitHub Actions
   ```

2. **Enable Dependabot Alerts**:

   ```
   Repository Settings → Security & analysis → Enable all features
   ```

3. **Configure Branch Protection** (recommended):

   ```
   Repository Settings → Branches → Add protection rule for main/master:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date
   - Include administrators
   ```

4. **Update Dependabot Reviewers**:
   - Edit `.github/dependabot.yml`
   - Replace `@me` with your GitHub username

### Custom Domain (Optional)

If you have a custom domain for GitHub Pages:

1. Add `CUSTOM_DOMAIN` variable in repository settings
2. Set the value to your domain (e.g., `example.com`)

## 🔧 Customization

### Adding New Workflow Jobs

To add new jobs to the CI pipeline:

1. Edit `.github/workflows/ci.yml`
2. Add new job following the existing pattern:

```yaml
new-job:
  name: My New Job
  runs-on: ubuntu-latest
  needs: [quality-checks] # Optional: job dependencies
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
    # Add your steps here
```

### Modifying Security Scans

To customize CodeQL analysis:

1. Edit `.github/workflows/codeql.yml`
2. Modify the `queries` field to add custom query suites
3. Add language support by modifying the matrix

### Environment-Specific Configurations

For different environments:

1. Use GitHub Environments in repository settings
2. Add environment-specific secrets and variables
3. Modify workflow conditions based on environment

## 📊 Monitoring & Notifications

### Workflow Status

- View workflow runs in the **Actions** tab
- Failed runs will send email notifications (if enabled)
- Check status badges in README (optional)

### Security Alerts

- Dependabot alerts appear in **Security** tab
- CodeQL findings appear in **Security** → **Code scanning**
- Weekly summary emails available

### PR Previews

- Preview links automatically posted as PR comments
- Previews updated on every commit
- Preview URLs follow pattern: `https://[owner].github.io/[repo]/preview/pr-[number]/`

## 🐛 Troubleshooting

### Common Issues

#### Workflow Permissions

If workflows fail with permission errors:

1. Go to Repository Settings → Actions → General
2. Set "Workflow permissions" to "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"

#### Build Failures

- Check Node.js/Bun version compatibility
- Verify all dependencies are properly installed
- Review build logs in Actions tab

#### Dependabot Issues

- Ensure repository has proper `package.json`
- Check that dependency groups don't conflict
- Verify reviewer/assignee usernames exist

#### CodeQL Analysis Failures

- Large codebases may need increased timeout
- Some custom build steps might interfere
- Check language configuration matches project

### Getting Help

- Check GitHub Actions documentation
- Review workflow logs for specific error messages
- Consider opening an issue with the workflow template

## 🎯 Best Practices

1. **Keep workflows fast**: Use caching and parallel jobs
2. **Secure secrets**: Never log sensitive information
3. **Test locally**: Use tools like `act` to test workflows locally
4. **Monitor costs**: Be aware of GitHub Actions usage limits
5. **Regular updates**: Keep action versions updated
6. **Documentation**: Update this file when modifying workflows

---

This automation setup provides comprehensive CI/CD, security scanning, dependency management, and collaboration tools to maintain code quality and streamline development workflow.
