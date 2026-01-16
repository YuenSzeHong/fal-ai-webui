# Pre-commit Hooks Setup

This project uses Husky and lint-staged to run automated checks before commits.

## What Gets Checked

Before each commit, the following checks are automatically run:

1. **Linting**: ESLint checks for code quality issues
2. **Formatting**: Prettier formats code consistently
3. **Type Checking**: TypeScript compiler validates types
4. **Build Check**: Ensures the project builds successfully

## Setup

After cloning the repository, run:

```bash
npm install
```

This will automatically set up the pre-commit hooks via the `prepare` script.

## Pre-commit Hook Behavior

The pre-commit hook will:

1. ✅ Run ESLint on staged `.js`, `.jsx`, `.ts`, `.tsx` files
2. ✅ Run Prettier on staged files
3. ✅ Run TypeScript type checking
4. ✅ Run full build check

If any check fails, the commit will be blocked until issues are fixed.

## Skipping Checks (Use Sparingly)

### Skip All Checks
```bash
git commit --no-verify -m "your message"
```

### Skip Build Check Only
```bash
SKIP_BUILD_CHECK=1 git commit -m "your message"
```

## Manual Commands

You can run these checks manually at any time:

```bash
# Lint and auto-fix
npm run lint:fix

# Type check
npm run type-check

# Full build
npm run build

# Run lint-staged on all staged files
npm run pre-commit
```

## Troubleshooting

### Hook doesn't run
Make sure `.husky/pre-commit` is executable:
```bash
chmod +x .husky/pre-commit
```

### Build is too slow for commits
Use the `SKIP_BUILD_CHECK` environment variable:
```bash
SKIP_BUILD_CHECK=1 git commit -m "WIP: changes"
```

### ESLint/Prettier conflicts
The project is configured to use Prettier for formatting and ESLint for code quality. They should not conflict, but if issues arise, check `.prettierrc.json` and ESLint configuration.

## CI/CD Integration

These same checks should be run in CI/CD pipelines to ensure code quality:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci
  
- name: Lint
  run: npm run lint
  
- name: Type check
  run: npm run type-check
  
- name: Build
  run: npm run build
```
